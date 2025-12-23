# Security Documentation

## Overview

This document outlines the security practices and considerations for Snake Arena Live. While this is an educational/demonstration project, it follows production-grade security best practices.

## Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimal necessary permissions
3. **Secure by Default** - Security built-in, not added later
4. **Fail Securely** - Errors don't expose sensitive information
5. **Keep It Simple** - Complexity is the enemy of security

## Authentication & Authorization

### Password Security

**Hashing Algorithm**: Bcrypt
- Computationally expensive (prevents brute force)
- Automatic salting (prevents rainbow table attacks)
- Adaptive (can increase cost as hardware improves)

```python
# Password hashing (backend/src/core/security.py)
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password
hashed = pwd_context.hash(plain_password)

# Verify password
pwd_context.verify(plain_password, hashed_password)
```

**Password Requirements**:
- Minimum length enforced by client validation
- Complexity requirements can be added
- Never stored in plain text
- Never logged or exposed in errors

### JWT Tokens

**Token Structure**:
```json
{
  "sub": "user_id",       // Subject (user identifier)
  "exp": 1234567890       // Expiration timestamp
}
```

**Security Features**:
- **Signed** with SECRET_KEY (HS256 algorithm)
- **Stateless** - no server-side session storage
- **Time-limited** - 30 minute expiration (configurable)
- **Cannot be forged** without SECRET_KEY

**Token Storage** (Frontend):
- Stored in memory (React context)
- Not in localStorage (vulnerable to XSS)
- Cleared on logout
- Automatically included in API requests

**Best Practices**:
- ✅ Use HTTPS in production (prevents token interception)
- ✅ Use strong SECRET_KEY (at least 32 random characters)
- ✅ Don't expose tokens in URLs (use headers)
- ✅ Implement token refresh if needed for longer sessions

### Protected Routes

**Backend** - FastAPI Dependency:
```python
from fastapi import Depends
from ..core.security import get_current_user

@router.post("/protected")
async def protected_endpoint(
    current_user: User = Depends(get_current_user)
):
    # current_user is automatically validated
    # 401 error if token is missing/invalid
```

**Frontend** - Auth Context:
```typescript
// Redirect to login if not authenticated
if (!user) {
  navigate('/login');
}
```

## Input Validation

### Backend Validation (Pydantic)

All API inputs are validated using Pydantic models:

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr  # Validates email format
    password: str = Field(min_length=8)
    username: str = Field(min_length=2, max_length=50)
```

**Automatic Protection**:
- Type validation
- Range validation
- Format validation (email, URLs, etc.)
- 422 error for invalid input

### SQL Injection Prevention

**SQLAlchemy ORM** provides automatic protection:

```python
# ✅ SAFE - Parameterized query
user = db.query(User).filter(User.email == email).first()

# ❌ UNSAFE - Don't do this
# db.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

**Never concatenate user input into SQL queries.**

### XSS Prevention

**React's Built-in Protection**:
- React escapes all content by default
- Safe to render user-generated content

```tsx
// ✅ SAFE - React escapes automatically
<div>{userProvidedContent}</div>

// ❌ UNSAFE - dangerouslySetInnerHTML bypasses protection
// <div dangerouslySetInnerHTML={{__html: userProvidedContent}} />
```

**Additional Measures**:
- Content Security Policy (CSP) headers
- Sanitize HTML if accepting rich text (not currently needed)

## CORS (Cross-Origin Resource Sharing)

**Configuration** (`backend/src/main.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Whitelist of allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Best Practices**:
- ✅ Whitelist specific origins (not `["*"]` in production)
- ✅ Use environment variables for configuration
- ✅ Include all legitimate frontend URLs

**.env Configuration**:
```bash
# Development
CORS_ORIGINS='["http://localhost","http://localhost:3000","http://localhost:8080"]'

# Production
CORS_ORIGINS='["https://yourdomain.com","https://www.yourdomain.com"]'
```

## Security Headers

### Nginx Configuration

Add these headers to `frontend/nginx.conf`:

```nginx
# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Prevent clickjacking
add_header X-Frame-Options "DENY" always;

# Enable XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

# HSTS (HTTPS only)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**What These Do**:
- **X-Content-Type-Options**: Prevents browser from MIME-sniffing
- **X-Frame-Options**: Prevents embedding in iframes (clickjacking)
- **X-XSS-Protection**: Browser XSS filter (legacy, but harmless)
- **Content-Security-Policy**: Restricts resource loading
- **HSTS**: Forces HTTPS for all requests

## Environment Variables & Secrets

### Secret Management

**NEVER commit secrets to Git!**

✅ **Good**:
```bash
# .env (gitignored)
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
DATABASE_URL=postgresql://user:password@localhost/db
```

❌ **Bad**:
```python
# Hardcoded in source code
SECRET_KEY = "my-secret-key"  # DON'T DO THIS
```

### .env.example

**Purpose**: Template for required environment variables

```bash
# .env.example (committed to Git)
SECRET_KEY=changeme_use_strong_random_key
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Setup**:
```bash
cp .env.example .env
# Edit .env with actual values
```

### Production Secrets

**Options**:
1. **Environment Variables** - Set on server/container
2. **Secret Management Service** - AWS Secrets Manager, HashiCorp Vault
3. **Kubernetes Secrets** - For K8s deployments

**Requirements**:
- ✅ Use strong, random SECRET_KEY (32+ characters)
- ✅ Change default passwords
- ✅ Rotate secrets periodically
- ✅ Limit access to production secrets

## Database Security

### Connection Security

**Production**:
- Use SSL/TLS for database connections
- Restrict database access to application servers only
- Use strong database passwords
- Regular security updates

**SQLAlchemy SSL**:
```python
DATABASE_URL = "postgresql://user:pass@host:5432/db?sslmode=require"
```

### Data Protection

**Sensitive Data**:
- Passwords: Hashed with bcrypt (never plain text)
- Email: Not publicly exposed
- User IDs: Internal, not guessable

**Backup Security**:
- Encrypt database backups
- Secure backup storage
- Test backup restoration

## Rate Limiting

### Why It's Important

Prevents:
- Brute force attacks (password guessing)
- DoS attacks (overwhelming server)
- Abuse (spam, scraping)

### Implementation Options

**Option 1: Nginx Rate Limiting**
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
}
```

**Option 2: Python Middleware**
```python
# slowapi or fastapi-limiter
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def login(...):
    ...
```

**Recommended Limits**:
- Login: 5 requests per minute per IP
- Signup: 3 requests per hour per IP
- API: 100 requests per minute per user

## HTTPS / TLS

### Why HTTPS is Required

- Encrypts data in transit
- Prevents man-in-the-middle attacks
- Required for modern web features
- SEO benefits

### Production Setup

**Option 1: Let's Encrypt** (Free)
```bash
# Using certbot
sudo certbot --nginx -d yourdomain.com
```

**Option 2: Cloud Provider**
- AWS ALB with ACM certificates
- Google Cloud Load Balancer
- Cloudflare (automatic)

**Nginx HTTPS Configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Dependency Security

### Vulnerability Scanning

**Backend (Python)**:
```bash
# Safety - checks for known vulnerabilities
pip install safety
safety check

# Or use GitHub Dependabot (automatic)
```

**Frontend (Node)**:
```bash
# npm audit
npm audit

# npm audit fix
npm audit fix

# Or use Snyk, GitHub Dependabot
```

### Best Practices

- ✅ Keep dependencies updated
- ✅ Review security advisories
- ✅ Use lock files (`uv.lock`, `package-lock.json`)
- ✅ Minimize dependencies
- ✅ Review dependency changes in PRs

## Logging & Monitoring

### What to Log

**✅ DO Log**:
- Failed login attempts
- 500 errors
- Security-related events
- API performance metrics

**❌ DON'T Log**:
- Passwords (even hashed)
- JWT tokens
- Credit card numbers
- Other sensitive data

### Security Monitoring

**Alerts**:
- Unusual login patterns
- High error rates
- Repeated failed authentication
- Unusual API usage

**Tools**:
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Security Information and Event Management (SIEM)

## Security Checklist

### Development

- [ ] No secrets in source code
- [ ] .env in .gitignore
- [ ] Input validation on all endpoints
- [ ] Using parameterized queries (ORM)
- [ ] Password hashing with bcrypt
- [ ] JWT tokens for auth
- [ ] CORS properly configured
- [ ] Dependencies updated

### Production

- [ ] HTTPS enabled
- [ ] Strong SECRET_KEY
- [ ] Database with authentication
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error messages don't leak data
- [ ] Logging configured (no sensitive data)
- [ ] Monitoring/alerting setup
- [ ] Regular security updates
- [ ] Backup strategy in place

## Vulnerability Reporting

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email the maintainers directly (or use GitHub Security Advisories)
3. Provide:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will:
- Acknowledge receipt within 48 hours
- Provide a fix timeline
- Credit you in the security advisory (if desired)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT.io](https://jwt.io/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)

## Disclaimer

This is a demonstration/educational project. While we follow best practices, it has not been professionally audited. Use appropriate caution if deploying to production with real user data.

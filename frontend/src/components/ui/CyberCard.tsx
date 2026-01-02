import React from 'react';
import { cn } from '@/lib/utils';

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent';
    interactive?: boolean;
}

const CyberCard: React.FC<CyberCardProps> = ({
    children,
    className,
    variant = 'primary',
    interactive = false,
    ...props
}) => {
    const getBorderColor = () => {
        switch (variant) {
            case 'secondary': return 'border-secondary';
            case 'accent': return 'border-accent';
            default: return 'border-primary';
        }
    };

    return (
        <div
            className={cn(
                "relative bg-card/80 backdrop-blur-md border p-6 overflow-hidden transition-all duration-300",
                getBorderColor(),
                interactive && "hover:scale-[1.02] hover:shadow-lg cursor-pointer",
                className
            )}
            {...props}
        >
            {/* Corner Accents */}
            <div className={cn("absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2", getBorderColor())} />
            <div className={cn("absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2", getBorderColor())} />
            <div className={cn("absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2", getBorderColor())} />
            <div className={cn("absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2", getBorderColor())} />

            {/* Content */}
            <div className="relative z-10 w-full">
                {children}
            </div>

            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};

export default CyberCard;

import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { api } from '@/services/api';
import { User } from '@/types/game';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CyberCard from '@/components/ui/CyberCard';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        try {
            const data = await api.admin.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.admin.deleteUser(userToDelete);
            toast({
                title: "Success",
                description: "User deleted successfully",
            });
            setUsers(users.filter(u => u.id !== userToDelete));
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast({
                title: "Error",
                description: "Failed to delete user",
                variant: "destructive",
            });
        } finally {
            setUserToDelete(null);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading users...</div>;
    }

    // ... (keep structure)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-glow">User Management</h2>

            <CyberCard className="bg-black/40 p-0 overflow-hidden" variant="secondary">
                <Table>
                    <TableHeader>
                        <TableRow className="border-secondary/20 hover:bg-transparent">
                            <TableHead className="text-secondary/70 font-display tracking-widest text-[10px] uppercase">Username</TableHead>
                            <TableHead className="text-secondary/70 font-display tracking-widest text-[10px] uppercase">Email</TableHead>
                            <TableHead className="text-secondary/70 font-display tracking-widest text-[10px] uppercase">Role</TableHead>
                            <TableHead className="text-secondary/70 font-display tracking-widest text-[10px] uppercase">Joined</TableHead>
                            <TableHead className="text-right text-secondary/70 font-display tracking-widest text-[10px] uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-secondary/10 hover:bg-secondary/5 transition-colors group">
                                <TableCell className="font-medium font-display text-secondary/90 group-hover:text-secondary group-hover:text-glow-secondary transition-all">
                                    {user.username}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>
                                    {user.is_superuser ? (
                                        <Badge variant="default" className="bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_hsl(var(--primary)/0.3)]">ADMIN</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/30">USER</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs font-mono">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={user.id === currentUser?.id}
                                        onClick={() => setUserToDelete(user.id)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CyberCard>

            {/* Keeping AlertDialog same as it's a functional modal */}
            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent className="bg-card border-destructive/50 shadow-[0_0_50px_hsl(var(--destructive)/0.1)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive font-display">TERMINATE USER?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            and all their associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-primary/20 hover:bg-primary/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_15px_hsl(var(--destructive)/0.5)]">
                            TERMINATE
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminUsers;

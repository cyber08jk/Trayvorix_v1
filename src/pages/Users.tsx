import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { getAllProfiles, updateUserProfile, Profile } from '@services/profile';
import { Modal } from '@components/common/Modal';

export function Users() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRole, setEditingRole] = useState<string>('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllProfiles();
            setUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUser) return;

        try {
            await updateUserProfile(selectedUser.id, { role: editingRole });
            showToast('User role updated successfully', 'success');
            fetchUsers();
            setShowEditModal(false);
        } catch (error: any) {
            showToast(error.message || 'Failed to update role', 'error');
        }
    };

    const getRoleBadge = (role?: string) => {
        const roleColors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            operator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            auditor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            vendor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };

        const roleName = role || 'operator';
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[roleName] || roleColors.operator}`}>
                {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
            </span>
        );
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    const columns = [
        {
            key: 'full_name',
            header: 'Name',
            sortable: true,
            render: (user: Profile) => (
                <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {user.full_name?.charAt(0) || '?'}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || ''}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (user: Profile) => getRoleBadge(user.role),
        },
        {
            key: 'location',
            header: 'Location',
            render: (user: Profile) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.location || '-'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Joined',
            render: (user: Profile) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (user: Profile) => (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                        setSelectedUser(user);
                        setEditingRole(user.role || 'operator');
                        setShowEditModal(true);
                    }}
                >
                    Edit Role
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage system users and their roles
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                            {users.length} Total Users
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <div className="mb-6">
                    <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {loading ? (
                    <TableSkeleton rows={5} columns={5} />
                ) : (
                    <Table
                        data={filteredUsers}
                        columns={columns}
                        emptyMessage="No users found."
                    />
                )}
            </Card>

            {selectedUser && (
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit User Role"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                User
                            </label>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.full_name || 'No Name'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Role
                            </label>
                            <select
                                value={editingRole}
                                onChange={(e) => setEditingRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="admin">Admin</option>
                                <option value="operator">Operator</option>
                                <option value="auditor">Auditor</option>
                                <option value="vendor">Vendor</option>
                            </select>
                            <p className="mt-2 text-xs text-gray-500">
                                Admins have full access. Operators can manage inventory. Auditors can view logs.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="secondary"
                                onClick={() => setShowEditModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleUpdateRole}
                                className="flex-1"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

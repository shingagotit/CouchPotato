import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/movie';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  ShieldCheck,
  Trash2,
  Search,
  ArrowLeft,
  BarChart3,
  Activity,
  TrendingUp,
  MessageSquare,
  Settings,
  Crown,
  UserMinus
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin' && user.email !== 'admin@couchpotato.com') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getStoredUsers();
    setUsers(allUsers);
    setLastUpdate(new Date());
  };

  const handleUserAction = async (action: 'approve' | 'deny' | 'promote' | 'demote' | 'delete', userId: string) => {
    setIsLoading(true);
    try {
      let success = false;
      let message = '';

      switch (action) {
        case 'approve':
          success = authService.approveUser(userId);
          message = success ? 'User approved successfully!' : 'Failed to approve user';
          break;
        case 'deny':
          success = authService.denyUser(userId);
          message = success ? 'User denied successfully!' : 'Failed to deny user';
          break;
        case 'promote':
          success = authService.promoteToAdmin(userId);
          message = success ? 'User promoted to admin!' : 'Failed to promote user';
          break;
        case 'demote':
          success = authService.demoteFromAdmin(userId);
          message = success ? 'User demoted to regular user!' : 'Failed to demote user';
          break;
        case 'delete':
          success = authService.deleteUser(userId);
          message = success ? 'User deleted successfully!' : 'Failed to delete user';
          break;
      }

      if (success) {
        // Send Telegram notification
        try {
          const targetUser = users.find(u => u.id === userId);
          const telegramMessage = `🔧 Admin Action Performed\n\n👤 User: ${targetUser?.name} (${targetUser?.email})\n🎯 Action: ${action.toUpperCase()}\n👨‍💼 Admin: ${user?.name}\n🕒 Time: ${new Date().toLocaleString()}`;
          await authService.sendTelegramConfirmation(telegramMessage);
        } catch (telegramError) {
          console.warn('Failed to send Telegram notification:', telegramError);
        }
        
        loadUsers(); // Reload users
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    denied: users.filter(u => u.status === 'denied').length,
    admins: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><UserCheck className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 hover:bg-red-600"><UserX className="w-3 h-3 mr-1" />Denied</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    return role === 'admin' 
      ? <Badge className="bg-purple-500 hover:bg-purple-600"><Crown className="w-3 h-3 mr-1" />Admin</Badge>
      : <Badge variant="outline"><Shield className="w-3 h-3 mr-1" />User</Badge>;
  };

  if (user?.role !== 'admin' && user?.email !== 'admin@couchpotato.com') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              size="icon"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <img 
                  src="/CP.png" 
                  alt="CouchPotato Logo" 
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              </div>
              <p className="text-purple-200 mt-1">Manage users and system settings</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-300">Welcome back, {user?.name}</p>
            <p className="text-xs text-purple-400">Last updated: {lastUpdate.toLocaleString()}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">Pending</p>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-300">Approved</p>
                  <p className="text-2xl font-bold text-white">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm text-gray-300">Denied</p>
                  <p className="text-2xl font-bold text-white">{stats.denied}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-300">Admins</p>
                  <p className="text-2xl font-bold text-white">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-300">Regular</p>
                  <p className="text-2xl font-bold text-white">{stats.regularUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="telegram" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Telegram Bot
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      User Management
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage user accounts, permissions, and access
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={loadUsers}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, status, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                {/* Users List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                    </p>
                  ) : (
                    filteredUsers.map((userData) => (
                      <div key={userData.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium">{userData.name}</h3>
                            {getRoleBadge(userData.role)}
                            {getStatusBadge(userData.status)}
                          </div>
                          <p className="text-gray-300 text-sm">{userData.email}</p>
                          <p className="text-gray-400 text-xs">ID: {userData.id}</p>
                          <p className="text-gray-400 text-xs">
                            Registered: {new Date(userData.createdAt).toLocaleString()}
                            {userData.approvedAt && ` • Approved: ${new Date(userData.approvedAt).toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Status Actions */}
                          {userData.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleUserAction('approve', userData.id)}
                                disabled={isLoading}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleUserAction('deny', userData.id)}
                                disabled={isLoading}
                                size="sm"
                                variant="destructive"
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Deny
                              </Button>
                            </>
                          )}

                          {userData.status === 'denied' && (
                            <Button
                              onClick={() => handleUserAction('approve', userData.id)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}

                          {userData.status === 'approved' && (
                            <Button
                              onClick={() => handleUserAction('deny', userData.id)}
                              disabled={isLoading}
                              size="sm"
                              variant="destructive"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          )}

                          {/* Role Actions */}
                          {userData.role === 'user' && userData.status === 'approved' && (
                            <Button
                              onClick={() => handleUserAction('promote', userData.id)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <ShieldCheck className="w-4 h-4 mr-1" />
                              Make Admin
                            </Button>
                          )}

                          {userData.role === 'admin' && userData.id !== user?.id && (
                            <Button
                              onClick={() => handleUserAction('demote', userData.id)}
                              disabled={isLoading}
                              size="sm"
                              variant="outline"
                              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                            >
                              <UserMinus className="w-4 h-4 mr-1" />
                              Remove Admin
                            </Button>
                          )}

                          {/* Delete Action */}
                          {userData.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{userData.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleUserAction('delete', userData.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Telegram Bot Tab */}
          <TabsContent value="telegram">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Telegram Bot Management
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Access the Telegram bot interface for remote user management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => navigate('/admin/telegram')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Telegram Interface
                  </Button>
                  <Button 
                    onClick={() => window.open('/telegram-helper.html', '_blank')}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Telegram Helper Tool
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Registrations</span>
                      <span className="text-white font-bold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Approval Rate</span>
                      <span className="text-white font-bold">
                        {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Admin Ratio</span>
                      <span className="text-white font-bold">
                        {stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Active Users</span>
                      <span className="text-green-400 font-bold">{stats.approved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Pending Reviews</span>
                      <span className="text-yellow-400 font-bold">{stats.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">System Health</span>
                      <span className="text-green-400 font-bold">Healthy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Auto-Approval Settings</h4>
                    <p className="text-gray-300 text-sm mb-3">Configure automatic user approval rules</p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Configure Rules
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Telegram Integration</h4>
                    <p className="text-gray-300 text-sm mb-3">Manage Telegram bot settings and notifications</p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Bot Settings
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Data Management</h4>
                    <p className="text-gray-300 text-sm mb-3">Export user data and manage backups</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Export Data
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Create Backup
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

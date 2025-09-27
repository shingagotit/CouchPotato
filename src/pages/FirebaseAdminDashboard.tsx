import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FirebaseUser, firebaseAuthService } from '@/lib/firebase-auth';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldCheck, 
  Unlock, 
  RefreshCw,
  Search,
  Crown,
  AlertCircle
} from 'lucide-react';

const FirebaseAdminDashboard: React.FC = () => {
  const { user, isAdmin } = useFirebaseAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await firebaseAuthService.getAllUsers();
      setUsers(allUsers);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (action: 'approve' | 'deny' | 'promote' | 'demote' | 'unlock', userId: string) => {
    try {
      setIsLoading(true);
      
      switch (action) {
        case 'approve':
          await firebaseAuthService.approveUser(userId);
          break;
        case 'deny':
          await firebaseAuthService.denyUser(userId);
          break;
        case 'promote':
          await firebaseAuthService.promoteToAdmin(userId);
          break;
        case 'demote':
          await firebaseAuthService.demoteFromAdmin(userId);
          break;
        case 'unlock':
          await firebaseAuthService.unlockUser(userId);
          break;
      }
      
      await loadUsers();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><UserCheck className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 hover:bg-red-600"><UserX className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' 
      ? <Badge className="bg-purple-500 hover:bg-purple-600"><Crown className="w-3 h-3 mr-1" />Admin</Badge>
      : <Badge variant="outline"><Shield className="w-3 h-3 mr-1" />User</Badge>;
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    approved: users.filter(u => u.status === 'approved').length,
    pending: users.filter(u => u.status === 'pending').length,
    denied: users.filter(u => u.status === 'denied').length,
    admins: users.filter(u => u.role === 'admin').length,
    locked: users.filter(u => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length
  };

  if (!isAdmin) {
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
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              ← Back to Home
            </Button>
            <div className="flex items-center space-x-3">
              <img 
                src={`${import.meta.env.BASE_URL}CP.png`} 
                alt="CouchPotato Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-4xl font-bold text-white">Firebase Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={loadUsers} 
              disabled={isLoading}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="text-sm text-white/80">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm opacity-80">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/20 border-green-400/30 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm opacity-80">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-500/20 border-yellow-400/30 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm opacity-80">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/20 border-red-400/30 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5" />
                <div>
                  <p className="text-2xl font-bold">{stats.denied}</p>
                  <p className="text-sm opacity-80">Denied</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-500/20 border-purple-400/30 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <div>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-sm opacity-80">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/20 border-orange-400/30 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Unlock className="w-5 h-5" />
                <div>
                  <p className="text-2xl font-bold">{stats.locked}</p>
                  <p className="text-sm opacity-80">Locked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20">User Management</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Search */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-white/60" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <div className="grid gap-4">
              {filteredUsers.map((userData) => (
                <Card key={userData.uid} className="bg-white/10 border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {userData.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{userData.displayName}</h3>
                          <p className="text-white/60">{userData.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {getStatusBadge(userData.status)}
                            {getRoleBadge(userData.role)}
                            {userData.lockedUntil && new Date(userData.lockedUntil) > new Date() && (
                              <Badge className="bg-orange-500 hover:bg-orange-600">
                                <Unlock className="w-3 h-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {userData.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleUserAction('approve', userData.uid)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleUserAction('deny', userData.uid)}
                              disabled={isLoading}
                              size="sm"
                              variant="destructive"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Deny
                            </Button>
                          </>
                        )}
                        
                        {userData.status === 'approved' && userData.role === 'user' && (
                          <Button
                            onClick={() => handleUserAction('promote', userData.uid)}
                            disabled={isLoading}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            Make Admin
                          </Button>
                        )}
                        
                        {userData.role === 'admin' && userData.uid !== user?.uid && (
                          <Button
                            onClick={() => handleUserAction('demote', userData.uid)}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Remove Admin
                          </Button>
                        )}
                        
                        {userData.lockedUntil && new Date(userData.lockedUntil) > new Date() && (
                          <Button
                            onClick={() => handleUserAction('unlock', userData.uid)}
                            disabled={isLoading}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Unlock className="w-4 h-4 mr-1" />
                            Unlock
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-white/60">
                      <p>Created: {new Date(userData.createdAt).toLocaleDateString()}</p>
                      {userData.lastLogin && (
                        <p>Last Login: {new Date(userData.lastLogin).toLocaleDateString()}</p>
                      )}
                      {userData.loginAttempts && userData.loginAttempts > 0 && (
                        <p>Failed Attempts: {userData.loginAttempts}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Registration trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-white/60">Analytics coming soon...</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Firebase service status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Authentication</span>
                      <Badge className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Firestore</span>
                      <Badge className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Storage</span>
                      <Badge className="bg-green-500">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FirebaseAdminDashboard;

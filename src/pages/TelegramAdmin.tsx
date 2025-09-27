import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { User } from '@/types/movie';
import { CheckCircle, XCircle, Clock, Users, MessageSquare, RefreshCw } from 'lucide-react';

const TelegramAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getStoredUsers();
    setUsers(allUsers);
    setLastUpdate(new Date());
  };

  const handleCommand = async () => {
    if (!command.trim()) return;

    setIsProcessing(true);
    try {
      const result = await authService.processTelegramCommand(command);
      setResponse(result);
      
      // Send confirmation to Telegram
      try {
        await authService.sendTelegramConfirmation(result);
      } catch (telegramError) {
        console.warn('Failed to send Telegram confirmation:', telegramError);
      }
      
      // Reload users to show updated status
      loadUsers();
      setCommand('');
    } catch (error) {
      setResponse(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectAction = async (action: 'approve' | 'deny', userId: string) => {
    setIsProcessing(true);
    try {
      const result = authService.executeUserAction(action, userId);
      setResponse(result);
      
      // Send confirmation to Telegram
      try {
        await authService.sendTelegramConfirmation(result);
      } catch (telegramError) {
        console.warn('Failed to send Telegram confirmation:', telegramError);
      }
      
      // Reload users to show updated status
      loadUsers();
    } catch (error) {
      setResponse(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');
  const deniedUsers = users.filter(u => u.status === 'denied');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img 
              src={`${import.meta.env.BASE_URL}CP.png`} 
              alt="CouchPotato Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CouchPotato Admin</h1>
          <p className="text-purple-200">Telegram Bot Management Panel</p>
          <p className="text-sm text-purple-300">Last updated: {lastUpdate.toLocaleString()}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
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
                  <p className="text-2xl font-bold text-white">{pendingUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-300">Approved</p>
                  <p className="text-2xl font-bold text-white">{approvedUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm text-gray-300">Denied</p>
                  <p className="text-2xl font-bold text-white">{deniedUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Command Interface */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Telegram Command Simulator
            </CardTitle>
            <CardDescription className="text-gray-300">
              Test Telegram commands here. Commands will also be sent to your Telegram chat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter command (e.g., 'list', 'approve user-id', 'deny user-id')"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
              />
              <Button 
                onClick={handleCommand} 
                disabled={isProcessing || !command.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Execute'}
              </Button>
              <Button 
                onClick={loadUsers} 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            {response && (
              <Textarea
                value={response}
                readOnly
                className="bg-white/10 border-white/20 text-white min-h-[100px]"
                placeholder="Command response will appear here..."
              />
            )}
          </CardContent>
        </Card>

        {/* Pending Users */}
        {pendingUsers.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Pending Users ({pendingUsers.length})
              </CardTitle>
              <CardDescription className="text-gray-300">
                Users waiting for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <p className="text-gray-300 text-sm">{user.email}</p>
                      <p className="text-gray-400 text-xs">ID: {user.id}</p>
                      <p className="text-gray-400 text-xs">Registered: {new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(user.status)}
                      <Button
                        onClick={() => handleDirectAction('approve', user.id)}
                        disabled={isProcessing}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleDirectAction('deny', user.id)}
                        disabled={isProcessing}
                        size="sm"
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              All Users ({users.length})
            </CardTitle>
            <CardDescription className="text-gray-300">
              Complete user management overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No users registered yet.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <p className="text-gray-300 text-sm">{user.email}</p>
                      <p className="text-gray-400 text-xs">ID: {user.id}</p>
                      <p className="text-gray-400 text-xs">
                        Registered: {new Date(user.createdAt).toLocaleString()}
                        {user.approvedAt && ` • Approved: ${new Date(user.approvedAt).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(user.status)}
                      {user.status !== 'approved' && (
                        <Button
                          onClick={() => handleDirectAction('approve', user.id)}
                          disabled={isProcessing}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {user.status !== 'denied' && (
                        <Button
                          onClick={() => handleDirectAction('deny', user.id)}
                          disabled={isProcessing}
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Telegram Commands</CardTitle>
            <CardDescription className="text-gray-300">
              Available commands for your Telegram bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                <strong className="text-white">Basic Commands:</strong>
              </div>
              <ul className="text-gray-400 space-y-1 ml-4">
                <li>• <code className="bg-white/10 px-2 py-1 rounded">list</code> - Show all pending users</li>
                <li>• <code className="bg-white/10 px-2 py-1 rounded">help</code> - Show help message</li>
                <li>• <code className="bg-white/10 px-2 py-1 rounded">approve [user-id]</code> - Approve specific user</li>
                <li>• <code className="bg-white/10 px-2 py-1 rounded">deny [user-id]</code> - Deny specific user</li>
              </ul>
              <div className="text-gray-300 mt-4">
                <strong className="text-white">Quick Actions:</strong>
              </div>
              <ul className="text-gray-400 space-y-1 ml-4">
                <li>• Reply <code className="bg-white/10 px-2 py-1 rounded">approve</code> to registration messages</li>
                <li>• Reply <code className="bg-white/10 px-2 py-1 rounded">deny</code> to registration messages</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramAdmin;

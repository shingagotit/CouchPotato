import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { enhancedAuthService } from '@/lib/enhanced-auth';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedLoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToPasswordReset: () => void;
}

const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({ 
  onSwitchToRegister, 
  onSwitchToPasswordReset 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await enhancedAuthService.login(email, password);
      if (user) {
        await login(email, password); // This will trigger the video and navigation
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'admin' | 'demo') => {
    setIsLoading(true);
    setError('');

    try {
      const credentials = userType === 'admin' 
        ? { email: 'admin@couchpotato.com', password: 'admin123' }
        : { email: 'demo@couchpotato.com', password: 'demo123' };

      // Create demo user if it doesn't exist
      if (userType === 'demo') {
        try {
          await enhancedAuthService.register(
            'Demo User',
            'demo@couchpotato.com',
            'demo123',
            'What is the name of this streaming platform?',
            'couchpotato'
          );
        } catch (error) {
          // User might already exist, that's okay
        }
      }

      const user = await enhancedAuthService.login(credentials.email, credentials.password);
      if (user) {
        await login(credentials.email, credentials.password);
      }
    } catch (error: any) {
      setError(error.message || 'Quick login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to your CouchPotato account</p>
      </div>

      {error && (
        <Alert className="border-destructive">
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Signing in...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </div>
          )}
        </Button>
      </form>

      {/* Quick Login Options */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Quick Login</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickLogin('admin')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Admin
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickLogin('demo')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Demo
          </Button>
        </div>
      </div>

      {/* Action Links */}
      <div className="space-y-4">
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToPasswordReset}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Forgot your password?
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">New to CouchPotato?</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onSwitchToRegister}
          className="w-full"
        >
          Create Account
        </Button>
      </div>

      {/* Demo Credentials Info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Demo Credentials:</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Admin:</strong> admin@couchpotato.com / admin123</div>
          <div><strong>Demo:</strong> demo@couchpotato.com / demo123</div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoginForm;

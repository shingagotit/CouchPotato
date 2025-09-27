import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, User } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface FirebaseLoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToPasswordReset: () => void;
}

const FirebaseLoginForm: React.FC<FirebaseLoginFormProps> = ({ 
  onSwitchToRegister, 
  onSwitchToPasswordReset 
}) => {
  const { signIn } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userType: 'admin' | 'personal' | 'demo') => {
    setIsLoading(true);
    setError('');

    try {
      const credentials = userType === 'admin' 
        ? { email: 'admin@couchpotato.com', password: 'admin123' }
        : userType === 'personal'
        ? { email: 'tashingachitambira@gmail.com', password: 'CouchPotato2024!' }
        : { email: 'demo@couchpotato.com', password: 'demo123' };

      await signIn(credentials.email, credentials.password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">Welcome Back!</h2>
        <p className="text-muted-foreground mt-2">
          Sign in to your CouchPotato account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-7 h-8 px-3 py-2"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <LogIn className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link" onClick={onSwitchToPasswordReset} className="px-0">
          Forgot your password?
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Quick Login</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleQuickLogin('admin')}
          disabled={isLoading}
          className="flex items-center gap-1 text-xs"
        >
          <KeyRound className="h-3 w-3" />
          Admin
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleQuickLogin('personal')}
          disabled={isLoading}
          className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 border-purple-200"
        >
          <User className="h-3 w-3" />
          Personal
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleQuickLogin('demo')}
          disabled={isLoading}
          className="flex items-center gap-1 text-xs"
        >
          <UserPlus className="h-3 w-3" />
          Demo
        </Button>
      </div>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          Don't have an account?{' '}
        </span>
        <Button variant="link" onClick={onSwitchToRegister} className="px-0">
          Create Account
        </Button>
      </div>

      {/* Demo Credentials Info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Available Accounts:</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Admin:</strong> admin@couchpotato.com / admin123</div>
          <div><strong>Personal:</strong> tashingachitambira@gmail.com / CouchPotato2024!</div>
          <div><strong>Demo:</strong> demo@couchpotato.com / demo123</div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseLoginForm;

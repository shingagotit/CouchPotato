import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FirebaseRegisterFormProps {
  onSwitchToLogin: () => void;
  onRegistrationSuccess: () => void;
}

const FirebaseRegisterForm: React.FC<FirebaseRegisterFormProps> = ({ 
  onSwitchToLogin, 
  onRegistrationSuccess 
}) => {
  const { signUp } = useFirebaseAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value as string));
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length > 5) strength += 20;
    if (password.length > 7) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return Math.min(100, strength);
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    if (formData.securityQuestion && !formData.securityAnswer) {
      setError('Security answer is required if a security question is provided');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.securityQuestion || undefined,
        formData.securityAnswer || undefined
      );
      onRegistrationSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">Join CouchPotato</h2>
        <p className="text-muted-foreground mt-2">
          Create your account to start watching
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
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
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
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
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
              style={{ width: `${passwordStrength}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Password strength: {passwordStrength}%
          </p>
        </div>

        <div className="relative">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Security Question (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="securityQuestion">Security Question (Optional)</Label>
          <Select 
            value={formData.securityQuestion} 
            onValueChange={(value) => handleInputChange('securityQuestion', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a security question" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="What is your mother's maiden name?">What is your mother's maiden name?</SelectItem>
              <SelectItem value="What was the name of your first pet?">What was the name of your first pet?</SelectItem>
              <SelectItem value="What city were you born in?">What city were you born in?</SelectItem>
              <SelectItem value="What is your favorite movie?">What is your favorite movie?</SelectItem>
            </SelectContent>
          </Select>
          {formData.securityQuestion && (
            <div>
              <Label htmlFor="securityAnswer">Your Answer</Label>
              <Input
                id="securityAnswer"
                type="password"
                placeholder="Enter your answer"
                value={formData.securityAnswer}
                onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          Already have an account?{' '}
        </span>
        <Button variant="link" onClick={onSwitchToLogin} className="px-0">
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default FirebaseRegisterForm;

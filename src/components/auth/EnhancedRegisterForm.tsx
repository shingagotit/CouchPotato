import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, UserPlus, ArrowLeft, Shield } from 'lucide-react';
import { enhancedAuthService } from '@/lib/enhanced-auth';

interface EnhancedRegisterFormProps {
  onSwitchToLogin: () => void;
  onRegistrationSuccess: () => void;
}

const securityQuestions = [
  'What is the name of your first pet?',
  'What city were you born in?',
  'What is your mother\'s maiden name?',
  'What was the name of your first school?',
  'What is your favorite movie?',
  'What is the name of this streaming platform?',
  'What street did you grow up on?',
  'What is your favorite food?'
];

const EnhancedRegisterForm: React.FC<EnhancedRegisterFormProps> = ({ 
  onSwitchToLogin, 
  onRegistrationSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [enableSecurity, setEnableSecurity] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!formData.password) {
      setError('Please enter a password.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (enableSecurity) {
      if (!formData.securityQuestion) {
        setError('Please select a security question.');
        return false;
      }

      if (!formData.securityAnswer.trim()) {
        setError('Please provide an answer to your security question.');
        return false;
      }
    }

    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await enhancedAuthService.register(
        formData.name,
        formData.email,
        formData.password,
        enableSecurity ? formData.securityQuestion : undefined,
        enableSecurity ? formData.securityAnswer : undefined
      );
      
      onRegistrationSuccess();
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-green-600'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Create Account</h2>
        <p className="text-muted-foreground">Join CouchPotato for unlimited streaming</p>
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
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              autoComplete="new-password"
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
          
          {formData.password && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Password strength: {strengthLabels[passwordStrength - 1] || 'Too short'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Security Question Section */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableSecurity"
              checked={enableSecurity}
              onCheckedChange={setEnableSecurity}
            />
            <Label htmlFor="enableSecurity" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Enable password recovery (Recommended)
            </Label>
          </div>

          {enableSecurity && (
            <>
              <div className="space-y-2">
                <Label htmlFor="securityQuestion">Security Question</Label>
                <Select
                  value={formData.securityQuestion}
                  onValueChange={(value) => handleInputChange('securityQuestion', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a security question" />
                  </SelectTrigger>
                  <SelectContent>
                    {securityQuestions.map((question, index) => (
                      <SelectItem key={index} value={question}>
                        {question}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Security Answer</Label>
                <Input
                  id="securityAnswer"
                  type="text"
                  placeholder="Enter your answer"
                  value={formData.securityAnswer}
                  onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will help you recover your password if you forget it
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={agreeToTerms}
            onCheckedChange={setAgreeToTerms}
          />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the{' '}
            <button type="button" className="text-primary hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary hover:underline">
              Privacy Policy
            </button>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating Account...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Account
            </div>
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onSwitchToLogin}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Already have an account? Sign in
        </Button>
      </div>
    </div>
  );
};

export default EnhancedRegisterForm;

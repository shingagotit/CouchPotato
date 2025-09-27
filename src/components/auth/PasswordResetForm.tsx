import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { enhancedAuthService } from '@/lib/enhanced-auth';

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

type ResetMethod = 'email' | 'security' | 'token';

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBackToLogin }) => {
  const [resetMethod, setResetMethod] = useState<ResetMethod>('email');
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>('');

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await enhancedAuthService.requestPasswordReset(email);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        if (result.resetToken) {
          // For demo purposes, show the token
          setGeneratedToken(result.resetToken);
          setResetToken(result.resetToken);
          setStep('reset');
          setResetMethod('token');
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !securityAnswer.trim() || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await enhancedAuthService.resetPasswordWithSecurityQuestion(
        email,
        securityAnswer,
        newPassword
      );
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => onBackToLogin(), 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await enhancedAuthService.resetPassword(resetToken, newPassword);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => onBackToLogin(), 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSecurityQuestion = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address first.' });
      return;
    }

    const users = enhancedAuthService.getStoredUsers();
    const user = users.find(u => u.email === email.toLowerCase().trim());
    
    if (user && user.securityQuestion) {
      setSecurityQuestion(user.securityQuestion);
    } else {
      setMessage({ type: 'error', text: 'No security question found for this email address.' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-card/80 backdrop-blur-strong border border-border shadow-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-600 to-red-500 rounded-full">
            <Key className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Reset Password</CardTitle>
          <CardDescription>
            Choose a method to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <Alert className={message.type === 'error' ? 'border-destructive' : 'border-green-500'}>
              <AlertDescription className={message.type === 'error' ? 'text-destructive' : 'text-green-600'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {generatedToken && (
            <Alert className="border-blue-500">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-blue-600">
                <strong>Demo Mode:</strong> Your reset token is: <code className="bg-blue-100 px-2 py-1 rounded text-sm">{generatedToken}</code>
                <br />
                <small>In production, this would be sent to your email.</small>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={resetMethod} onValueChange={(value) => setResetMethod(value as ResetMethod)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="token" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Token
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <form onSubmit={handleSecurityReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="security-email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="security-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="button" variant="outline" onClick={checkSecurityQuestion}>
                      Check
                    </Button>
                  </div>
                </div>

                {securityQuestion && (
                  <>
                    <div className="space-y-2">
                      <Label>Security Question</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{securityQuestion}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="security-answer">Your Answer</Label>
                      <Input
                        id="security-answer"
                        type="text"
                        placeholder="Enter your security answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
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

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>

            <TabsContent value="token" className="space-y-4">
              <form onSubmit={handleTokenReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-token">Reset Token</Label>
                  <Input
                    id="reset-token"
                    type="text"
                    placeholder="Enter your reset token"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the reset token you received via email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token-new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="token-new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
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

                <div className="space-y-2">
                  <Label htmlFor="token-confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="token-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-center pt-4">
            <Button
              variant="ghost"
              onClick={onBackToLogin}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetForm;

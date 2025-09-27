import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

interface FirebasePasswordResetFormProps {
  onBackToLogin: () => void;
}

const FirebasePasswordResetForm: React.FC<FirebasePasswordResetFormProps> = ({ onBackToLogin }) => {
  const { sendPasswordReset } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await sendPasswordReset(email);
      setIsEmailSent(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary">Check Your Email</h2>
          <p className="text-muted-foreground mt-2">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p>Please check your email and click the reset link to create a new password.</p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, check your spam folder or try again.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
            }} 
            variant="outline" 
            className="w-full"
          >
            Send Another Email
          </Button>
          
          <Button onClick={onBackToLogin} variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">Reset Your Password</h2>
        <p className="text-muted-foreground mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link" onClick={onBackToLogin} className="px-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Need Help?</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Make sure you're using the correct email address</p>
          <p>• Check your spam/junk folder for the reset email</p>
          <p>• The reset link expires after 1 hour</p>
          <p>• Contact support if you continue having issues</p>
        </div>
      </div>
    </div>
  );
};

export default FirebasePasswordResetForm;

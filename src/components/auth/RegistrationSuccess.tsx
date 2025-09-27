import React from 'react';
import { CheckCircle, Clock, Mail, MessageCircle } from 'lucide-react';
import { NetflixButton } from '@/components/ui/netflix-button';

interface RegistrationSuccessProps {
  onBackToLogin: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ onBackToLogin }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">Registration Successful!</h1>
        
        <div className="space-y-4 text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>Account request sent successfully</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Admin has been notified via Telegram</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Check back in 24 hours for access</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 border border-border rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-3">What happens next?</h3>
        <div className="space-y-3 text-sm text-muted-foreground text-left">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span>Your registration request has been sent to our admin team via Telegram</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span>We'll review your application within 24 hours</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span>Once approved, you can log in and start streaming unlimited content</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <span>If denied, you can contact support for more information</span>
          </div>
        </div>
      </div>

      <NetflixButton
        onClick={onBackToLogin}
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
        size="lg"
      >
        Back to Login
      </NetflixButton>

      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary font-medium">
          💡 Tip: Bookmark this page and return in 24 hours to check your access status!
        </p>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>Having issues? The admin will receive your request automatically.</p>
      </div>
    </div>
  );
};

export default RegistrationSuccess;

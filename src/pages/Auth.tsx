import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import RegistrationSuccess from '@/components/auth/RegistrationSuccess';

type AuthView = 'login' | 'register' | 'success';

const Auth: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleSwitchToRegister = () => setCurrentView('register');
  const handleSwitchToLogin = () => setCurrentView('login');
  const handleRegistrationSuccess = () => setCurrentView('success');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-primary/8 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-card/80 backdrop-blur-strong border border-border rounded-2xl shadow-card p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <img 
                src={`${import.meta.env.BASE_URL}CP.png`} 
                alt="CouchPotato Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to a simple icon if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('.fallback-icon')) {
                    parent.innerHTML = '<div class="fallback-icon w-20 h-20 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center text-white text-3xl font-bold">CP</div>';
                  }
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">CouchPotato</h1>
            <p className="text-muted-foreground">Premium Streaming Experience</p>
          </div>

          {/* Auth Forms */}
          {currentView === 'login' && (
            <LoginForm onSwitchToRegister={handleSwitchToRegister} />
          )}
          
          {currentView === 'register' && (
            <RegisterForm 
              onSwitchToLogin={handleSwitchToLogin}
              onRegistrationSuccess={handleRegistrationSuccess}
            />
          )}
          
          {currentView === 'success' && (
            <RegistrationSuccess onBackToLogin={handleSwitchToLogin} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>&copy; 2024 CouchPotato. All rights reserved.</p>
          <p className="mt-1">Unlimited movies and TV shows at your fingertips</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

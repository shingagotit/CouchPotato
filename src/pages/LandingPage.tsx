import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-4xl mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={`${import.meta.env.BASE_URL}CP.png`} 
            alt="CouchPotato Logo" 
            className="w-24 h-24 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent && !parent.querySelector('.fallback-icon')) {
                parent.innerHTML = '<div class="fallback-icon w-24 h-24 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold">CP</div>';
              }
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-white mb-4">
          CouchPotato
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Premium Streaming Experience
        </p>

        {/* Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">🎬 Welcome to CouchPotato</h2>
          <p className="text-gray-300 mb-4">
            Your ultimate destination for unlimited movies and TV shows. 
            Stream your favorite content in high quality with our premium service.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">✅ Site Online</h3>
              <p className="text-sm text-gray-300">Application is running successfully</p>
            </div>
            
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">🔐 Authentication</h3>
              <p className="text-sm text-gray-300">Secure login system ready</p>
            </div>
            
            <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
              <h3 className="text-purple-400 font-semibold mb-2">🎯 Admin Ready</h3>
              <p className="text-sm text-gray-300">Admin dashboard available</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/firebase-auth')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold"
            >
              🔥 Firebase Login
            </Button>
            
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
            >
              🔐 Legacy Login
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            <p>Admin Credentials:</p>
            <p><strong>Email:</strong> admin@couchpotato.com | <strong>Password:</strong> admin123</p>
            <p><strong>Personal:</strong> tashingachitambira@gmail.com | <strong>Password:</strong> CouchPotato2024!</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-lg p-6">
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="text-lg font-semibold text-white mb-2">Unlimited Movies</h3>
            <p className="text-sm text-gray-400">Access to thousands of movies in HD quality</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6">
            <div className="text-3xl mb-3">📺</div>
            <h3 className="text-lg font-semibold text-white mb-2">TV Shows</h3>
            <p className="text-sm text-gray-400">Complete series and latest episodes</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Device</h3>
            <p className="text-sm text-gray-400">Watch on any device, anywhere</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-6">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-sm text-gray-400">Enterprise-grade security and privacy</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            &copy; 2024 CouchPotato. All rights reserved. | 
            <span className="ml-2 text-green-400">●</span> Online
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

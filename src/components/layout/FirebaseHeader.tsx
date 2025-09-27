import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { NetflixButton } from '@/components/ui/netflix-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Bell, User, Settings, LogOut } from 'lucide-react';

interface FirebaseHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const FirebaseHeader: React.FC<FirebaseHeaderProps> = ({ activeTab, onTabChange }) => {
  const { user, isAdmin, signOut } = useFirebaseAuth();
  const navigate = useNavigate();

  const handleAdminPortal = () => {
    console.log('Navigating to Firebase admin dashboard');
    navigate('/firebase-admin');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/firebase-auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-12 py-4 transition-smooth">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <img 
              src={`${import.meta.env.BASE_URL}CP.png`} 
              alt="CouchPotato Logo" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback to a simple icon if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent && !parent.querySelector('.fallback-icon')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-icon w-8 h-8 bg-gradient-to-r from-red-600 to-red-500 rounded flex items-center justify-center text-white text-sm font-bold';
                  fallback.textContent = 'CP';
                  parent.insertBefore(fallback, parent.firstChild);
                }
              }}
            />
            <h1 className="text-2xl lg:text-3xl font-bold text-primary tracking-tight">
              CouchPotato
            </h1>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              🔥 Firebase
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/')}
              className={`text-muted-foreground hover:text-foreground transition-smooth ${
                activeTab === 'movies' ? 'font-bold text-primary' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/movies')}
              className={`text-muted-foreground hover:text-foreground transition-smooth ${
                activeTab === 'movies' ? 'font-bold text-primary' : ''
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => navigate('/tv-shows')}
              className={`text-muted-foreground hover:text-foreground transition-smooth ${
                activeTab === 'tv' ? 'font-bold text-primary' : ''
              }`}
            >
              TV Shows
            </button>
            <button
              onClick={() => navigate('/my-list')}
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              My List
            </button>
            {isAdmin && (
              <button
                onClick={handleAdminPortal}
                className="text-purple-400 hover:text-purple-300 transition-smooth"
              >
                Firebase Admin
              </button>
            )}
          </nav>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          <NetflixButton variant="ghost" size="icon" onClick={() => navigate('/search')}>
            <Search className="h-5 w-5" />
          </NetflixButton>
          <NetflixButton variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </NetflixButton>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NetflixButton variant="ghost" size="icon" className="relative">
                <User className="h-5 w-5" />
                {isAdmin && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-purple-500 border-2 border-background" />
                )}
              </NetflixButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border shadow-lg">
              <DropdownMenuLabel>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName || 'Guest'}
                  </p>
                </div>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user?.email}
                </p>
                {user?.emailVerified && (
                  <p className="text-xs text-green-600 mt-1">✓ Email Verified</p>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAdminPortal} className="text-purple-600">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Firebase Admin</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default FirebaseHeader;

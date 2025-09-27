import { useState } from 'react';
import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { NetflixButton } from '@/components/ui/netflix-button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  activeTab: 'movies' | 'tv' | 'search';
  onTabChange: (tab: 'movies' | 'tv' | 'search') => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleAdminPortal = () => {
    console.log('Admin button clicked - navigating to /admin/dashboard');
    navigate('/admin/dashboard');
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
          </div>
          
          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onTabChange('movies')}
              className={`text-foreground hover:text-primary transition-smooth pb-1 border-b-2 ${
                activeTab === 'movies' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => onTabChange('tv')}
              className={`text-foreground hover:text-primary transition-smooth pb-1 border-b-2 ${
                activeTab === 'tv' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              TV Shows
            </button>
            <button
              onClick={() => onTabChange('search')}
              className={`text-foreground hover:text-primary transition-smooth pb-1 border-b-2 ${
                activeTab === 'search' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => navigate('/my-list')}
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              My List
            </button>
            {/* Admin Portal Button - Visible on all screens for admins */}
            {(user?.role === 'admin' || user?.email === 'admin@couchpotato.com') && (
              <button
                onClick={handleAdminPortal}
                className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-smooth text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Admin Button - Visible on small screens */}
          {(user?.role === 'admin' || user?.email === 'admin@couchpotato.com') && (
            <button
              onClick={handleAdminPortal}
              className="md:hidden flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-lg transition-smooth text-xs font-medium"
            >
              <Settings className="w-3 h-3" />
              <span>Admin</span>
            </button>
          )}

          {/* Search */}
          <div className="relative">
            {isSearchOpen ? (
              <input
                type="text"
                placeholder="Search movies..."
                className="w-64 bg-muted/80 backdrop-blur-strong border border-border rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            ) : null}
            <NetflixButton
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </NetflixButton>
          </div>

          {/* Notifications */}
          <NetflixButton variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </NetflixButton>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NetflixButton variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </NetflixButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              {(user?.role === 'admin' || user?.email === 'admin@couchpotato.com') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAdminPortal} className="text-purple-600">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Portal</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, User, LogOut, Chrome as Home, Briefcase } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">ServiceHub</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/vendors" className="transition-colors hover:text-primary">
                Find Services
              </Link>
              {user && (
                <Link to="/dashboard" className="transition-colors hover:text-primary">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mr-2"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/signup')}>Get Started</Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link to="/" className="text-lg font-medium">
                    Home
                  </Link>
                  <Link to="/vendors" className="text-lg font-medium">
                    Find Services
                  </Link>
                  {user ? (
                    <>
                      <Link to="/dashboard" className="text-lg font-medium">
                        Dashboard
                      </Link>
                      <Button onClick={handleSignOut} variant="outline" className="w-full">
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                        Sign In
                      </Button>
                      <Button onClick={() => navigate('/signup')} className="w-full">
                        Get Started
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/50">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="font-bold">ServiceHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting customers with trusted service providers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/vendors" className="hover:text-foreground">Find Services</Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-foreground">My Bookings</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Vendors</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/become-vendor" className="hover:text-foreground">Become a Vendor</Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-foreground">Vendor Dashboard</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            2025 ServiceHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, User, Stethoscope, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseCore";
import { getUserProfile, signOutCurrentUser, type UserRole } from "@/lib/auth";
import { toast } from "sonner";

export const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [profileRole, setProfileRole] = useState<UserRole | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setProfileName("");
        setProfileRole(null);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setProfileName(profile?.name ?? "");
        setProfileRole(profile?.role ?? null);
      } catch {
        setProfileName("");
        setProfileRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const dashboardPath = profileRole === "doctor" ? "/doctor-dashboard" : "/mother-dashboard";
  const loggedInLabel = profileName || "User";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutCurrentUser();
      toast.success("Signed out successfully.");
      setIsMenuOpen(false);
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: Heart },
    { name: "Pipeline", path: "/pipeline", icon: Stethoscope },
    { name: currentUser ? "Dashboard" : "Login", path: currentUser ? dashboardPath : "/login", icon: User },
    { name: "About", path: "/contact", icon: Stethoscope },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gradient">MaternalCare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {currentUser ? (
              <>
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Logged in: {loggedInLabel}</span>
                </div>
                <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? "Signing out..." : "Log out"}
                </Button>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Logged out</span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {currentUser ? (
                <>
                  <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                    Logged in: {loggedInLabel}
                  </div>
                  <Button variant="outline" className="mt-2" onClick={handleSignOut} disabled={isSigningOut}>
                    {isSigningOut ? "Signing out..." : "Log out"}
                  </Button>
                </>
              ) : (
                <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  Logged out
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-lg">🔥</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">Smart Exam</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#faq" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="accent">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="accent">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-sm font-medium text-foreground/70 hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/pricing" 
                className="text-sm font-medium text-foreground/70 hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <a 
                href="#features" 
                className="text-sm font-medium text-foreground/70 hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="accent" className="w-full">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">Log In</Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      <Button variant="accent" className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

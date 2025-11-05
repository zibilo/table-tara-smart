import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-warm flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold">Tara</span>
        </div>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#menu" className="text-sm font-medium hover:text-primary transition-smooth">
            Menu
          </a>
          <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
            Fonctionnalités
          </a>
          <a href="#contact" className="text-sm font-medium hover:text-primary transition-smooth">
            Contact
          </a>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            <User className="w-4 h-4" />
            Espace serveur
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;

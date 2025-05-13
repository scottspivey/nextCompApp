// app/Components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { useSession, signOut } from "next-auth/react"; // Import NextAuth hooks
import { Menu, X, ChevronDown, LogOut, LogIn, UserPlus } from "lucide-react"; // Import more icons
import { Button } from "@/app/Components/ui/button";

interface NavLink {
  name: string;
  href: string;
  submenu?: NavLink[];
  authRequired?: boolean; // To show link only if authenticated
  hideIfAuth?: boolean;   // To hide link if authenticated
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter(); // For redirecting after logout

  // Get session status and data
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";

  // Close menu and dropdown when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setActiveDropdown(null);
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false); // Close mobile menu if open
    await signOut({ redirect: true, callbackUrl: "/" }); // Redirect to home after logout
  };

  // Check if a link or its submenu item is active
  const isActive = (path: string, submenu?: NavLink[]) => {
    if (pathname === path) return true;
    if (submenu) {
      return submenu.some(sublink => pathname?.startsWith(sublink.href));
    }
    return path !== '/' && pathname?.startsWith(`${path}/`);
  };

  const isSublinkActive = (path: string) => {
    return pathname === path;
  }

  const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    {
      name: "Calculators",
      href: "/Calculators",
      submenu: [
        { name: "AWW Calculator", href: "/Calculators/aww" },
        { name: "Commuted Value", href: "/Calculators/commuted" },
        { name: "View All Calculators", href: "/Calculators" },
      ]
    },
    { name: "Pricing", href: "/Pricing" },
    {
      name: "Resources",
      href: "/Helpful Resources",
      submenu: [
        { name: "SC Comp Laws", href: "/resources/laws" },
        { name: "How-to Guides", href: "/resources/guides" },
        { name: "FAQ", href: "/faq" },
      ]
    },
    { name: "About", href: "/About" },
    { name: "Dashboard", href: "/dashboard", authRequired: true }, // Only show if authenticated
  ];

  // Filter links based on auth status
  const filteredNavLinks = navLinks.filter(link => {
    if (link.authRequired && !isAuthenticated) return false;
    if (link.hideIfAuth && isAuthenticated) return false;
    return true;
  });

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Links */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
              <span className="font-bold text-xl">SC Workers&apos; Comp</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-1">
              {filteredNavLinks.map((link) => (
                <div key={link.name} className="relative group">
                  {link.submenu ? (
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      aria-expanded={activeDropdown === link.name}
                      className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center transition-colors duration-150 ease-in-out ${
                        isActive(link.href, link.submenu)
                          ? "bg-primary-foreground/10 text-primary-foreground"
                          : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                      }`}
                    >
                      {link.name}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === link.name ? "transform rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
                        isActive(link.href)
                          ? "bg-primary-foreground/10 text-primary-foreground"
                          : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}

                  {/* Desktop Dropdown Menu */}
                  {link.submenu && (
                    <div
                      className={`absolute left-0 mt-2 w-56 origin-top-left rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform z-20 ${
                        activeDropdown === link.name
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 pointer-events-none"
                      }`}
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="py-1" role="none">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.name}
                            href={sublink.href}
                            role="menuitem"
                            className={`block px-4 py-2 text-sm transition-colors duration-150 ease-in-out ${
                              isSublinkActive(sublink.href)
                                ? "bg-accent text-accent-foreground font-medium"
                                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons / User Info */}
          <div className="hidden md:flex md:items-center">
            {isLoadingSession ? (
              <div className="px-3 py-2 text-sm font-medium text-primary-foreground/80">Loading...</div>
            ) : isAuthenticated ? (
              <>
                {session?.user?.name && (
                  <span className="px-3 py-2 text-sm font-medium text-primary-foreground/90 hidden lg:block">
                    Hi, {session.user.name.split(' ')[0]}
                  </span>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost" // Or "outline" or your preferred style
                  size="sm"
                  className="ml-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-150 ease-in-out"
                >
                  <LogIn className="inline mr-1 h-4 w-4" /> Log in
                </Link>
                <Link
                  href="/signup"
                  className="ml-2 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md shadow-sm bg-background text-primary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
                >
                 <UserPlus className="inline mr-1 h-4 w-4" /> Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen border-t border-primary/20' : 'max-h-0'}`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {filteredNavLinks.map((link) => (
            <div key={link.name}>
              {link.submenu ? (
                <>
                  <button
                    onClick={() => toggleDropdown(link.name)}
                    aria-expanded={activeDropdown === link.name}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-left transition-colors duration-150 ease-in-out ${
                      isActive(link.href, link.submenu)
                        ? "bg-primary-foreground/10 text-primary-foreground"
                        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                  >
                    {link.name}
                    <ChevronDown
                      className={`ml-1 h-5 w-5 transition-transform ${
                        activeDropdown === link.name ? "transform rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeDropdown === link.name ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="ml-4 mt-1 mb-1 pl-3 border-l-2 border-primary/30 space-y-1">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.name}
                          href={sublink.href}
                          className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
                            isSublinkActive(sublink.href)
                              ? "bg-primary/80 text-white"
                              : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
                    isActive(link.href)
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </div>
        {/* Mobile Auth Buttons / User Info */}
        <div className="pt-4 pb-3 border-t border-primary/20">
          <div className="px-2 space-y-1">
            {isLoadingSession ? (
               <div className="block px-3 py-2 rounded-md text-base font-medium text-primary-foreground/80">Loading session...</div>
            ) : isAuthenticated ? (
              <>
                {session?.user?.name && (
                  <div className="block px-3 py-2 rounded-md text-base font-medium text-primary-foreground/90">
                    Hi, {session.user.name.split(' ')[0]}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogOut className="inline mr-2 h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="inline mr-2 h-5 w-5" /> Log in
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-background text-primary hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus className="inline mr-2 h-5 w-5" /> Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

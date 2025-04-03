// app/Components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react"; // Import icons

interface NavLink {
  name: string;
  href: string;
  submenu?: NavLink[];
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Close menu and dropdown when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close dropdown when closing mobile menu
    if (isMenuOpen) {
      setActiveDropdown(null);
    }
  };

  // Toggle dropdown visibility (for both desktop and mobile)
  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Check if a link or its submenu item is active
  const isActive = (path: string, submenu?: NavLink[]) => {
    if (pathname === path) return true;
    if (submenu) {
      // Check if any submenu item's path starts with the current pathname
      // This handles cases like /Calculators/aww being active when on /Calculators
      return submenu.some(sublink => pathname?.startsWith(sublink.href));
    }
    // Check if the main path is a prefix of the current pathname (e.g., /Calculators active on /Calculators/aww)
    // Ensure it's not just "/" matching everything
    return path !== '/' && pathname?.startsWith(`${path}/`);
  };

  // Check if a specific sublink is exactly active
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
      href: "/Helpful Resources", // Consider changing href to a base like "/resources"
      submenu: [
        { name: "SC Comp Laws", href: "/resources/laws" },
        { name: "How-to Guides", href: "/resources/guides" },
        { name: "FAQ", href: "/faq" }, // Consider moving under /resources/faq
      ]
    },
    { name: "About", href: "/About" },
  ];

  return (
    // Use a slightly lighter blue for better contrast possibilities, added padding
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50"> {/* Added sticky top and z-index */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Links */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
              {/* Optional: Add an actual logo SVG or Image here */}
              {/* <img className="h-8 w-auto" src="/logo.svg" alt="Logo"/> */}
              <span className="font-bold text-xl">SC Workers&apos; Comp</span>
            </Link>

            {/* Desktop Navigation Links */}
            {/* Added md:items-center here for vertical alignment */}
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-1"> {/* Reduced space slightly */}
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  {link.submenu ? (
                    // Dropdown Button
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      // Use aria-expanded for accessibility
                      aria-expanded={activeDropdown === link.name}
                      // Consistent padding and styling, ensure flex alignment
                      className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center transition-colors duration-150 ease-in-out ${
                        isActive(link.href, link.submenu) // Check if parent or submenu is active
                          ? "bg-primary-foreground/10 text-primary-foreground" // Subtle active background
                          : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" // Hover effect
                      }`}
                    >
                      {link.name}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === link.name ? "transform rotate-180" : ""
                        }`}
                        aria-hidden="true" // Icon is decorative
                      />
                    </button>
                  ) : (
                    // Regular Link
                    <Link
                      href={link.href}
                      // Consistent padding and styling
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
                        isActive(link.href) // Use simpler check for non-submenu links
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
                      // Improved transition and positioning
                      className={`absolute left-0 mt-2 w-56 origin-top-left rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform z-20 ${ // Added z-index
                        activeDropdown === link.name
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 pointer-events-none" // Use pointer-events-none to prevent interaction when hidden
                      }`}
                      role="menu" // Accessibility
                      aria-orientation="vertical"
                      aria-labelledby={`menu-button-${link.name}`} // Link button to menu if button had an ID
                    >
                      <div className="py-1" role="none">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.name}
                            href={sublink.href}
                            role="menuitem" // Accessibility
                            className={`block px-4 py-2 text-sm transition-colors duration-150 ease-in-out ${
                              isSublinkActive(sublink.href) // Exact match for sublink active state
                                ? "bg-accent text-accent-foreground font-medium" // Use accent colors
                                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                            }`}
                            // Close dropdown when a sublink is clicked
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-md text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-150 ease-in-out"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm bg-background text-primary hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out" // Adjusted styling
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" // Added focus ring
              aria-controls="mobile-menu" // Link button to menu
              aria-expanded={isMenuOpen} // Indicate state
            >
              <span className="sr-only">Open main menu</span>
              {/* Conditionally render Menu or X icon */}
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
      {/* Use transition for smoother open/close */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen border-t border-primary/20' : 'max-h-0'}`} // Animate max-height
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <div key={link.name}>
              {link.submenu ? (
                <>
                  {/* Mobile Dropdown Button */}
                  <button
                    onClick={() => toggleDropdown(link.name)}
                    aria-expanded={activeDropdown === link.name}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-left transition-colors duration-150 ease-in-out ${ // Added text-left
                      isActive(link.href, link.submenu)
                        ? "bg-primary-foreground/10 text-primary-foreground"
                        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    }`}
                  >
                    {link.name}
                    <ChevronDown
                      className={`ml-1 h-5 w-5 transition-transform ${ // Slightly larger icon
                        activeDropdown === link.name ? "transform rotate-180" : ""
                      }`}
                       aria-hidden="true"
                    />
                  </button>
                  {/* Mobile Dropdown Content */}
                  {/* Use transition for smoother open/close */}
                   <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeDropdown === link.name ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="ml-4 mt-1 mb-1 pl-3 border-l-2 border-primary/30 space-y-1"> {/* Indent and add border */}
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.name}
                            href={sublink.href}
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
                              isSublinkActive(sublink.href)
                                ? "bg-primary/80 text-white" // Different active style for mobile sublinks
                                : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                            }`}
                            // Close entire mobile menu when sublink clicked
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </div>
                   </div>
                </>
              ) : (
                // Mobile Regular Link
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
        {/* Mobile Auth Buttons */}
        <div className="pt-4 pb-3 border-t border-primary/20">
          <div className="px-2 space-y-1">
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="block px-3 py-2 rounded-md text-base font-medium bg-background text-primary hover:bg-muted" // Use theme colors
              onClick={() => setIsMenuOpen(false)}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// app/Components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavLink {
  name: string;
  href: string;
  submenu?: NavLink[];
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

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
  ];

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl">SC Workers&apos; Comp</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  {link.submenu ? (
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                        isActive(link.href)
                          ? "bg-blue-800 text-white"
                          : "text-white hover:bg-blue-600"
                      }`}
                    >
                      {link.name}
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform ${
                          activeDropdown === link.name ? "transform rotate-180" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(link.href)
                          ? "bg-blue-800 text-white"
                          : "text-white hover:bg-blue-600"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}

                  {/* Desktop Dropdown */}
                  {link.submenu && (
                    <div
                      className={`absolute z-10 -ml-4 mt-1 transform w-56 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-150 ease-in-out origin-top-right ${
                        activeDropdown === link.name
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      <div className="py-1">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.name}
                            href={sublink.href}
                            className={`block px-4 py-2 text-sm ${
                              isActive(sublink.href)
                                ? "bg-gray-100 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
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
          
          <div className="hidden md:flex md:items-center">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-blue-600"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="ml-3 px-4 py-2 text-sm font-medium rounded-md bg-white text-blue-700 hover:bg-gray-100"
            >
              Sign up
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <div key={link.name}>
              {link.submenu ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(link.name)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.href)
                        ? "bg-blue-800 text-white"
                        : "text-white hover:bg-blue-600"
                    }`}
                  >
                    {link.name}
                    <svg
                      className={`ml-1 h-4 w-4 transition-transform ${
                        activeDropdown === link.name ? "transform rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {activeDropdown === link.name && (
                    <div className="ml-4 mt-2 space-y-1">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.name}
                          href={sublink.href}
                          className={`block px-3 py-2 rounded-md text-base font-medium ${
                            isActive(sublink.href)
                              ? "bg-blue-700 text-white"
                              : "text-blue-100 hover:bg-blue-600"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? "bg-blue-800 text-white"
                      : "text-white hover:bg-blue-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-blue-800">
          <div className="px-2 space-y-1">
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="block px-3 py-2 rounded-md text-base font-medium bg-white text-blue-700 hover:bg-gray-100"
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
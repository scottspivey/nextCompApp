// app/Components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              {/* Logo or site name */}
              <span className="font-bold text-xl">SC Workers&apos; Comp</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                <Link 
                  href="/" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Home
                </Link>
                <Link 
                  href="/Calculators" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Calculators
                </Link>
                <Link 
                  href="/pricing" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Pricing
                </Link>
                <Link 
                  href="/resources" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Resources
                </Link>
                <Link 
                  href="/about" 
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  About
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-600"
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
          <Link 
            href="/" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/Calculators" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Calculators
          </Link>
          <Link 
            href="/pricing" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link 
            href="/resources" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Resources
          </Link>
          <Link 
            href="/about" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-blue-800">
          <div className="px-2 space-y-1">
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
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
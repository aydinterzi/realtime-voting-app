"use client";

import { useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import ModeToggle from "./DarkModeToggle";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="shadow-md py-2">
      <MaxWidthWrapper>
        <div className="flex justify-between items-center">
          <Link href="/">LOGO</Link>

          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              Sessions
            </Link>
            <Link href="/create" className="text-gray-600 hover:text-blue-600">
              Create
            </Link>
            <div>
              <ModeToggle />
            </div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4">
            <div className="flex flex-col space-y-4 text-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Sessions
              </Link>
              <Link
                href="/create"
                className="text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Create
              </Link>
            </div>
          </nav>
        )}
      </MaxWidthWrapper>
    </header>
  );
}

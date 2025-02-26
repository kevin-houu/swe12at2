"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/lib/config";
import useScroll from "@/hooks/use-scroll";

import { AnimatePresence, motion } from "framer-motion";

import { Menu, X } from "lucide-react";

import { Button } from "~/button";
import Logo from "@/components/logo";
import { MobileNavigation, DesktopNavigation } from "@/components/navigation";

export default function Header() {
  const pathname = usePathname();
  const scrolled = useScroll(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname?.includes("/onboarding")) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-semibold text-foreground">
                {site.name.short}
              </span>
            </Link>
          </div>
          <DesktopNavigation className="hidden md:flex" />
          <div className="items-center space-x-4 hidden md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="cta" asChild>
              <Link href="/signup">Signup</Link>
            </Button>
          </div>
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={mobileMenuOpen ? "close" : "open"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileNavigation onClose={() => setMobileMenuOpen(false)} />
        )}
      </AnimatePresence>
    </header>
  );
}

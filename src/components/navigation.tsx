"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

// const navigationLinks = [{ href: "/pricing", name: "Pricing" }];

export function MobileNavigation({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="md:hidden bg-background border-t border-border"
    >
      {/* <div className="space-y-1 px-4 py-5">
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={onClose}
          >
            {link.name}
          </Link>
        ))}
      </div> */}
      <div className="border-t border-border px-4 py-5">
        <div className="flex flex-col space-y-3">
          <Button
            variant="outline"
            onClick={onClose}
            asChild
            className="w-full"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="cta" onClick={onClose} asChild className="w-full">
            <Link href="/signup">Signup</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function DesktopNavigation({ className = "" }) {
  return (
    <nav className={`flex-grow flex items-center justify-between ${className}`}>
      {/* <div className="flex-grow flex justify-center space-x-6">
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {link.name}
          </Link>
        ))}
      </div> */}
    </nav>
  );
}

/* eslint-disable react/no-unescaped-entities */
"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const methods = {
  google: {
    label: "Continue with Google",
    variant: "default" as const,
  },
  email: {
    label: "Continue with email",
    variant: "cta" as const,
  },
};

type TLoginMenuProps = {
  goToNext: () => void;
};

export default function LoginMenu({ goToNext }: TLoginMenuProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl text-muted-foreground text-center mb-10 font-inter">
        Log in to Linear
      </h1>
      {Object.entries(methods).map(([key, { label, variant }]) => (
        <Button
          key={key}
          variant={variant}
          className="w-full"
          onClick={() => (key === "email" ? goToNext() : null)}
        >
          {label}
        </Button>
      ))}
      <div className="text-md text-muted-foreground/60 text-center pt-4 font-inter">
        Don't have an account?{" "}
        <button
          onClick={() => router.push("/signup")}
          className="text-foreground hover:underline"
        >
          Sign up{" "}
        </button>{" "}
        or{" "}
        <button
          onClick={() => router.push("/")}
          className="text-foreground hover:underline"
        >
          Learn more
        </button>
      </div>
    </div>
  );
}

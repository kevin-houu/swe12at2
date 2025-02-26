"use client";

import AuthWrapper from "@/components/auth/wrapper";
import SignupDetails from "@/components/auth/signup/signup-details";
import SignupMenu from "@/components/auth/signup/signup-menu";

export default function SignupPage() {
  return (
    <AuthWrapper>
      {({ goToNext }) => <SignupMenu goToNext={goToNext} />}
      {({ goToPrevious }) => <SignupDetails goToPrevious={goToPrevious} />}
    </AuthWrapper>
  );
}

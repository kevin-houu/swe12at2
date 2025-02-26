"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ZodError } from "zod";

import { site } from "@/lib/config";
import { type TOnboardingData, onboardingSchema } from "@/schemas/onboarding";

import { Button } from "~/button";
import { Input } from "~/input";
import { Textarea } from "~/textarea";
import Logo from "@/components/logo";

export default function Workspace() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState<TOnboardingData>({
    theme: theme as "light" | "dark",
    workspaceName: "",
    workspaceDescription: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): boolean {
    try {
      onboardingSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (!formData.workspaceName && !formData.workspaceDescription) {
      router.push("/onboarding/completion");
      return;
    }

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit workspace data.");
      }

      router.push("/onboarding/completion");
    } catch (error) {
      console.error("Error submitting workspace data:", error);
      setErrors({
        submit: "Failed to submit workspace data. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleThemeSelect(theme: "light" | "dark") {
    setFormData((prev) => ({ ...prev, theme }));
    setTheme(theme);
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <motion.div
      className="min-h-[calc(100vh-20rem)] flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        className="w-full max-w-2xl space-y-8"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-2">
          <motion.h1
            className="text-4xl font-bold font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose your{" "}
            <span className="bg-gradient-to-r from-[#FF100D] to-[#FF7903] text-transparent bg-clip-text">
              style
            </span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            You can change the UI style at any time through settings
          </motion.p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                formData.theme === "light"
                  ? "border-primary bg-white shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect("light")}
            >
              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center gap-2 border-b pb-2 mb-2">
                  <Logo className="w-4 h-4 text-primary" />
                  <div className="h-2 w-16 bg-gray-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-gray-200 rounded" />
                  <div className="h-2 w-32 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                Light
              </div>
            </motion.div>

            <motion.div
              className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                formData.theme === "dark"
                  ? "border-primary bg-zinc-950 shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect("dark")}
            >
              <div className="p-4 bg-zinc-950 rounded-lg">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2">
                  <Logo className="w-4 h-4 text-primary" />
                  <div className="h-2 w-16 bg-zinc-800 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-zinc-800 rounded" />
                  <div className="h-2 w-32 bg-zinc-900 rounded" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                Dark
              </div>
            </motion.div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="workspaceName"
                className="block text-sm font-medium mb-1"
              >
                Workspace Name (Optional)
              </label>
              <Input
                name="workspaceName"
                value={formData.workspaceName}
                onChange={handleInputChange}
                placeholder={`e.g., ${site.name.short} Support`}
                autoComplete="off"
              />
              {errors.workspaceName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.workspaceName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Workspace Description (Optional)
              </label>
              <Textarea
                name="workspaceDescription"
                value={formData.workspaceDescription}
                onChange={handleInputChange}
                placeholder={`e.g., External Support for ${site.name.short}`}
              />
              {errors.workspaceDescription && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.workspaceDescription}
                </p>
              )}
            </div>
          </div>
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF100D] to-[#FF7903] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Continue"}
          </Button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

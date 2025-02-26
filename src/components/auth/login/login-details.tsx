"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/hooks/use-auth";
import { emailSchema, passwordSchema } from "@/schemas/auth";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "~/button";
import { Input } from "~/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/form";

type TLoginDetailsProps = {
  goToPrevious: () => void;
};

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export default function LoginDetails({ goToPrevious }: TLoginDetailsProps) {
  const { signin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      const sanitisedValues = {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };

      await signin(sanitisedValues.email, sanitisedValues.password);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Login failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl text-muted-foreground text-center mb-8 font-inter">
        Enter your details
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    {...field}
                    className="bg-background/10 text-muted-foreground"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                      className="bg-background/10 text-muted-foreground"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            variant="cta"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Continue"}
          </Button>
          <button
            type="button"
            onClick={goToPrevious}
            className="text-sm text-gray-400 hover:text-gray-200 w-full text-center mt-4 font-inter"
          >
            Back
          </button>
        </form>
      </Form>
    </div>
  );
}

import { z } from "zod";

export const onboardingSchema = z.object({
  theme: z.enum(["light", "dark"]),
  workspaceName: z
    .string()
    .max(50, "workspace name must be 50 characters or less")
    .optional(),
  workspaceDescription: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
});

export type TOnboardingData = z.infer<typeof onboardingSchema>;

import { z } from "zod";

export const clientSchema = z.object({
  company_name: z.string().min(2, "Le nom de l'entreprise est requis"),
  contact_name: z.string().optional().or(z.literal("")),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  sector: z.string().optional().or(z.literal("")),
  current_website: z.string().optional().or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const businessProfileSchema = z.object({
  ideal_client: z.string().optional().or(z.literal("")),
  age_range: z.string().optional().or(z.literal("")),
  situation: z.string().optional().or(z.literal("")),
  pain_points: z.string().optional().or(z.literal("")),
  goals: z.string().optional().or(z.literal("")),
  objections: z.string().optional().or(z.literal("")),
  avg_budget: z.coerce.number().optional(),
  services: z.string().optional().or(z.literal("")),
  products: z.string().optional().or(z.literal("")),
  advantages: z.string().optional().or(z.literal("")),
  differentiation: z.string().optional().or(z.literal("")),
  promise: z.string().optional().or(z.literal("")),
  values: z.string().optional().or(z.literal("")),
  competitors: z.string().optional().or(z.literal("")),
  communication_tone: z.string().optional().or(z.literal("")),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

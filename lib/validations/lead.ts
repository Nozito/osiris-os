import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  company: z.string().optional().or(z.literal("")),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  need: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().optional(),
  urgency: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const leadScoreSchema = z.object({
  budget_score: z.coerce.number().min(0).max(100),
  urgency_score: z.coerce.number().min(0).max(100),
  sector_score: z.coerce.number().min(0).max(100),
  company_size_score: z.coerce.number().min(0).max(100),
  need_clarity_score: z.coerce.number().min(0).max(100),
});

export type LeadScoreInput = z.infer<typeof leadScoreSchema>;

export const LEAD_STATUSES = [
  "new",
  "qualification",
  "meeting",
  "quote_sent",
  "signed",
  "lost",
] as const;

export const LEAD_STATUS_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  new: "Nouveau lead",
  qualification: "Qualification",
  meeting: "RDV",
  quote_sent: "Devis envoyé",
  signed: "Signé",
  lost: "Perdu",
};

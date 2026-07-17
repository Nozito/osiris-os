import { z } from "zod";

export const projectSchema = z.object({
  client_id: z.string().uuid("Client requis"),
  name: z.string().min(2, "Le nom du projet est requis"),
  description: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().optional(),
  start_date: z.string().optional().or(z.literal("")),
  delivery_date: z.string().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const PROJECT_STATUSES = [
  "onboarding",
  "design",
  "development",
  "client_validation",
  "live",
  "maintenance",
] as const;

export const PROJECT_STATUS_LABELS: Record<(typeof PROJECT_STATUSES)[number], string> = {
  onboarding: "Onboarding",
  design: "Design",
  development: "Développement",
  client_validation: "Validation client",
  live: "En ligne",
  maintenance: "Maintenance",
};

export const PROJECT_NEXT_STEP: Record<(typeof PROJECT_STATUSES)[number], string> = {
  onboarding: "Nous recueillons vos informations (avatar, offre, branding).",
  design: "Notre équipe travaille sur les maquettes de votre site.",
  development: "Le développement de votre site est en cours.",
  client_validation: "Merci de valider les derniers éléments avec votre interlocuteur.",
  live: "Votre site est en ligne 🎉",
  maintenance: "Votre site est en maintenance continue.",
};

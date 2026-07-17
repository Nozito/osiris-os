"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";
import type { Database } from "@/types/database.types";

export type ActionState = { error?: string } | undefined;

type ProjectStatus = Database["public"]["Enums"]["project_status"];

export async function createProject(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    client_id: formData.get("client_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    budget: formData.get("budget"),
    start_date: formData.get("start_date"),
    delivery_date: formData.get("delivery_date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { start_date, delivery_date, ...rest } = parsed.data;
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      ...rest,
      start_date: start_date || null,
      delivery_date: delivery_date || null,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !project) {
    return { error: "Impossible de créer le projet." };
  }

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    client_id: formData.get("client_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    budget: formData.get("budget"),
    start_date: formData.get("start_date"),
    delivery_date: formData.get("delivery_date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { start_date, delivery_date, ...rest } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ ...rest, start_date: start_date || null, delivery_date: delivery_date || null })
    .eq("id", projectId);

  if (error) return { error: "Impossible d'enregistrer." };

  revalidatePath(`/projects/${projectId}`);
  return undefined;
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ status }).eq("id", projectId);
  if (error) throw new Error("Impossible de changer le statut.");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

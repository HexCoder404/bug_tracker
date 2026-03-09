// src/db.ts
import { supabase } from "./supabaseClient";

// Fetch all bugs
export async function getBugs() {
  const { data, error } = await supabase
    .from("bugs")
    .select("*, profiles!reported_by(email), projects(name)");

  if (error) {
    console.error("Error fetching bugs:", error.message);
    return [];
  }
  return data;
}

// Add a new bug
export async function createBug(
  title: string,
  description: string,
  projectId: string,
) {
  // First, get the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be logged in to create a bug.");

  const { data, error } = await supabase.from("bugs").insert([
    {
      title,
      description,
      project_id: projectId,
      reported_by: user.id,
    },
  ]);

  if (error) console.error("Error creating bug:", error.message);
  return data;
}

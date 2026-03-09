// src/auth.ts
import { supabase } from "./supabaseClient";

// 1. Sign Up User
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Sign up error:", error.message);
    return null;
  }
  return data;
}

// 2. Log In User
export async function logIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Log in error:", error.message);
    return null;
  }
  return data;
}

// 3. Log Out User
export async function logOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Log out error:", error.message);
  }
}

// 4. Get Current Active User
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

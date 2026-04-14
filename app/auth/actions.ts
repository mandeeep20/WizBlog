"use server";

import { redirect } from "next/navigation";

export async function signOutAction() {
  // TODO: add your real logout logic here
  redirect("/login");
}
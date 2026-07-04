"use server";

import { redirect } from "next/navigation";

import { createAdminSession, deleteAdminSession, verifyAdminPassword } from "@/lib/auth/session";

export type AdminLoginState = { error?: string } | undefined;

export async function loginAdmin(
  _state: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { error: "패스워드를 입력해 주세요." };
  }

  if (!verifyAdminPassword(password)) {
    return { error: "패스워드가 올바르지 않습니다." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await deleteAdminSession();
  redirect("/admin/login");
}

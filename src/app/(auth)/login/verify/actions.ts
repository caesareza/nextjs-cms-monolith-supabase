"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function verifyOTPCode(_prevState: any, formData: FormData) {
  const code = (formData.get("code") as string)?.trim();

  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return { success: false, error: "Verification code must be 6 digits" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Session expired. Please log in again." };
  }

  const email = user.email.toLowerCase().trim();
  const nowIso = new Date().toISOString();

  console.log(`[2FA Debug] Verifying OTP for: ${email}`);
  console.log(`[2FA Debug] Code input: "${code}"`);
  console.log(`[2FA Debug] Current time: ${nowIso}`);

  // Retrieve matching active OTP code
  const { data: otps, error: fetchError } = await supabase
    .from("email_otps")
    .select("id, expires_at, otp_code")
    .eq("email", email)
    .eq("otp_code", code);

  if (fetchError) {
    console.error("[2FA Debug] Supabase fetch error:", fetchError.message);
    return { success: false, error: "Database error. Please try again." };
  }

  console.log("[2FA Debug] Matched records in DB:", otps);

  if (!otps || otps.length === 0) {
    return { success: false, error: "Invalid or expired verification code." };
  }

  // Filter out expired codes manually to ensure timezone safety
  const activeOtp = otps.find((otp) => new Date(otp.expires_at) > new Date());
  if (!activeOtp) {
    console.warn("[2FA Debug] Match found but code has expired.");
    return { success: false, error: "Verification code has expired." };
  }

  // Delete all OTP codes for this user to ensure single-use
  await supabase.from("email_otps").delete().eq("email", email);

  // Establish verified session cookie (HTTP-Only and Secure)
  const cookieStore = await cookies();
  cookieStore.set("posthinks_otp_verified", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Redirect to Dashboard
  redirect("/");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendOTPEmail } from "@/app/actions/email";
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

  // Establish verified session cookie for 1 year (365 days)
  const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
  const cookieStore = await cookies();
  cookieStore.set("posthinks_otp_verified", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  // Redirect to Dashboard
  redirect("/");
}

export async function resendOTPCode() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Session expired. Please log in again." };
  }

  const email = user.email.toLowerCase().trim();

  // Delete previous codes
  await supabase.from("email_otps").delete().eq("email", email);

  // Generate fresh 6-digit OTP code (5 minutes expiry)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: dbError } = await supabase.from("email_otps").insert({
    email,
    otp_code: code,
    expires_at: expiresAt,
  });

  if (dbError) {
    console.error("[2FA Debug] Failed to generate OTP in DB:", dbError.message);
    return { success: false, error: "Failed to generate new verification code." };
  }

  const emailRes = await sendOTPEmail({ email, code });
  if (!emailRes.success) {
    console.error("[2FA Debug] Failed to dispatch OTP email:", emailRes.message);
    return { success: false, error: "Failed to dispatch email. Please try again." };
  }

  return { success: true };
}

export async function cancelVerification() {
  const supabase = await createClient();

  // Sign out cleanly from Supabase and remove cookies
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("posthinks_otp_verified");

  redirect("/login");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendOTPEmail } from "@/app/actions/email";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=Could not authenticate user");
  }

  // 1. Generate 6-digit numeric OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

  // 2. Save OTP to database
  const { error: dbError } = await supabase.from("email_otps").insert({
    email,
    otp_code: code,
    expires_at: expiresAt,
  });

  if (dbError) {
    console.error("Database OTP insert error:", dbError.message);
    redirect("/login?error=Failed to initialize login security");
  }

  // 3. Dispatch the OTP email
  const emailRes = await sendOTPEmail({ email, code });
  if (!emailRes.success) {
    console.error("Failed to send OTP email:", emailRes.message);
  }

  // 4. Redirect to OTP verification page
  redirect("/login/verify");
}

export async function logout() {
  const supabase = await createClient();

  // 1. Terminate user session and clear auth cookies on server
  await supabase.auth.signOut();

  // 2. Clear the OTP verification cookie
  const cookieStore = await cookies();
  cookieStore.delete("posthinks_otp_verified");

  // 3. Redirect back to login page
  redirect("/login");
}

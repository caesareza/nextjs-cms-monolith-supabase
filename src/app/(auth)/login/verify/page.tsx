import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import VerifyPageClient from "./VerifyPageClient";

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  // Check if there is an active OTP in the database for this email
  const nowIso = new Date().toISOString();
  const { data: activeOtps } = await supabase
    .from("email_otps")
    .select("id, expires_at")
    .eq("email", user.email.toLowerCase().trim())
    .gt("expires_at", nowIso);

  // If the OTP code has expired or user was idle, clear stale session and return to login
  if (!activeOtps || activeOtps.length === 0) {
    await supabase.auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete("posthinks_otp_verified");
    redirect("/login?error=Verification session expired. Please log in again.");
  }

  return <VerifyPageClient email={user.email || ""} />;
}

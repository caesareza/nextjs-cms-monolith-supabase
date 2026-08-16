import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import VerifyPageClient from "./VerifyPageClient";

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <VerifyPageClient email={user.email || ""} />;
}

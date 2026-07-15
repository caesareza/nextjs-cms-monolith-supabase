import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Posthinks CMS Article",
  description: "Log in to manage your publication workflow.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}

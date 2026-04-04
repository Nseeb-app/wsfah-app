import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/home");
  }
  return <LandingPage />;
}

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { getRecommendations } from "@/lib/recommendations";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipes = await getRecommendations(user.id);
  return NextResponse.json(recipes);
}

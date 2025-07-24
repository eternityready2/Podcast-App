import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  // Proteja seu endpoint!
  if (secret !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }

  // Use a mesma tag que definimos no `fetch` da página
  const tag = "podcasts-data";
  revalidateTag(tag);

  return NextResponse.json({ revalidated: true, now: Date.now() });
}

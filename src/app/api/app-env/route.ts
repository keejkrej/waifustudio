import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }
  const auth =
    process.env.NEXT_PUBLIC_AUTH_ENABLED ?? process.env.VITE_AUTH_ENABLED;
  return NextResponse.json({
    NEXT_PUBLIC_AUTH_ENABLED: auth,
    VITE_AUTH_ENABLED: auth,
  });
}

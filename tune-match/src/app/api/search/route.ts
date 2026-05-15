import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");

  if (!artist) {
    return NextResponse.json({ error: "Artist ontbreekt" }, { status: 400 });
  }

  const response = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(artist)}`
  );

  const data = await response.json();

  return NextResponse.json(data);
}
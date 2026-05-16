import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const artist = searchParams.get("artist");
  const searchTerm = artist ?? genre;

  if (!searchTerm) {
    return NextResponse.json(
      { error: "Genre of artist ontbreekt" },
      { status: 400 },
    );
  }

  const response = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}`,
  );

  const data = await response.json();

  return NextResponse.json(data);
}

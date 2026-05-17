import { NextResponse } from "next/server";

const DEEZER_API_TIMEOUT_MS = 5000;
const MAX_SEARCH_QUERY_LENGTH = 200;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");
    const artist = searchParams.get("artist");
    const searchTerm = artist ?? genre;

    // Validate search term
    if (!searchTerm?.trim()) {
      return NextResponse.json(
        { error: "Genre of artist ontbreekt" },
        { status: 400 },
      );
    }

    if (searchTerm.length > MAX_SEARCH_QUERY_LENGTH) {
      return NextResponse.json(
        {
          error: `Search query too long (max ${MAX_SEARCH_QUERY_LENGTH} characters)`,
        },
        { status: 400 },
      );
    }

    // Fetch from Deezer with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEEZER_API_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}`,
        { signal: controller.signal },
      );

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(
          `[SEARCH API] Deezer error: ${response.status} ${response.statusText}`,
        );
        return NextResponse.json(
          { error: "Search service unavailable" },
          { status: 503 },
        );
      }

      const data = (await response.json()) as unknown;

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from Deezer");
      }

      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeout);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[SEARCH API] Request timeout");
        return NextResponse.json(
          { error: "Search request timed out" },
          { status: 504 },
        );
      }

      throw fetchError;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[SEARCH API] Error: ${errorMessage}`,
      error instanceof Error ? error.stack : undefined,
    );

    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 },
    );
  }
}

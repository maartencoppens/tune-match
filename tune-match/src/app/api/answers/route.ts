import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  SubmitAnswersPayload,
  GenreScore,
} from "@/core/modules/answers/types";

function isValidPayload(payload: unknown): payload is SubmitAnswersPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as SubmitAnswersPayload;

  return (
    Array.isArray(data.answerOptionIds) &&
    data.answerOptionIds.length > 0 &&
    data.answerOptionIds.every((id) => typeof id === "string" && id.length > 0)
  );
}

function calculateTopGenre(scores: GenreScore[]) {
  const totals = new Map<string, number>();
  const strongHits = new Map<string, number>();
  const hitCounts = new Map<string, number>();

  for (const scoreEntry of scores) {
    const genreId = scoreEntry.genreId;

    totals.set(genreId, (totals.get(genreId) ?? 0) + scoreEntry.score);

    hitCounts.set(genreId, (hitCounts.get(genreId) ?? 0) + 1);

    if (scoreEntry.score >= 2) {
      strongHits.set(genreId, (strongHits.get(genreId) ?? 0) + 1);
    }
  }

  const ranked = [...totals.entries()].sort(
    ([genreA, scoreA], [genreB, scoreB]) => {
      const strongHitDiff =
        (strongHits.get(genreB) ?? 0) - (strongHits.get(genreA) ?? 0);
      const hitCountDiff =
        (hitCounts.get(genreB) ?? 0) - (hitCounts.get(genreA) ?? 0);

      return (
        scoreB - scoreA ||
        strongHitDiff ||
        hitCountDiff ||
        genreA.localeCompare(genreB)
      );
    },
  );

  return ranked[0]?.[0] ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!isValidPayload(body)) {
      return NextResponse.json(
        {
          error: "Invalid payload. Expected answerOptionIds: string[]",
        },
        { status: 400 },
      );
    }

    const submittedOptionIds = [...new Set(body.answerOptionIds)];

    const activeQuestionCount = await prisma.question.count({
      where: { isActive: true },
    });

    if (submittedOptionIds.length !== activeQuestionCount) {
      return NextResponse.json(
        {
          error:
            "Submit exactly one answer option per active question before calculating the result.",
        },
        { status: 400 },
      );
    }

    const selectedOptions = await prisma.answerOption.findMany({
      where: {
        id: { in: submittedOptionIds },
        question: { isActive: true },
      },
      select: {
        id: true,
        questionId: true,
        genreScores: {
          select: {
            genreId: true,
            score: true,
          },
        },
      },
    });

    if (selectedOptions.length !== submittedOptionIds.length) {
      return NextResponse.json(
        { error: "One or more selected answer options are invalid." },
        { status: 400 },
      );
    }

    const distinctQuestionCount = new Set(
      selectedOptions.map((option) => option.questionId),
    ).size;

    if (distinctQuestionCount !== activeQuestionCount) {
      return NextResponse.json(
        { error: "You must select exactly one answer for each question." },
        { status: 400 },
      );
    }

    const flatScores = selectedOptions.flatMap((option) => option.genreScores);
    const winningGenreId = calculateTopGenre(flatScores);
    console.log("[DEBUG] flatScores:", JSON.stringify(flatScores, null, 2));
    console.log(
      "[DEBUG] selectedOptions genreScores counts:",
      selectedOptions.map((o) => ({
        id: o.id,
        scoreCount: o.genreScores.length,
      })),
    );
    if (!winningGenreId) {
      return NextResponse.json(
        { error: "No genre scoring found for selected answers." },
        { status: 400 },
      );
    }

    const resultGenre = await prisma.genre.findUnique({
      where: { id: winningGenreId },
      select: {
        id: true,
        name: true,
        description: true,
        artistReference: true,
        visualTheme: true,
      },
    });

    return NextResponse.json({
      selectedCount: submittedOptionIds.length,
      totalQuestions: activeQuestionCount,
      resultGenre,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[ANSWERS API] Error processing answers:", {
      message: errorMessage,
      stack: errorStack,
    });

    // Return generic error to client
    return NextResponse.json(
      { error: "Failed to process your answers. Please try again." },
      { status: 500 },
    );
  }
}

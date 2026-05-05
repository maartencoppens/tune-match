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

  for (const scoreEntry of scores) {
    totals.set(
      scoreEntry.genreId,
      (totals.get(scoreEntry.genreId) ?? 0) + scoreEntry.score,
    );
  }

  const ranked = [...totals.entries()].sort(
    ([genreA, scoreA], [genreB, scoreB]) =>
      scoreB - scoreA || genreA.localeCompare(genreB),
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
    console.error("Failed to submit answer", error);

    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 },
    );
  }
}

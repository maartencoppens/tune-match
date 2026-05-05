import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        text: true,
        orderIndex: true,
        answerOptions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            label: true,
            orderIndex: true,
          },
        },
      },
    });

    return NextResponse.json({
      total: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Failed to fetch questions", error);

    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

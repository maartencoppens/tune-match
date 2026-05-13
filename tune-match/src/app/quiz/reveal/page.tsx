"use client";

import { useQuizState } from "@/components/functional/QuizStateProvider";

export default function QuizRevealPage() {
  const { currentQuestion, selectedByQuestion } = useQuizState();

  if (!currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-slate-700">No active questions found.</p>
      </main>
    );
  }

  const selectedOptionId = selectedByQuestion[currentQuestion.id];
  const selectedOption = currentQuestion.answerOptions.find(
    (option) => option.id === selectedOptionId,
  );

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Your answer
        </p>

        <h1 className="mt-4 text-4xl font-bold text-slate-900">
          {selectedOption?.label ?? "Unknown"}
        </h1>

        <p className="mt-4 text-slate-600">Waiting for next question...</p>
      </div>
    </main>
  );
}

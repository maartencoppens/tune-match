"use client";

import { useQuizState } from "@/components/functional/QuizStateProvider";

export default function ResultPage() {
  const { errorMessage, resultGenre, restartQuiz } = useQuizState();

  if (errorMessage && !resultGenre) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!resultGenre) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-slate-700">Resultaat wordt nog berekend...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Your genre
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {resultGenre.name}
        </h1>

        {resultGenre.description ? (
          <p className="mt-3 text-slate-600">{resultGenre.description}</p>
        ) : null}

        {resultGenre.artistReference ? (
          <p className="mt-2 text-sm text-slate-500">
            Artist reference: {resultGenre.artistReference}
          </p>
        ) : null}

        <button
          type="button"
          onClick={restartQuiz}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white"
        >
          Play again
        </button>
      </div>
    </main>
  );
}

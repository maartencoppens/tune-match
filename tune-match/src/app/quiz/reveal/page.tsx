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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,_#140421_0%,_#250a36_40%,_#16213e_100%)] p-6">
  <div className="pointer-events-none absolute h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

  <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_0_50px_rgba(217,70,239,0.18)] backdrop-blur-md">
    <p className="text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-200/80">
      Jouw antwoord
    </p>

    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
      {selectedOption?.label ?? "Unknown"}
    </h1>

    <p className="mt-4 text-white/65">
        Klaar voor de volgende keuze...
    </p>

    <div className="mx-auto mt-6 h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-70" />
  </div>
</main>
  );
}

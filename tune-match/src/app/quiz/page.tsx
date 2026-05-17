"use client";

import { useEffect } from "react";
import Image from "next/image";
import Logo from "../../components/design/logo";
import { ZONES } from "@/core/modules/zones/types";
import { useQuizState } from "../../components/functional/QuizStateProvider";

const CIRCUMFERENCE = 2 * Math.PI * 20;

export default function QuizPage() {
  const {
    currentQuestion,
    currentIndex,
    dwellProgress,
    errorMessage,
    installationState,
    isLoading,
    isSubmitting,
    progressPercent,
    questions,
    handleAnswerClick,
    activeZoneFromDwell,
  } = useQuizState();

  useEffect(() => {
    console.log("[QuizPage] render", {
      currentIndex,
      currentQuestionId: currentQuestion?.id,
      currentQuestionText: currentQuestion?.text,
      totalQuestions: questions.length,
      screen: installationState?.screen,
    });
  }, [
    currentIndex,
    currentQuestion,
    questions.length,
    installationState?.screen,
  ]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-slate-700">Loading questions...</p>
      </main>
    );
  }

  if (errorMessage && questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-slate-700">No active questions found.</p>
      </main>
    );
  }

  const isQuestionPhase = installationState?.screen === "question";

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start gap-10 p-6">
      <Logo className="mx-auto mb-10" />

      <div
        className="h-2 max-w-100 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={currentIndex + 1}
      >
        <div
          className="h-full rounded-full bg-violet-600 transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex w-full flex-row items-center justify-around">
        <Image
          src="/icons/audio-wave.svg"
          alt="Audio wave icon"
          width={128}
          height={128}
        />

        <div
          className="flex items-center justify-center rounded-3xl px-15 py-12.5"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--light-purple) 20%, transparent)",
          }}
        >
          <h1 className="mt-3 text-center text-4xl font-semibold text-white">
            {currentQuestion.text}
          </h1>
        </div>

        <Image
          src="/icons/audio-wave.svg"
          alt="Audio wave icon"
          width={128}
          height={128}
        />
      </div>

      <div className="mt-auto w-full pt-8">
        {errorMessage ? (
          <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {currentQuestion.answerOptions.map(
            (
              option: (typeof currentQuestion.answerOptions)[number],
              index: number,
            ) => {
              const zone = ZONES[index];
              const isDwelling = activeZoneFromDwell === zone;
              const strokeLength =
                isDwelling &&
                !isSubmitting &&
                installationState?.screen === "question"
                  ? (dwellProgress / 100) * CIRCUMFERENCE
                  : 0;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleAnswerClick(option.id)}
                  disabled={isSubmitting || !isQuestionPhase}
                  className={`flex min-h-24 items-center justify-between gap-4 rounded-3xl border px-5 py-4 text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition bg-[radial-gradient(circle_at_top_left,rgba(101,31,161,0.9),rgba(40,10,47,0.96))] disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDwelling
                      ? "border-white/40 scale-[1.02]"
                      : "border-white/10 hover:border-white/20 hover:-translate-y-px"
                  }`}
                >
                  <span className="text-lg font-semibold leading-tight sm:text-xl">
                    {option.label}
                  </span>

                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                    <svg
                      className="absolute inset-0 h-full w-full -rotate-90"
                      viewBox="0 0 48 48"
                    >
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="white"
                        strokeOpacity={0.15}
                        strokeWidth="3"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${strokeLength} ${CIRCUMFERENCE}`}
                        style={{ transition: "stroke-dasharray 0.05s linear" }}
                      />
                    </svg>

                    <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white shadow-md shadow-blue-500/30">
                      {index + 1}
                    </span>
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>

      <Image
        src="/icons/audio-wave.svg"
        alt="Audio wave icon"
        width={128}
        height={128}
      />
    </main>
  );
}

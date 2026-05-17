"use client";

import { useEffect } from "react";
import Image from "next/image";
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
    <main className="relative flex min-h-screen w-full flex-col items-center justify-start gap-8 overflow-hidden bg-[linear-gradient(135deg,_#140421_0%,_#250a36_40%,_#16213e_100%)] p-6">
      <div className="pointer-events-none absolute top-20 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <Image
        src="/icons/LogoTuneMatch.png"
        alt="TuneMatch logo"
        width={620}
        height={420}
        priority
        className="relative z-10 mx-auto mb-10 h-auto w-[260px] object-contain md:w-[320px]"
      />

      <div
        className="relative z-10 h-2 max-w-100 w-full overflow-hidden rounded-full bg-white/15"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={currentIndex + 1}
      >
        <div
          className="h-full rounded-full bg-fuchsia-400 transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-row items-center justify-around">
        <Image
          src="/icons/audio-wave.svg"
          alt="Audio wave icon"
          width={128}
          height={128}
          className="animate-pulse opacity-70"
        />

        <div
          className="flex items-center justify-center rounded-3xl border border-white/10 px-15 py-12.5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--light-purple) 24%, transparent)",
          }}
        >
          <h1 className="mt-3 text-center text-4xl font-medium text-white">
            {currentQuestion.text}
          </h1>
        </div>

        <Image
          src="/icons/audio-wave.svg"
          alt="Audio wave icon"
          width={128}
          height={128}
          className="animate-pulse opacity-70"
        />
      </div>

      <div className="relative z-10 mt-auto w-full pt-8">
        {errorMessage ? (
          <p className="mb-3 text-sm text-red-200">{errorMessage}</p>
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
                  className={`flex min-h-24 items-center justify-between gap-4 rounded-3xl border px-5 py-4 text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDwelling
                      ? "scale-[1.02] border-fuchsia-300/50 bg-fuchsia-500/15"
                      : "border-white/10 bg-white/8 hover:-translate-y-px hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg font-medium leading-tight sm:text-xl">
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
                        stroke="rgb(232 121 249)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${strokeLength} ${CIRCUMFERENCE}`}
                        style={{ transition: "stroke-dasharray 0.05s linear" }}
                      />
                    </svg>

                    <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-sm font-medium text-white ring-1 ring-white/20">
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
        className="relative z-10 animate-pulse opacity-55"
      />
    </main>
  );
}

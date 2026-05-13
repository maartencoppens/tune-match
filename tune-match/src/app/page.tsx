"use client";

import { useCallback, useEffect, useState } from "react";
import Logo from "../components/design/logo";
import Image from "next/image";

import type {
  Question,
  QuestionsResponse,
} from "@/core/modules/questions/types";

import type {
  ResultGenre,
  AnswersResponse,
} from "@/core/modules/answers/types";

import { ZONES, type Zone } from "@/core/modules/zones/types";

import { useInstallationState } from "@/core/hooks/useInstallationState";

const CIRCUMFERENCE = 2 * Math.PI * 20;

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedByQuestion, setSelectedByQuestion] = useState<
    Record<string, string>
  >({});

  const [resultGenre, setResultGenre] = useState<ResultGenre | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    console.log("[page] quiz state", {
      questionsLength: questions.length,
      currentIndex,
      currentQuestionId: currentQuestion?.id ?? null,
      currentQuestionText: currentQuestion?.text ?? null,
      selectedByQuestion,
      resultGenre,
      isLoading,
      isSubmitting,
      errorMessage,
    });
  }, [
    questions.length,
    currentIndex,
    currentQuestion,
    selectedByQuestion,
    resultGenre,
    isLoading,
    isSubmitting,
    errorMessage,
  ]);

  // SERVER STATE
  const { installationState, dwellProgress, confirmedZone } =
    useInstallationState();

  useEffect(() => {
    console.log("[page] server state", {
      installationState,
      dwellProgress,
      confirmedZone,
    });
  }, [installationState, dwellProgress, confirmedZone]);

  // SUBMIT ALL ANSWERS
  const submitAllAnswers = useCallback(
    async (nextSelections: Record<string, string>) => {
      console.log("[page] submitAllAnswers:start", {
        nextSelections,
        questionIds: questions.map((question) => question.id),
      });

      try {
        setIsSubmitting(true);

        setErrorMessage(null);

        const answerOptionIds = questions.map(
          (question) => nextSelections[question.id],
        );

        const response = await fetch("/api/answers", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            answerOptionIds,
          }),
        });

        const data = (await response.json()) as AnswersResponse & {
          error?: string;
        };

        console.log("[page] submitAllAnswers:response", {
          ok: response.ok,
          status: response.status,
          data,
        });

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to submit answers");
        }

        setResultGenre(data.resultGenre);
      } catch (error) {
        console.error("[page] submitAllAnswers:error", error);

        setErrorMessage(
          error instanceof Error ? error.message : "Failed to submit answers",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [questions],
  );

  // HANDLE ANSWER CLICK
  const handleAnswerClick = useCallback(
    (answerOptionId: string) => {
      console.log("[page] handleAnswerClick", {
        answerOptionId,
        currentQuestionId: currentQuestion?.id ?? null,
        currentIndex,
        isSubmitting,
      });

      if (!currentQuestion || isSubmitting) {
        console.log("[page] handleAnswerClick:ignored", {
          hasCurrentQuestion: Boolean(currentQuestion),
          isSubmitting,
        });

        return;
      }

      const nextSelections = {
        ...selectedByQuestion,

        [currentQuestion.id]: answerOptionId,
      };

      setSelectedByQuestion(nextSelections);

      const isLastQuestion = currentIndex === questions.length - 1;

      console.log("[page] handleAnswerClick:nextState", {
        nextSelections,
        isLastQuestion,
      });

      if (!isLastQuestion) {
        setCurrentIndex((previous) => previous + 1);

        return;
      }

      void submitAllAnswers(nextSelections);
    },
    [
      currentQuestion,
      isSubmitting,
      selectedByQuestion,
      currentIndex,
      questions.length,
      submitAllAnswers,
    ],
  );

  // SERVER CONFIRMED ZONE
  useEffect(() => {
    if (!confirmedZone) {
      return;
    }

    if (!currentQuestion) {
      return;
    }

    const zoneIndex = ZONES.indexOf(confirmedZone as Zone);

    const option = currentQuestion.answerOptions[zoneIndex];

    console.log("[page] confirmedZone effect", {
      confirmedZone,
      zoneIndex,
      currentQuestionId: currentQuestion.id,
      optionId: option?.id ?? null,
    });

    if (!option) {
      console.warn("[page] confirmedZone effect: no option for zone", {
        confirmedZone,
        zoneIndex,
        currentQuestionId: currentQuestion.id,
      });

      return;
    }

    handleAnswerClick(option.id);
  }, [confirmedZone, currentQuestion, handleAnswerClick]);

  // LOAD QUESTIONS
  useEffect(() => {
    const loadQuestions = async () => {
      console.log("[page] loadQuestions:start");

      try {
        setIsLoading(true);

        setErrorMessage(null);

        const response = await fetch("/api/questions");

        const data = (await response.json()) as QuestionsResponse & {
          error?: string;
        };

        console.log("[page] loadQuestions:response", {
          ok: response.ok,
          status: response.status,
          questionCount: data.questions?.length ?? 0,
          data,
        });

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load questions");
        }

        setQuestions(data.questions ?? []);
      } catch (error) {
        console.error("[page] loadQuestions:error", error);

        const message =
          error instanceof Error ? error.message : "Failed to load questions";

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuestions();
  }, []);

  // RESTART
  const restartQuiz = () => {
    console.log("[page] restartQuiz");

    setCurrentIndex(0);

    setSelectedByQuestion({});

    setResultGenre(null);

    setErrorMessage(null);
  };

  // LOADING
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-slate-700">Loading questions...</p>
      </main>
    );
  }

  // ERROR
  if (errorMessage && questions.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  // RESULT
  if (resultGenre) {
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

  // NO QUESTION
  if (!currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-slate-700">No active questions found.</p>
      </main>
    );
  }

  const progressPercent =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <main className="min-h-screen p-6 w-full flex flex-col items-center justify-start gap-10">
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
          style={{
            width: `${progressPercent}%`,
          }}
        />
      </div>

      <div className="flex flex-row justify-around items-center w-full">
        <Image
          src={"/icons/audio-wave.svg"}
          alt="Audio wave icon"
          width={128}
          height={128}
        />

        <div className="px-15 py-12.5 bg-light-purple/20 rounded-3xl flex items-center justify-center">
          <h1 className="mt-3 text-4xl font-semibold text-white text-center">
            {currentQuestion.text}
          </h1>
        </div>

        <Image
          src={"/icons/audio-wave.svg"}
          alt="Audio wave icon"
          width={128}
          height={128}
        />
      </div>

      <div className="mt-auto pt-8">
        {errorMessage ? (
          <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {currentQuestion.answerOptions.map((option, index) => {
            const zone = ZONES[index];

            const isDwelling = installationState?.activeZone === zone;

            const strokeLength = isDwelling
              ? (dwellProgress / 100) * CIRCUMFERENCE
              : 0;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleAnswerClick(option.id)}
                disabled={isSubmitting}
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
                    className="absolute inset-0 w-full h-full -rotate-90"
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
                      style={{
                        transition: "stroke-dasharray 0.05s linear",
                      }}
                    />
                  </svg>

                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white shadow-md shadow-blue-500/30">
                    {index + 1}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Image
        src={"/icons/audio-wave.svg"}
        alt="Audio wave icon"
        width={128}
        height={128}
      />
    </main>
  );
}

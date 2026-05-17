"use client";

import { useQuizState } from "@/components/functional/QuizStateProvider";
import Image from "next/image";

export default function ResultPage() {
  const { errorMessage, resultGenre, restartQuiz } = useQuizState();

  if (errorMessage && !resultGenre) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#140421_0%,_#250a36_40%,_#16213e_100%)] p-6">
        <div className="rounded-2xl border border-white/10 bg-white/6 p-6 text-center text-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm">
          <p className="text-red-200">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!resultGenre) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#140421_0%,_#250a36_40%,_#16213e_100%)] p-6">
        <p className="text-white/70">Resultaat wordt nog berekend...</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,_#140421_0%,_#250a36_40%,_#16213e_100%)] p-6">
      {" "}
      <div className="pointer-events-none absolute top-20 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />{" "}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/6 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        {" "}
        <Image
          src="/icons/LogoTuneMatch.png"
          alt="TuneMatch logo"
          width={320}
          height={180}
          priority
          className="mx-auto mb-6 h-auto w-[180px] object-contain"
        />{" "}
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-fuchsia-200/80">
          {" "}
          Jouw genre{" "}
        </p>{" "}
        <h1 className="mt-4 text-4xl font-medium tracking-tight text-white">
          {" "}
          {resultGenre.name}{" "}
        </h1>{" "}
        {resultGenre.description ? (
          <p className="mt-4 leading-relaxed text-white/70">
            {" "}
            {resultGenre.description}{" "}
          </p>
        ) : null}{" "}
        {resultGenre.artistReference ? (
          <p className="mt-4 text-sm text-white/50">
            {" "}
            Artist reference: {resultGenre.artistReference}{" "}
          </p>
        ) : null}{" "}
      </div>{" "}
    </main>
  );
}

"use client";

import Image from "next/image";

const LOGO_SRC = "/icons/LogoTuneMatch.png";
const TITLE = "Ontdek je genre";

export default function HeaderHome() {
  return (
    <header className="relative flex flex-col items-center justify-center px-6 pt-10 pb-6 text-center">
      
      {/* zachte glow */}
      <div className="absolute top-0 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        
        <Image
          src={LOGO_SRC}
          alt="TuneMatch logo"
          width={500}
          height={240}
          priority
          className="h-auto w-[240px] md:w-[320px] object-contain"
        />

        <h1 className="mt-2 text-3xl font-medium tracking-tight text-white md:text-4xl">
          {TITLE}
        </h1>

        <div className="mt-4 h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-70" />
      </div>
    </header>
  );
}
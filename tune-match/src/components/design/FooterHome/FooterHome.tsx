
export default function HomeFooter() {
  return (
    <footer className="pointer-events-none flex w-full justify-center px-6">
      <div className="relative flex flex-col items-center text-center">
        <div className="absolute inset-0 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative rounded-3xl border border-white/10 bg-white/5 px-8 py-5 shadow-[0_0_40px_rgba(217,70,239,0.18)] backdrop-blur-md">
         

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Stap op het podium
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65 md:text-base">
            Ga in de cirkel staan om het spel te starten.
          </p>
        </div>

        <div className="mt-5 h-[2px] w-32 rounded-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-70" />
      </div>
    </footer>
  );
}
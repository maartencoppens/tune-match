import Logo from "../components/design/logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <Logo className="mx-auto" />

      <div className="max-w-md">
        <h1 className="text-4xl font-semibold text-slate-900">Tune Match</h1>

        <p className="mt-4 text-slate-600">
          Wachten tot de installatie naar het volgende scherm schakelt.
        </p>
      </div>
    </main>
  );
}

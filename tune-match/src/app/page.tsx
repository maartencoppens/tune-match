import Logo from "../components/design/logo";
import ReactiveOrbClient from "@/components/design/reactiveOrb/ReactiveOrbClient";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <ReactiveOrbClient />
    </main>
  );
}

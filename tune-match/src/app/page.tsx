import ReactiveOrbClient from "@/components/design/reactiveOrb/ReactiveOrbClient";
import HeaderHome from "@/components/design/HeaderHome/HeaderHome";
import FooterHome from "@/components/design/FooterHome/FooterHome";
export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 py-8 text-center md:gap-8 md:py-10">
      <HeaderHome />
      <div className="flex w-full justify-center">
        <ReactiveOrbClient />
      </div>
      <FooterHome />
    </main>
  );
}

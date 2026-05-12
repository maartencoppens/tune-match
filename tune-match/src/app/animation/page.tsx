// app/page.tsx  (of: app/installatie/page.tsx)
//
// Zo gebruik je de MusicGenreIntro component in een Next.js pagina.
// De component is fullscreen en loopt automatisch in loop.

import MusicGenreIntro from "@/components/design/MusicGenreIntro/MusicGenreIntro";

export default function InstallatiePage() {
  return (
    // De wrapper heeft geen extra styling nodig —
    // MusicGenreIntro vult zelf 100vw × 100vh.
    <main>
      <MusicGenreIntro />
    </main>
  );
}

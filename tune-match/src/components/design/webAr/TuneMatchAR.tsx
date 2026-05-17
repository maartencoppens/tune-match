"use client";
import genreVibes from "../../../../data/genreVibes.json";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useQuizState } from "@/components/functional/QuizStateProvider";
import CameraScene from "./CameraScene";

type Genre = keyof typeof genreVibes;

const normalizedQuizGenreToVibeGenre: Record<string, Genre> = {
  pop: "pop",
  hiphop: "hiphop",
  hiphoprap: "hiphop",
  rap: "hiphop",
  edm: "techno",
  electronic: "techno",
  dance: "techno",
  indie: "rock",
  indierock: "rock",
  rock: "rock",
  punk: "metal",
  punkrock: "metal",
  metal: "metal",
};

function normalizeGenreName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—−]/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function mapQuizGenreToVibeGenre(quizGenreName?: string | null): Genre | null {
  if (!quizGenreName) {
    return null;
  }

  const normalizedQuizGenre = normalizeGenreName(quizGenreName);

  if (normalizedQuizGenreToVibeGenre[normalizedQuizGenre]) {
    return normalizedQuizGenreToVibeGenre[normalizedQuizGenre];
  }

  const directMatch = (Object.keys(genreVibes) as Genre[]).find(
    (vibeGenre) => normalizeGenreName(vibeGenre) === normalizedQuizGenre,
  );

  if (directMatch) {
    return directMatch;
  }

  console.warn("Unknown quiz genre, falling back to pop:", quizGenreName);
  return "pop";
}

type PhotoData = {
  vibeTitle: string;
  soundtrack: string;
  description: string;
  cover: string;
};

declare global {
  interface Window {
    AFRAME?: any;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(`Kon script niet laden: ${src}`);

    document.body.appendChild(script);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function ensureCameraPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera wordt niet ondersteund in deze browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  stream.getTracks().forEach((track) => track.stop());
}

function stopMindarCamera() {
  document.querySelectorAll("video").forEach((video) => {
    const mediaStream = video.srcObject as MediaStream | null;
    mediaStream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  });

  const scene = document.querySelector("a-scene");
  const mindarSystem = (scene as any)?.systems?.["mindar-face-system"];
  mindarSystem?.stop?.();
}

export default function TuneMatchAR() {
  const [scriptsReady, setScriptsReady] = useState(false);
  const [cameraLive, setCameraLive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoDownloadUrl, setPhotoDownloadUrl] = useState("");
  const { resultGenre } = useQuizState();

  const selectedGenre = mapQuizGenreToVibeGenre(resultGenre?.name);

  const cardLabelRef = useRef<any>(null);
  const cardTitleRef = useRef<any>(null);
  const cardSubtitleRef = useRef<any>(null);
  const cardDescriptionRef = useRef<any>(null);
  const cardCoverRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cameraBoxRef = useRef<HTMLDivElement | null>(null);
  const didAutoStartRef = useRef(false);

  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    const originalLog = console.log;

    const ignoredMessages = [
      "useLegacyLights",
      "FaceBlendshapesGraph",
      "OpenGL error checking is disabled",
      "Created TensorFlow Lite XNNPACK delegate",
    ];

    function shouldIgnore(message: unknown) {
      return ignoredMessages.some((ignored) =>
        String(message).includes(ignored),
      );
    }

    console.warn = (...args) => {
      if (shouldIgnore(args[0])) return;
      originalWarn(...args);
    };

    console.error = (...args) => {
      if (shouldIgnore(args[0])) return;
      originalError(...args);
    };

    console.info = (...args) => {
      if (shouldIgnore(args[0])) return;
      originalInfo(...args);
    };

    console.log = (...args) => {
      if (shouldIgnore(args[0])) return;
      originalLog(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
      console.log = originalLog;
    };
  }, []);

  useEffect(() => {
    return () => {
      stopMindarCamera();
    };
  }, []);

  useEffect(() => {
    async function setupAR() {
      try {
        setCameraError("");
        await ensureCameraPermission();

        // laad A-Frame
        await loadScript("https://aframe.io/releases/1.5.0/aframe.min.js");

        // wacht écht tot window.AFRAME bestaat
        await new Promise<void>((resolve, reject) => {
          let tries = 0;

          const interval = setInterval(() => {
            if (window.AFRAME) {
              clearInterval(interval);
              resolve();
            }

            tries++;

            if (tries > 50) {
              clearInterval(interval);
              reject(new Error("A-Frame is niet beschikbaar"));
            }
          }, 100);
        });

        // laad MindAR pas NA AFRAME
        await loadScript(
          "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-face-aframe.prod.js",
        );

        // kleine extra delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        setScriptsReady(true);
      } catch (error) {
        console.error(error);
        setCameraError(
          error instanceof Error
            ? error.message
            : "WebAR kon niet starten. Sta camera-toegang toe.",
        );
      }
    }

    setupAR();
  }, []);

  useEffect(() => {
    if (
      !scriptsReady ||
      !cameraLive ||
      !selectedGenre ||
      didAutoStartRef.current ||
      isSearching
    ) {
      return;
    }

    didAutoStartRef.current = true;
    void searchRandomSongByGenre(selectedGenre);
  }, [scriptsReady, cameraLive, isSearching, selectedGenre]);

  function set3DText(ref: React.RefObject<any>, value: string) {
    ref.current?.setAttribute("value", value);
  }

  function set3DImage(ref: React.RefObject<any>, imageUrl: string) {
    ref.current?.setAttribute("src", imageUrl);
  }

  async function startPhotoTimer(dataForPhoto: PhotoData) {
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await sleep(1000);
    }

    setCountdown(null);
    await sleep(300);

    await takeScreenshot(dataForPhoto);
  }

  async function takeScreenshot(dataForPhoto: PhotoData) {
    try {
      const video =
        (cameraBoxRef.current?.querySelector(
          "video",
        ) as HTMLVideoElement | null) ??
        (document.querySelector("video") as HTMLVideoElement | null);

      if (!video) {
        throw new Error("Geen camera video gevonden");
      }

      const width = 500;
      const height = 375;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context niet beschikbaar");
      }

      ctx.drawImage(video, 0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, height * 0.45, 0, height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const cardX = 18;
      const cardY = height - 122;
      const cardW = width - 36;
      const cardH = 104;
      const radius = 22;

      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = "rgba(14, 14, 24, 0.86)";
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (dataForPhoto.cover) {
        try {
          const cover = await loadImage(dataForPhoto.cover);

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardX + 14, cardY + 16, 72, 72, 16);
          ctx.clip();
          ctx.drawImage(cover, cardX + 14, cardY + 16, 72, 72);
          ctx.restore();
        } catch {
          console.warn("Cover kon niet geladen worden voor screenshot");
        }
      }

      const textX = cardX + 104;

      ctx.fillStyle = "#F0ABFC";
      ctx.font = "700 11px Arial";
      ctx.fillText("YOUR TUNEMATCH", textX, cardY + 28);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 22px Arial";
      ctx.fillText(dataForPhoto.vibeTitle, textX, cardY + 55);

      ctx.fillStyle = "#E879F9";
      ctx.font = "14px Arial";
      ctx.fillText(dataForPhoto.soundtrack.slice(0, 42), textX, cardY + 76);

      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.font = "12px Arial";
      ctx.fillText(dataForPhoto.description.slice(0, 50), textX, cardY + 94);

      const logo = new Image();
      logo.src = "/icons/LogoTuneMatch.png";

      await new Promise((resolve) => {
        logo.onload = resolve;
      });

      ctx.globalAlpha = 0.9;
      ctx.drawImage(logo, 18, 14, 85, 34);
      ctx.globalAlpha = 1;

      const dataUrl = canvas.toDataURL("image/png");

      const response = await fetch("/api/uploadPhoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: dataUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload naar Cloudinary mislukt");
      }

      setPhotoUrl(data.imageUrl);
      setPhotoDownloadUrl(data.downloadUrl ?? data.imageUrl);
    } catch (error) {
      console.error("Screenshot/upload fout:", error);
      alert("Screenshot maken is mislukt. Check de console.");
    }
  }

  async function artistRoulette(selectedGenre: Genre) {
    const artists = genreVibes[selectedGenre].artists;

    set3DImage(cardCoverRef, "");
    set3DText(cardLabelRef, "SCANNING VIBE");
    set3DText(cardTitleRef, "Analyzing...");
    set3DText(cardDescriptionRef, genreVibes[selectedGenre].description);

    for (let i = 0; i < 20; i++) {
      const randomArtist = artists[Math.floor(Math.random() * artists.length)];
      set3DText(cardSubtitleRef, randomArtist);
      await sleep(25 + i * 5);
    }

    const finalArtist = artists[Math.floor(Math.random() * artists.length)];

    set3DText(cardLabelRef, "YOUR VIBE IS");
    set3DText(cardTitleRef, genreVibes[selectedGenre].title);
    set3DText(cardSubtitleRef, selectedGenre.toUpperCase());
    set3DText(cardDescriptionRef, genreVibes[selectedGenre].description);

    await sleep(350);

    return finalArtist;
  }

  async function searchRandomSongByGenre(selectedGenre: Genre) {
    if (!selectedGenre) {
      alert("Geen genre gevonden uit de quiz");
      return;
    }

    if (!genreVibes[selectedGenre]) {
      alert("Quiz genre kon niet gekoppeld worden aan Deezer vibes");
      return;
    }

    setIsSearching(true);
    setPhotoUrl("");
    setPhotoDownloadUrl("");

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    try {
      const randomArtist = await artistRoulette(selectedGenre);

      set3DText(cardLabelRef, "FINDING SOUNDTRACK");
      set3DText(cardSubtitleRef, randomArtist);

      const response = await fetch(
        `/api/search?artist=${encodeURIComponent(randomArtist)}`,
      );

      const data = await response.json();
      const songsWithPreview = data.data.filter((song: any) => song.preview);

      if (songsWithPreview.length === 0) {
        alert("Geen preview gevonden");
        return;
      }

      const randomSong =
        songsWithPreview[Math.floor(Math.random() * songsWithPreview.length)];

      const coverImage =
        randomSong.album?.cover_xl ||
        randomSong.album?.cover_big ||
        randomSong.album?.cover_medium ||
        randomSong.album?.cover ||
        "";

      const newPhotoData: PhotoData = {
        vibeTitle: genreVibes[selectedGenre].title,
        soundtrack: `${randomSong.artist.name} — ${randomSong.title}`,
        description: genreVibes[selectedGenre].description,
        cover: coverImage,
      };

      set3DImage(cardCoverRef, coverImage);

      set3DText(cardLabelRef, "YOUR VIBE IS");
      set3DText(cardTitleRef, newPhotoData.vibeTitle);
      set3DText(cardSubtitleRef, newPhotoData.soundtrack);
      set3DText(cardDescriptionRef, newPhotoData.description);

      if (audioRef.current) {
        audioRef.current.src = randomSong.preview;
        audioRef.current.play();
      }

      await sleep(300);
      await startPhotoTimer(newPhotoData);
    } catch (error) {
      console.error(error);
      alert("Er ging iets mis");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(135deg,_#140421_0%,_#250a36_40%,_#16213e_100%)] px-8 py-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-center lg:gap-20">
        <div className="flex flex-col items-center">
          <CameraScene
            scriptsReady={scriptsReady}
            cameraLive={cameraLive}
            countdown={countdown}
            cameraBoxRef={cameraBoxRef}
            className="relative h-[375px] w-[500px] max-w-full overflow-hidden rounded-[28px] border border-fuchsia-400/40 bg-black/15 shadow-[0_0_40px_rgba(217,70,239,0.2)]"
            onCameraLive={() => setCameraLive(true)}
            onCameraError={(message) => setCameraError(message)}
            cardLabelRef={cardLabelRef}
            cardTitleRef={cardTitleRef}
            cardSubtitleRef={cardSubtitleRef}
            cardDescriptionRef={cardDescriptionRef}
            cardCoverRef={cardCoverRef}
          />

          {cameraError ? (
            <p className="mt-4 text-sm text-red-300">{cameraError}</p>
          ) : null}
        </div>

        <div className="flex max-w-md flex-col items-center text-center gap-4">
          <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">
            {resultGenre?.name ?? "Loading"}
          </h1>

          <p className="mt-3 text-lg font-medium text-fuchsia-300">
            Jouw muziek genre vibe in
          </p>

          <p className="mt-3 text-base leading-relaxed text-white/70">
            {selectedGenre
              ? genreVibes[selectedGenre]?.description
              : isSearching
                ? "Finding your soundtrack..."
                : "Waiting for the quiz result to start the search."}
          </p>

          <p className="mt-6 text-sm text-white/45">
            Quiz resultaat: {resultGenre?.name ?? "waiting for result"}
          </p>

          {photoUrl && (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/6 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              <p className="mb-4 text-sm text-white/65">
                Scan om je foto te downloaden
              </p>

              <div className="overflow-hidden rounded-2xl bg-white p-3">
                <QRCodeSVG value={photoDownloadUrl || photoUrl} size={180} />
              </div>

              <p className="mt-4 text-sm text-white/45">Share your result</p>

              <a
                href={photoDownloadUrl || photoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Open foto
              </a>
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} controls className="hidden" />
    </main>
  );
}

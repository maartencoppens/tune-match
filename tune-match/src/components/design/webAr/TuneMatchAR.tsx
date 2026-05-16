"use client";
import genreVibes from "../../../../data/genreVibes.json";
import { useEffect, useRef, useState } from "react";
import CameraScene from "./CameraScene";

type Genre = keyof typeof genreVibes;

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

export default function TuneMatchAR() {
  const [genre, setGenre] = useState("");
  const [arReady, setArReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const cardLabelRef = useRef<any>(null);
  const cardTitleRef = useRef<any>(null);
  const cardSubtitleRef = useRef<any>(null);
  const cardDescriptionRef = useRef<any>(null);
  const cardCoverRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cameraBoxRef = useRef<HTMLDivElement | null>(null);

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
    async function setupAR() {
      try {
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

        setArReady(true);
      } catch (error) {
        console.error(error);
      }
    }

    setupAR();
  }, []);

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
      const video = document.querySelector("video") as HTMLVideoElement | null;

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

      ctx.fillStyle = "#00FFFF";
      ctx.font = "700 11px Arial";
      ctx.fillText("YOUR TUNEMATCH", textX, cardY + 28);

      ctx.fillStyle = "#FFD400";
      ctx.font = "700 22px Arial";
      ctx.fillText(dataForPhoto.vibeTitle, textX, cardY + 55);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "14px Arial";
      ctx.fillText(dataForPhoto.soundtrack.slice(0, 42), textX, cardY + 76);

      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.font = "12px Arial";
      ctx.fillText(dataForPhoto.description.slice(0, 50), textX, cardY + 94);

      ctx.fillStyle = "rgba(255,255,255,0.86)";
      ctx.font = "700 18px Arial";
      ctx.fillText("TuneMatch 🎵", 18, 32);

      const dataUrl = canvas.toDataURL("image/png");

      const response = await fetch("/api/upload-photo", {
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

  async function searchRandomSongByGenre() {
    const selectedGenre = genre.trim().toLowerCase() as Genre;

    if (!selectedGenre) {
      alert("Typ eerst een genre");
      return;
    }

    if (!genreVibes[selectedGenre]) {
      alert("Genre niet gevonden. Probeer: pop, rock, hiphop, techno of metal");
      return;
    }

    setIsSearching(true);
    setPhotoUrl("");

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
    <main className="page">
      <h1>TuneMatch 🎵</h1>

      <div className="controls">
        <input
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          placeholder="Typ genre bv. rock"
        />

        <button onClick={searchRandomSongByGenre} disabled={isSearching}>
          {isSearching ? "Scanning..." : "Scan my vibe"}
        </button>
      </div>

      <p>Testgenres: pop, rock, hiphop, techno, metal</p>

      <audio ref={audioRef} controls />

      <CameraScene
        arReady={arReady}
        countdown={countdown}
        cameraBoxRef={cameraBoxRef}
        cardLabelRef={cardLabelRef}
        cardTitleRef={cardTitleRef}
        cardSubtitleRef={cardSubtitleRef}
        cardDescriptionRef={cardDescriptionRef}
        cardCoverRef={cardCoverRef}
      />

      {photoUrl && (
        <div className="photo-result">
          <h2>Your TuneMatch Photo</h2>

          <img src={photoUrl} alt="TuneMatch screenshot" />

          <a href={photoUrl} target="_blank">
            Open Photo
          </a>

          <div className="qr-wrapper"></div>
        </div>
      )}
    </main>
  );
}

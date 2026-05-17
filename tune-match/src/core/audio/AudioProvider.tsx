import React, { createContext, useContext, useEffect, useRef } from "react";
import { useInstallationState } from "../hooks/useInstallationState";

type AudioContextType = { analyser: AnalyserNode | null };

const AudioCtx = createContext<AudioContextType>({ analyser: null });

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { installationState } = useInstallationState();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    const Ctor =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const ac: AudioContext = new Ctor();
    audioContextRef.current = ac;

    const src = ac.createMediaElementSource(audio);
    const analyser = ac.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyser.connect(ac.destination);
    analyserRef.current = analyser;

    return () => {
      try {
        src.disconnect();
        analyser.disconnect();
      } catch (e) {}
      try {
        audio.pause();
        audio.src = "";
      } catch (e) {}
      try {
        if (
          audioContextRef.current &&
          typeof audioContextRef.current.close === "function"
        ) {
          audioContextRef.current.close();
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    const screen = installationState?.screen;
    const audio = audioRef.current;
    const ac = audioContextRef.current;
    if (!audio) return;

    const map: Record<string, string | null> = {
      idle: "/audio/idle.mp3",
      intro: "/audio/intro.mp3",
      question: "/audio/question.mp3",
      answer_reveal: "/audio/question.mp3",
      result: "/audio/result.mp3",
      photo: null,
    };

    const next = map[screen as string] ?? null;
    if (!next) {
      audio.pause();
      audio.src = "";
      return;
    }

    if (audio.src !== next) audio.src = next;

    (async () => {
      try {
        if (ac && ac.state === "suspended") await ac.resume();
        await audio.play();
      } catch (e) {
        // ignore autoplay errors; app remains simple
      }
    })();
  }, [installationState?.screen]);

  return (
    <AudioCtx.Provider value={{ analyser: analyserRef.current }}>
      {children}
    </AudioCtx.Provider>
  );
};

export function useAudio() {
  return useContext(AudioCtx);
}

export default AudioProvider;

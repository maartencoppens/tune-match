"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useInstallationState } from "@/core/hooks/useInstallationState";

const PHOTO_PATH = "/photo";

/** Full reload so R3F (three@0.184) and MindAR/A-Frame (three@0.158) never share a tab session. */
function shouldHardNavigate(from: string, to: string) {
  return from === PHOTO_PATH || to === PHOTO_PATH;
}

function screenToPath(screen: string | undefined) {
  switch (screen) {
    case "idle":
      return "/";
    case "intro":
      return "/intro";
    case "question":
      return "/quiz";
    case "answer_reveal":
      return "/quiz/reveal";
    case "result":
      return "/result";
    case "photo":
      return "/photo";
    default:
      return "/";
  }
}

export default function StateDrivenRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { installationState } = useInstallationState();

  useEffect(() => {
    // Wait for server state — null defaults to "/" and would ping-pong with /photo on hard reload.
    if (!installationState) return;

    const nextPath = screenToPath(installationState.screen);

    if (nextPath !== pathname) {
      if (shouldHardNavigate(pathname, nextPath)) {
        window.location.replace(nextPath);
        return;
      }
      router.replace(nextPath);
    }
  }, [installationState, pathname, router]);

  return null;
}

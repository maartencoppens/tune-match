"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useInstallationState } from "@/core/hooks/useInstallationState";

function screenToPath(screen: string | undefined) {
  switch (screen) {
    case "idle":
      return "/";
    case "question":
      return "/quiz";
    case "answer_reveal":
      return "/quiz/reveal";
    case "result":
      return "/result";
    default:
      return "/";
  }
}

export default function StateDrivenRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const { installationState } = useInstallationState();

  useEffect(() => {
    const nextPath = screenToPath(installationState?.screen);

    if (nextPath !== pathname) {
      router.replace(nextPath);
    }
  }, [installationState?.screen, pathname, router]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";

type CameraSceneProps = {
  scriptsReady: boolean;
  cameraLive: boolean;
  countdown: number | null;
  cameraBoxRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  onCameraLive: () => void;
  onCameraError: (message: string) => void;
  cardLabelRef: any;
  cardTitleRef: any;
  cardSubtitleRef: any;
  cardDescriptionRef: any;
  cardCoverRef: any;
};

function attachMindarVideoToBox(
  box: HTMLDivElement,
  canvas: HTMLCanvasElement | null,
) {
  document.querySelectorAll("video").forEach((video) => {
    if (!box.contains(video)) {
      video.style.objectFit = "cover";
      box.prepend(video);
    }
  });

  if (canvas && !box.contains(canvas)) {
    box.appendChild(canvas);
  }
}

export default function CameraScene({
  scriptsReady,
  cameraLive,
  countdown,
  cameraBoxRef,
  className,
  onCameraLive,
  onCameraError,
  cardLabelRef,
  cardTitleRef,
  cardSubtitleRef,
  cardDescriptionRef,
  cardCoverRef,
}: CameraSceneProps) {
  const sceneRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !scriptsReady) return;

    const handleReady = () => {
      const box = cameraBoxRef.current;
      const canvas = scene.querySelector(
        "canvas.a-canvas",
      ) as HTMLCanvasElement | null;

      if (box) {
        attachMindarVideoToBox(box, canvas);
      }

      onCameraLive();
    };

    const handleError = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      onCameraError(
        typeof detail === "string"
          ? detail
          : "Camera kon niet gestart worden. Check permissies en sluit andere camera-apps.",
      );
    };

    scene.addEventListener("arReady", handleReady);
    scene.addEventListener("arError", handleError);

    return () => {
      scene.removeEventListener("arReady", handleReady);
      scene.removeEventListener("arError", handleError);
    };
  }, [scriptsReady, cameraBoxRef, onCameraLive, onCameraError]);

  const showLoading = !cameraLive;
  const containerClasses =
    className ??
    "mindar-camera-box relative mx-auto mt-6 h-[375px] w-[500px] max-w-full overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl";

  return (
    <div ref={cameraBoxRef} className={containerClasses}>
      {countdown && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/30 text-8xl font-black text-white">
          {countdown}
        </div>
      )}

      {showLoading && (
        <div className="absolute inset-0 z-40 grid place-items-center text-sm text-white/70">
          {scriptsReady ? "Camera starten..." : "WebAR wordt geladen..."}
        </div>
      )}

      {scriptsReady && (
        <a-scene
          ref={sceneRef}
          mindar-face="uiLoading: no; uiScanning: no; uiError: no"
          embedded=""
          color-space="sRGB"
          renderer="colorManagement: true"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          class="absolute inset-0 h-full w-full"
        >
          <a-camera
            active="false"
            position="0 0 0"
            look-controls="enabled: false"
            wasd-controls="enabled: false"
          ></a-camera>

          <a-entity mindar-face-target="anchorIndex: 10">
            <a-plane
              position="0 1.05 -0.08"
              width="3.2"
              height="1.25"
              color="#11111A"
              opacity="0.86"
              material="transparent: true"
            ></a-plane>

            <a-image
              ref={cardCoverRef}
              src=""
              position="-1.05 1.05 0"
              width="0.72"
              height="0.72"
            ></a-image>

            <a-text
              ref={cardLabelRef}
              value="TUNEMATCH"
              position="0.35 1.4 0"
              align="center"
              color="#00FFFF"
              width="2.25"
            ></a-text>

            <a-text
              ref={cardTitleRef}
              value="Scan your vibe"
              position="0.35 1.18 0"
              align="center"
              color="#FFD400"
              width="2.35"
            ></a-text>

            <a-text
              ref={cardSubtitleRef}
              value="Choose a genre"
              position="0.35 0.96 0"
              align="center"
              color="#FFFFFF"
              width="2.1"
            ></a-text>

            <a-text
              ref={cardDescriptionRef}
              value="pop · rock · hiphop · techno · metal"
              position="0.35 0.76 0"
              align="center"
              color="#CCCCCC"
              width="2"
            ></a-text>
          </a-entity>
        </a-scene>
      )}
    </div>
  );
}

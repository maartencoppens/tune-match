"use client";

type CameraSceneProps = {
  arReady: boolean;
  countdown: number | null;
  cameraBoxRef: React.RefObject<HTMLDivElement | null>;
  cardLabelRef: any;
  cardTitleRef: any;
  cardSubtitleRef: any;
  cardDescriptionRef: any;
  cardCoverRef: any;
};

export default function CameraScene({
  arReady,
  countdown,
  cameraBoxRef,
  cardLabelRef,
  cardTitleRef,
  cardSubtitleRef,
  cardDescriptionRef,
  cardCoverRef,
}: CameraSceneProps) {
  return (
    <div
      ref={cameraBoxRef}
      className="relative mx-auto mt-6 h-[375px] w-[500px] max-w-full overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl"
    >
      {countdown && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/30 text-8xl font-black text-white">
          {countdown}
        </div>
      )}

      {!arReady && (
        <div className="absolute inset-0 grid place-items-center text-sm text-white/70">
          WebAR wordt geladen...
        </div>
      )}

      {arReady && (
        <a-scene
          mindar-face=""
          embedded=""
          color-space="sRGB"
          renderer="colorManagement: true; preserveDrawingBuffer: true"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          class="h-[375px] w-[500px]"
        >
          <a-camera
            position="0 0 0"
            camera="fov: 80"
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

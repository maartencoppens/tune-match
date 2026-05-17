"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type AudioData = {
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
};

function getAverageFrequency(audioData: AudioData, start = 0, end = 40) {
  if (!audioData.analyser || !audioData.dataArray) return 0;

  audioData.analyser.getByteFrequencyData(
    audioData.dataArray as Uint8Array<ArrayBuffer>,
  );

  const safeEnd = Math.min(end, audioData.dataArray.length);
  const range = audioData.dataArray.slice(start, safeEnd);

  if (range.length === 0) return 0;

  const average = range.reduce((sum, value) => sum + value, 0) / range.length;
  return average / 255;
}

function NeonWireOrb({ audioData }: { audioData: AudioData }) {
  const orbRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const dotsRef = useRef<THREE.Points>(null);

  const smoothBass = useRef(0);
  const smoothMid = useRef(0);
  const smoothHigh = useRef(0);

  const baseRadius = 0.95;

  const originalPositions = useMemo(() => {
    const geometry = new THREE.SphereGeometry(baseRadius, 120, 120);
    return geometry.attributes.position.array.slice() as Float32Array;
  }, []);

  const dotPositions = useMemo(() => {
    const count = 1300;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.28 + Math.random() * 0.42;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    const bass = getAverageFrequency(audioData, 0, 28);
    const mid = getAverageFrequency(audioData, 28, 120);
    const high = getAverageFrequency(audioData, 120, 260);

    smoothBass.current = THREE.MathUtils.lerp(smoothBass.current, bass, 0.13);
    smoothMid.current = THREE.MathUtils.lerp(smoothMid.current, mid, 0.095);
    smoothHigh.current = THREE.MathUtils.lerp(smoothHigh.current, high, 0.075);

    const boostedBass = Math.pow(smoothBass.current, 0.55);
    const boostedMid = Math.pow(smoothMid.current, 0.65);
    const boostedHigh = Math.pow(smoothHigh.current, 0.7);

    if (orbRef.current) {
      const geometry = orbRef.current.geometry as THREE.BufferGeometry;
      const position = geometry.attributes.position as THREE.BufferAttribute;

      for (let i = 0; i < position.count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const normal = new THREE.Vector3(ox, oy, oz).normalize();

        const wave =
          Math.sin(ox * 5.4 + time * 1.7) * 0.105 +
          Math.sin(oy * 6.8 + time * 1.45) * 0.095 +
          Math.sin((ox + oy + oz) * 5.1 + time * 1.9) * 0.085;

        const smallSpikes =
          Math.sin(ox * oy * 12.5 + time * 3.4) * boostedHigh * 0.18 +
          Math.sin(oy * oz * 10.5 + time * 2.9) * boostedMid * 0.16 +
          Math.sin(ox * oz * 13.5 + time * 3.8) * boostedBass * 0.12;

        const audioPulse =
          boostedBass * 0.18 + boostedMid * 0.09 + boostedHigh * 0.05;

        const breathing = Math.sin(time * 1.05) * 0.025;
        const radius = baseRadius + wave + smallSpikes + audioPulse + breathing;

        position.setXYZ(
          i,
          normal.x * radius,
          normal.y * radius,
          normal.z * radius,
        );
      }

      position.needsUpdate = true;
      geometry.computeVertexNormals();

      orbRef.current.rotation.y = time * 0.13;
      orbRef.current.rotation.x = Math.sin(time * 0.28) * 0.16;
      orbRef.current.rotation.z = Math.sin(time * 0.22) * 0.09;
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.05 + boostedBass * 0.16);
      glowRef.current.rotation.y = -time * 0.07;
    }

    if (dotsRef.current) {
      dotsRef.current.rotation.y = time * 0.055;
      dotsRef.current.rotation.x = Math.sin(time * 0.25) * 0.12;
      dotsRef.current.scale.setScalar(
        1 + boostedBass * 0.1 + boostedHigh * 0.08,
      );
    }
  });

  return (
    <>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.12, 100, 100]} />
        <meshBasicMaterial
          color="#8b2cff"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={orbRef}>
        <sphereGeometry args={[0.95, 120, 120]} />
        <meshBasicMaterial
          color="#ff4dff"
          wireframe
          transparent
          opacity={0.86}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points ref={dotsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dotPositions, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.018}
          color="#9b5cff"
          transparent
          opacity={0.72}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  );
}

function SoftStars() {
  const ref = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5.5;
    }

    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const time = clock.getElapsedTime();
    ref.current.rotation.y = time * 0.018;
    ref.current.rotation.x = Math.sin(time * 0.2) * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>

      <pointsMaterial
        size={0.012}
        color="#ffffff"
        transparent
        opacity={0.2}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ReactiveOrb(
  { scale = 1 }: { scale?: number } = { scale: 1 },
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceCreatedRef = useRef(false);

  const [audioData, setAudioData] = useState<AudioData>({
    analyser: null,
    dataArray: null,
  });

  useEffect(() => {
    async function setupAudio() {
      // Probeer eerst een bestaande <audio> op de pagina te gebruiken (bv. TuneMatchAR).
      if (!audioRef.current) {
        const found = document.querySelector(
          "audio",
        ) as HTMLAudioElement | null;
        if (found) {
          audioRef.current = found;
          // als het audio-element al geluid speelt, log dat we het gebruiken
          // eslint-disable-next-line no-console
          console.log(
            "ReactiveOrb: using existing <audio> element for analysis",
          );
        }
      }

      if (!audioRef.current) {
        // Geen audio-element gevonden; nothing to analyze.
        // eslint-disable-next-line no-console
        console.warn(
          "ReactiveOrb: geen <audio> element gevonden — orb reageert alleen op aanwezige audio.",
        );
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (!sourceCreatedRef.current) {
        try {
          // createMediaElementSource vereist dat het audio element een HTMLAudioElement is
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaElementSource(
            audioRef.current,
          );

          analyser.fftSize = 1024;
          analyser.smoothingTimeConstant = 0.74;

          source.connect(analyser);

          // Als je audio hoorbaar wil via deze context, kun je de volgende regel activeren:
          // analyser.connect(audioContext.destination);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          setAudioData({ analyser, dataArray });

          sourceCreatedRef.current = true;
          // eslint-disable-next-line no-console
          console.log("ReactiveOrb: WebAudio analyser aangemaakt");
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            "ReactiveOrb: kon MediaElementSource niet aanmaken:",
            err,
          );
          return;
        }
      }

      try {
        // Resume audio context in geval van gebruikers-interactie vereiste
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        // probeer audio te spelen als het element nog niet speelt (vaak al aanwezig in app)
        audioRef.current.muted = true;
        await audioRef.current.play().catch(() => {
          // autoplay kan geblokkeerd worden; dat is ok
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("ReactiveOrb: probleem bij starten audio playback:", err);
      }
    }

    setupAudio();
  }, []);

  return (
    <div className="orb-container" style={{ transform: `scale(${scale})` }}>
      <div className="orb-background-glow" />

      <Canvas camera={{ position: [0, 0, 3.8], fov: 55 }}>
        <ambientLight intensity={1.7} />
        <pointLight position={[-2.5, 1.8, 3]} intensity={3.2} color="#00cfff" />
        <pointLight position={[2.5, -1.2, 3]} intensity={3.1} color="#ff3cff" />

        <SoftStars />
        <NeonWireOrb audioData={audioData} />
      </Canvas>

      <div className="orb-vignette" />
    </div>
  );
}

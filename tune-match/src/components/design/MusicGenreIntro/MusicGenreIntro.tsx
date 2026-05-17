"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import styles from "./MusicGenreIntro.module.css";
import { useAudio } from "@/core/audio/AudioProvider";

// ─────────────────────────────────────────────
// TEKSTEN — pas hier makkelijk alle teksten aan
// ─────────────────────────────────────────────
const COPY = {
  scene1: {
    instruction: "Stap in de cirkel om te starten",
    sub: "De installatie detecteert jouw positie",
  },
  scene2: {
    instruction: "Beantwoord enkele korte vragen",
    question: "Welke vibe past vandaag bij jou?",
  },
  scene3: {
    instruction: "Stap op het kleurvak van je keuze",
    answers: [
      { label: "A", text: "Energiek", color: "var(--c-purple)" },
      { label: "B", text: "Chill", color: "var(--c-cyan)" },
      { label: "C", text: "Rebels", color: "var(--c-orange)" },
      { label: "D", text: "Dansbaar", color: "var(--c-green)" },
    ],
  },
  scene4: {
    instruction: "Ontdek jouw muziekgenre",
    result: "Jouw genre:",
    genre: "Electro Pop",
  },
  scene5: {
    instruction: "Scan de QR-code en download je foto",
    sub: "Bewaar je resultaat voor altijd",
  },
};

// ─────────────────────────────────────────────
// TIMING — pas hier de duur van elke scene aan (seconden)
// ─────────────────────────────────────────────
const TIMING = {
  scene1: 1,
  scene2: 3,
  scene3: 4,
  scene4: 2,
  scene5: 2,
  fadeSpeed: 0.5,
};

export default function MusicGenreIntro() {
  const { playVoice } = useAudio();
  // ── Refs ──────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);

  // Instructiescherm
  const instructionRef = useRef<HTMLDivElement>(null);
  const instructionTextRef = useRef<HTMLParagraphElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Vloer & cirkel
  const circleRef = useRef<HTMLDivElement>(null);
  const circleGlowRef = useRef<HTMLDivElement>(null);

  // Avatar / hologram-mannetje
  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarBodyRef = useRef<HTMLDivElement>(null);

  // Kleurvakken (4 stuks)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Equalizer bars (scene 4)
  const eqRef = useRef<HTMLDivElement>(null);
  const eqBars = useRef<(HTMLDivElement | null)[]>([]);

  // QR (scene 5)
  const qrRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Particles decoratief
  const particlesRef = useRef<HTMLDivElement>(null);

  // Neon glow overlay (scene 4)
  const glowOverlayRef = useRef<HTMLDivElement>(null);

  // ── GSAP Timeline ─────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Verberg alle scenes en elementen bij start
      gsap.set(
        [
          questionRef.current,
          resultRef.current,
          eqRef.current,
          qrRef.current,
          phoneRef.current,
          glowOverlayRef.current,
        ],
        { autoAlpha: 0 },
      );
      gsap.set(avatarRef.current, { y: 120, autoAlpha: 0 });
      gsap.set(eqBars.current, { scaleY: 0.1, transformOrigin: "bottom" });
      gsap.set(panelRefs.current, { opacity: 0.25 });
      gsap.set(qrRef.current, { scale: 0.8, autoAlpha: 0 });
      gsap.set(phoneRef.current, { x: -60, autoAlpha: 0 });

      const tl = gsap.timeline({ repeat: -1 });

      // ─────────────────────────────────────
      // SCENE 1 — Stap in de cirkel
      // ─────────────────────────────────────
      tl.call(() => {
        setInstruction(COPY.scene1.instruction);
        playVoice("/audio/explanation/scene1.mp3");
      })
        // Cirkel pulseert
        .to(
          circleGlowRef.current,
          {
            scale: 1.18,
            opacity: 0.9,
            duration: 1.2,
            ease: "power1.inOut",
            yoyo: true,
            repeat: 2,
          },
          0,
        )
        // Avatar verschijnt, beweegt naar midden
        .to(
          avatarRef.current,
          { y: 0, autoAlpha: 1, duration: 1.2, ease: "back.out(1.4)" },
          0.4,
        )
        // Particles animeren subtiel
        .to(
          particlesRef.current,
          { opacity: 0.7, duration: 1.5, ease: "power1.inOut" },
          0,
        )
        // Scene 1 houdt vast
        .to({}, { duration: TIMING.scene1 - 1.5 })

        // ─────────────────────────────────────
        // SCENE 2 — Vragen
        // ─────────────────────────────────────
        .call(() => {
          setInstruction(COPY.scene2.instruction);
          playVoice("/audio/explanation/scene2.mp3");
        })
        .to(questionRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: TIMING.fadeSpeed,
          ease: "power2.out",
        })
        // Kleurvakken lichten één voor één op
        .to(
          panelRefs.current[0],
          { opacity: 1, duration: 0.4, ease: "power2.out" },
          "+=0.3",
        )
        .to(panelRefs.current[0], { opacity: 0.3, duration: 0.4, delay: 0.3 })
        .to(panelRefs.current[1], {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(panelRefs.current[1], { opacity: 0.3, duration: 0.4, delay: 0.3 })
        .to(panelRefs.current[2], {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(panelRefs.current[2], { opacity: 0.3, duration: 0.4, delay: 0.3 })
        .to(panelRefs.current[3], {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(panelRefs.current[3], { opacity: 0.3, duration: 0.4, delay: 0.3 })
        .to({}, { duration: 0.6 })
        // Fade out vraag
        .to(questionRef.current, { autoAlpha: 0, duration: TIMING.fadeSpeed })

        // ─────────────────────────────────────
        // SCENE 3 — Stap op het kleurvak
        // ─────────────────────────────────────
        .call(() => {
          setInstruction(COPY.scene3.instruction);
          playVoice("/audio/explanation/scene3.mp3");
        }) // Alle 4 panelen zichtbaar met labels
        .to(panelRefs.current, { opacity: 0.7, duration: 0.5, stagger: 0.1 })
        // Avatar beweegt naar paneel B (rechtsonder)
        .to(
          avatarRef.current,
          { x: 170, y: -120, duration: 1.4, ease: "power2.inOut" },
          "+=0.4",
        )
        // Paneel B licht sterk op + selectie pulse
        .to(panelRefs.current[1], { opacity: 1, scale: 1.08, duration: 0.4 })
        .to(panelRefs.current[1], { scale: 1, duration: 0.3 })
        .to(panelRefs.current[1], { opacity: 1, scale: 1.05, duration: 0.3 })
        .to(panelRefs.current[1], { scale: 1, duration: 0.3 })
        .to({}, { duration: 1 })
        // Avatar terug naar midden
        .to(avatarRef.current, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "power2.inOut",
        })
        .to(panelRefs.current, { opacity: 0.25, duration: 0.4 })

        // ─────────────────────────────────────
        // SCENE 4 — Resultaat
        // ─────────────────────────────────────
        .call(() => {
          setInstruction(COPY.scene4.instruction);
          playVoice("/audio/explanation/scene4.mp3");
        })
        // Neon glow achtergrond flitst kort op
        .to(
          glowOverlayRef.current,
          { autoAlpha: 0.35, duration: 0.6, ease: "power2.out" },
          "+=0.1",
        )
        // Equalizer bars
        .to(eqRef.current, { autoAlpha: 1, duration: 0.4 })
        .to(
          eqBars.current,
          {
            scaleY: () => gsap.utils.random(0.4, 1),
            duration: 0.25,
            stagger: 0.04,
            ease: "power1.inOut",
            repeat: 3,
            yoyo: true,
          },
          "<",
        )
        // Resultaat tekst verschijnt
        .to(
          resultRef.current,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" },
          "-=1",
        )
        .to({}, { duration: 1.5 })
        // Fade alles weg
        .to([eqRef.current, resultRef.current, glowOverlayRef.current], {
          autoAlpha: 0,
          duration: TIMING.fadeSpeed,
          stagger: 0.1,
        })

        // ─────────────────────────────────────
        // SCENE 5 — QR-code
        // ─────────────────────────────────────
        .call(() => {
          setInstruction(COPY.scene5.instruction);
          playVoice("/audio/explanation/scene5.mp3");
        })
        .to(
          qrRef.current,
          { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.3)" },
          "+=0.2",
        )
        // Smartphone beweegt richting QR
        .to(phoneRef.current, {
          autoAlpha: 1,
          x: 0,
          duration: 0.7,
          ease: "power2.out",
        })
        // QR pulseert
        .to(qrRef.current, {
          scale: 1.08,
          duration: 0.6,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 3,
        })
        .to({}, { duration: 0.8 })
        // Reset alles voor scene 1
        .to([qrRef.current, phoneRef.current], {
          autoAlpha: 0,
          duration: TIMING.fadeSpeed,
          stagger: 0.1,
        })
        .to(gsap.utils.toArray(panelRefs.current), {
          opacity: 0.25,
          duration: 0.4,
        })
        .to(avatarRef.current, { autoAlpha: 0, y: 80, duration: 0.6 })
        .to({}, { duration: 1 });
    }, containerRef);

    return () => ctx.revert(); // opkuisen bij unmount
  }, []);

  // Hulpfunctie om instructietekst te wisselen
  function setInstruction(text: string) {
    if (instructionTextRef.current) {
      gsap.to(instructionTextRef.current, {
        autoAlpha: 0,
        y: -8,
        duration: 0.25,
        onComplete: () => {
          if (instructionTextRef.current) {
            instructionTextRef.current.textContent = text;
            gsap.to(instructionTextRef.current, {
              autoAlpha: 1,
              y: 0,
              duration: 0.35,
              ease: "power2.out",
            });
          }
        },
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.wrapper}
      aria-label="Interactieve installatie introductie"
    >
      {/* ── Decoratieve neon particles ── */}
      <div ref={particlesRef} className={styles.particles} aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className={styles.particle}
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Neon glow overlay (scene 4) ── */}
      <div
        ref={glowOverlayRef}
        className={styles.glowOverlay}
        aria-hidden="true"
      />

      {/* ── Instructiescherm bovenaan ── */}
      <div ref={instructionRef} className={styles.screen}>
        <div className={styles.screenInner}>
          <span className={styles.screenBadge}>● LIVE</span>
          <p ref={instructionTextRef} className={styles.instructionText}>
            {COPY.scene1.instruction}
          </p>

          {/* Scene 2: Vraagblok */}
          <div
            ref={questionRef}
            className={styles.questionBlock}
            aria-hidden="true"
          >
            <p className={styles.questionLabel}>VRAAG</p>
            <p className={styles.questionText}>{COPY.scene2.question}</p>
          </div>

          {/* Scene 4: Resultaat */}
          <div
            ref={resultRef}
            className={styles.resultBlock}
            aria-hidden="true"
          >
            <p className={styles.resultLabel}>{COPY.scene4.result}</p>
            <p className={styles.resultGenre}>{COPY.scene4.genre}</p>
          </div>
        </div>

        {/* Equalizer bars in scherm */}
        <div ref={eqRef} className={styles.equalizer} aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                eqBars.current[i] = el;
              }}
              className={styles.eqBar}
              style={{ "--idx": i } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* ── Centrale installatie ── */}
      <div className={styles.stage}>
        {/* Vloerpanelen (4 kleurvakken) */}
        <div className={styles.floor} aria-hidden="true">
          {COPY.scene3.answers.map((ans, i) => (
            <div
              key={ans.label}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className={styles.panel}
              style={{ "--panel-color": ans.color } as React.CSSProperties}
            >
              <span className={styles.panelLabel}>{ans.label}</span>
              <span className={styles.panelText}>{ans.text}</span>
            </div>
          ))}

          {/* Centrale cirkel */}
          <div className={styles.circleWrap}>
            <div
              ref={circleGlowRef}
              className={styles.circleGlow}
              aria-hidden="true"
            />
            <div ref={circleRef} className={styles.circle}>
              <span className={styles.circleCenter}>●</span>
            </div>
          </div>
        </div>

        {/* Hologram avatar */}
        <div ref={avatarRef} className={styles.avatar} aria-hidden="true">
          <div className={styles.avatarHead} />
          <div ref={avatarBodyRef} className={styles.avatarBody} />
          <div className={styles.avatarLegs}>
            <div className={styles.avatarLeg} />
            <div className={styles.avatarLeg} />
          </div>
          <div className={styles.avatarScan} />
        </div>
      </div>

      {/* ── QR-code (scene 5) ── */}
      <div ref={qrRef} className={styles.qrBlock} aria-hidden="true">
        {/* QR placeholder grid */}
        <div className={styles.qrCode}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={styles.qrCell}
              style={{ "--qi": i } as React.CSSProperties}
            />
          ))}
        </div>
        <p className={styles.qrLabel}>Scan mij</p>
      </div>

      {/* Smartphone icoon (scene 5) */}
      <div ref={phoneRef} className={styles.phone} aria-hidden="true">
        <div className={styles.phoneScreen} />
        <div className={styles.phoneBtn} />
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

const ReactiveOrb = dynamic(() => import("./ReactiveOrb"), { ssr: false });

export default function ReactiveOrbClient() {
  return <ReactiveOrb scale={0.98} />;
}

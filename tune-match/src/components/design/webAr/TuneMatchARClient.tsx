"use client";

import dynamic from "next/dynamic";

const TuneMatchAR = dynamic(() => import("./TuneMatchAR"), {
  ssr: false,
  loading: () => <p className="p-6 text-white/70">WebAR wordt geladen...</p>,
});

export default function TuneMatchARClient() {
  return <TuneMatchAR />;
}

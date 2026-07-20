"use client";
import dynamic from "next/dynamic";
import type { OrbitalBody, Transmission, MapSettings } from "./types";

const OrbitalMap = dynamic(() => import("./orbital-map"), { ssr: false });

interface Props {
  bodies: OrbitalBody[];
  settings: MapSettings;
  transmissions: Transmission[];
  initialBodySlug?: string | null;
}

export default function OrbitalMapLoader(props: Props) {
  return <OrbitalMap {...props} />;
}

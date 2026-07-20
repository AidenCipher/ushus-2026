"use client";
import dynamic from "next/dynamic";
const ChariotWheelCursor = dynamic(
  () => import("./ChariotWheelCursor").then(m => m.ChariotWheelCursor),
  { ssr: false }
);
export function CursorProvider() {
  return <ChariotWheelCursor />;
}

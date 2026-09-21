"use client";

import { useEffect } from "react";
import { StudioShell } from "@/components/studio/shell";
import { useStudio } from "@/lib/studio/store";

export default function Home() {
  useEffect(() => {
    void Promise.resolve(useStudio.persist.rehydrate());
  }, []);
  return <StudioShell />;
}

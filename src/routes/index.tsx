import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StudioShell } from "@/components/studio/shell";
import { useStudio } from "@/lib/studio/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  useEffect(() => {
    void Promise.resolve(useStudio.persist.rehydrate());
  }, []);
  return <StudioShell />;
}

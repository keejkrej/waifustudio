"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionTrigger,
  QueueSectionContent,
} from "@/components/ai-elements/queue";
import { useStudio } from "@/lib/studio/store";
import { formatTime } from "@/lib/utils";

export function QueueBar() {
  const jobs = useStudio((s) => s.jobs);
  const latest = jobs.slice(0, 6);
  if (!latest.length) {
    return (
      <div className="hidden h-9 shrink-0 items-center border-t px-4 text-xs text-muted-foreground md:flex">
        Queue idle · jobs will show up here
      </div>
    );
  }
  return (
    <div className="shrink-0 border-t px-3 py-1 md:px-4">
      <Queue className="border-0 shadow-none">
        <QueueSection defaultOpen>
          <QueueSectionTrigger>
            Queue
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList className="flex-row flex-wrap">
              {latest.map((j) => (
                <QueueItem key={j.id} className="flex-row items-center">
                  <QueueItemIndicator completed={j.status === "done"} />
                  {(j.status === "running" || j.status === "polling") && (
                    <Loader2 className="size-3 animate-spin" />
                  )}
                  <QueueItemContent completed={j.status === "done"}>{j.title}</QueueItemContent>
                  <Badge variant="outline" className="text-[10px]">
                    {formatTime(j.createdAt)}
                  </Badge>
                </QueueItem>
              ))}
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
    </div>
  );
}

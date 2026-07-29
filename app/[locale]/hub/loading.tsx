"use client";

import { Shimmer } from "@shimmer-from-structure/react";

export default function HubLoading() {
  return (
    <div className="flex flex-col w-full h-full min-h-[80vh] p-4 md:p-6 gap-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between w-full pb-4 border-b border-border/50">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800/60 rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-zinc-200 dark:bg-zinc-800/40 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
          <div className="h-9 w-9 bg-zinc-200 dark:bg-zinc-800/60 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton Grid */}
      <Shimmer loading={true}>
        <div className="flex flex-col gap-6 w-full">
          {/* Top KPI Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                </div>
                <div className="h-8 w-36 bg-zinc-200 dark:bg-zinc-800 rounded mt-1" />
                <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mt-2" />
              </div>
            ))}
          </div>

          {/* Main Card Skeleton */}
          <div className="card p-6 flex flex-col gap-4 min-h-[300px]">
            <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="flex flex-col gap-3 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 w-full bg-zinc-200/70 dark:bg-zinc-800/40 rounded-lg flex items-center px-4 justify-between">
                  <div className="h-4 w-1/3 bg-zinc-300 dark:bg-zinc-700 rounded" />
                  <div className="h-4 w-1/4 bg-zinc-300 dark:bg-zinc-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shimmer>
    </div>
  );
}

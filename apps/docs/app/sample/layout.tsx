"use client";
import { Sidebar } from "@honohub/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

const CLIENT = new QueryClient();

export default function SampleLayout({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={CLIENT}>
      <div className="flex w-full h-screen">
        <Sidebar />
        <div className="flex-1 px-12 py-4 overflow-x-hidden overflow-y-auto scroll-smooth">
          <div className="flex flex-col min-h-0 w-full h-full flex-grow gap-[30px]">
            {children}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

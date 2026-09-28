"use client";

import { useState } from "react";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { cx } from "@/lib/cn";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-slate-50 text-slate-900">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <Sidebar />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/30"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 h-full w-64 border-r border-slate-200 bg-white">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
      <div className={cx("flex min-w-0 flex-1 flex-col")}>
        <Header onMenuClick={() => setOpen(true)} />
       
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

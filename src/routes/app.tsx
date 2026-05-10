import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("douanes.user")) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

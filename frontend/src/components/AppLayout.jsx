import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <button
        type="button"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        className="md:hidden fixed top-20 left-4 z-[60] rounded-lg bg-indigo-600 p-2 shadow-lg text-white active:opacity-90 touch-manipulation"
        style={{ touchAction: "manipulation" }}
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <main className="w-full min-w-0 pt-20 pb-10 px-4 sm:px-6 md:pl-[calc(16rem+1.5rem)]">
        {children}
      </main>
    </div>
  );
}

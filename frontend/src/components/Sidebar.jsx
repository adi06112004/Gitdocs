import React, { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WebRoutes } from "../routes/WebRoutes";
import { useSelector } from "react-redux";

const Sidebar = memo(function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: "Documents", path: "/documents" },
    { label: "Versions", path: "/versions" },
    { label: "Activity", path: "/activity" },
  ];

  const bottomItems = [
    { label: "Settings", path: WebRoutes.SETTINGS() },
    { label: "Documentation", path: WebRoutes.DOCS() },
  ];

  function SidebarItem({ label, path }) {
    const isActive = location.pathname === path;

    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(path);
            onClose?.();
          }
        }}
        onClick={() => {
          navigate(path);
          onClose?.();
        }}
        className={`px-3 py-2 cursor-pointer text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-indigo-500/10 to-transparent border-l-2 border-indigo-500 text-indigo-300"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border-l-2 border-transparent"
        }`}
      >
        {label}
      </div>
    );
  }

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="md:hidden fixed inset-0 z-40 bg-black/50 top-16 motion-reduce:transition-none"
          style={{ touchAction: "manipulation" }}
          onClick={onClose}
        />
      ) : null}
      <aside
        style={
          mobileOpen
            ? { willChange: "transform" }
            : undefined
        }
        className={`w-64 max-w-[85vw] fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#09090b]/80 backdrop-blur-xl border-r border-white/5 p-4 flex flex-col justify-between z-50 transition-transform duration-300 ease-out motion-reduce:transition-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:will-change-auto`}
      >
        <div>
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <SidebarItem key={item.path} {...item} />
            ))}
          </nav>

          <div className="mt-10 space-y-3">
            {bottomItems.map((item) => (
              <SidebarItem key={item.path} {...item} />
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl transition-all hover:bg-white/[0.04]">
            <p className="text-sm text-zinc-100 font-semibold truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-zinc-500">
              {user?.role === "admin" ? "Administrator" : "Team Member"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;

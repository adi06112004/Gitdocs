import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: "Documents", path: "/documents" },
    { label: "Versions", path: "/versions" },
    { label: "Activity", path: "/activity" },
  ];

  const bottomItems = [
    { label: "Settings", path: "/settings" },
    { label: "Documentation", path: "/docs" },
  ];

  function SidebarItem({ label, path }) {
    const isActive = location.pathname === path;

    return (
      <div
        onClick={() => navigate(path)}
        className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        {label}
      </div>
    );
  }

  return (
    <aside className="w-64 fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#0f172a] border-r border-gray-800 p-4 flex flex-col justify-between">
      {/* Top Menu */}
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

      {/* Bottom Profile */}
      <div>
        <div className="bg-[#1e293b] p-3 rounded-xl">
          <p className="text-sm text-white font-semibold">Alex Rivera</p>
          <p className="text-xs text-gray-400">Pro Developer</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

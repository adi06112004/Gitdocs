import { FolderGit2, Search, Bell, Plus, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { WebRoutes } from "../routes/WebRoutes";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate(WebRoutes.HOME());
  };

  return (
    <nav className="w-full fixed top-0 z-50 backdrop-blur-md bg-[#0B0F19]/80 border-b border-white/10">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-white bg-indigo-600 p-2 rounded-lg shadow-md">
            <FolderGit2 size={18} />
          </span>

          <div className="text-white text-xl font-bold tracking-tight">
            Git<span className="text-indigo-400">Docs</span>
          </div>
        </div>

        {/* CENTER: Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-[#111827] px-4 py-2 rounded-lg w-[400px] border border-gray-800">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search files, commits, versions..."
            className="bg-transparent outline-none text-sm w-full text-gray-300"
          />
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <Bell
            className="text-gray-400 hover:text-white cursor-pointer"
            size={18}
          />

          {isAuthenticated ? (
            <>
              {/* New Document Button */}
              <button
                onClick={() => navigate(WebRoutes.PROJECTS())}
                className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition"
              >
                <Plus size={16} />
                New Project
              </button>

              {/* User Info */}
              <div className="flex items-center gap-2 text-white">
                <User size={16} />
                <span className="text-sm">{user?.name || user?.email}</span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium px-3 py-1 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Auth Buttons */}
              <button
                onClick={() => navigate(WebRoutes.AUTH())}
                className="text-gray-300 hover:text-white text-sm font-medium px-3 py-1 transition"
              >
                Sign in
              </button>

              <button
                onClick={() => navigate(WebRoutes.AUTH())}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

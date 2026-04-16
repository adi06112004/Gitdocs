import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings as SettingsIcon,
  Save,
  LogOut,
  Bell,
  Lock,
  User,
} from "lucide-react";
import { logout, updateAuthUser } from "../../store/slices/authSlice";
import { userApiService } from "../../services/UserApiService";

const defaultNotifications = {
  commits: true,
  documents: true,
  projects: true,
  mentions: true,
};

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState(defaultNotifications);

  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    });
    const n = user?.preferences?.notifications;
    if (n && typeof n === "object") {
      setNotifications({ ...defaultNotifications, ...n });
    }
  }, [user?.name, user?.email, user?.preferences]);

  const showMessage = useCallback((text, isError = false) => {
    if (isError) {
      setError(text);
      setMessage("");
    } else {
      setMessage(text);
      setError("");
    }
    window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 4000);
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError("");
    try {
      const updated = await userApiService.patchMe({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      });
      dispatch(updateAuthUser(updated));
      showMessage("Profile updated.");
    } catch (e) {
      showMessage(
        e.response?.data?.message || e.message || "Update failed",
        true,
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("New passwords do not match.", true);
      return;
    }
    setSavingPassword(true);
    setError("");
    try {
      await userApiService.patchPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showMessage("Password updated.");
    } catch (e) {
      showMessage(
        e.response?.data?.message || e.message || "Password update failed",
        true,
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingPrefs(true);
    try {
      const updated = await userApiService.patchPreferences(notifications);
      dispatch(updateAuthUser(updated));
      showMessage("Notification preferences saved.");
    } catch (e) {
      showMessage(
        e.response?.data?.message || e.message || "Could not save preferences",
        true,
      );
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Log out of GitDocs?")) {
      dispatch(logout());
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 drop-shadow-md text-zinc-100">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <SettingsIcon className="shrink-0 text-indigo-400" size={26} />
          </div>
          Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-2 font-medium">
          Account and dashboard preferences (stored on the server).
        </p>
      </div>

      {message ? (
        <div className="bg-emerald-700/90 text-white p-3 rounded text-sm">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="bg-red-600/90 text-white p-3 rounded text-sm">
          {error}
        </div>
      ) : null}

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl shadow-xl overflow-hidden relative backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="flex flex-col sm:flex-row border-b border-white/5">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "password", label: "Password", icon: Lock },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-3 sm:px-4 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative ${
                activeTab === id
                  ? "bg-white/[0.04] text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
              }`}
            >
              {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
              )}
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          {activeTab === "profile" && (
            <div className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none transition-colors placeholder-zinc-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none transition-colors placeholder-zinc-600"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-white font-medium disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 border border-indigo-500/50"
              >
                <Save size={16} />
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  New password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-white font-medium disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 border border-indigo-500/50"
              >
                <Save size={16} />
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4 max-w-xl">
              {(
                [
                  ["commits", "Commits", "When commits are recorded"],
                  ["documents", "Documents", "Document changes in your projects"],
                  ["projects", "Projects", "Project updates"],
                  ["mentions", "Mentions", "Comments and @mentions (future)"],
                ]
              ).map(([key, title, desc]) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-200 text-sm">{title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications[key])}
                    onChange={() => handleNotificationChange(key)}
                    className="w-4 h-4 cursor-pointer shrink-0 accent-indigo-500"
                  />
                </div>
              ))}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  disabled={savingPrefs}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-white font-medium disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 border border-indigo-500/50"
                >
                  <Save size={16} />
                  {savingPrefs ? "Saving…" : "Save preferences"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl shadow-xl p-5 sm:p-8">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Session</h3>
        <p className="text-zinc-400 text-sm mb-6">
          Sign out on this device. You will need to sign in again to use the
          dashboard.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20 active:scale-95 text-white font-medium border border-red-500/50 px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-all duration-300"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );
}

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
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="shrink-0 text-indigo-400" size={28} />
          Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
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

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-gray-800">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "password", label: "Password", icon: Lock },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-3 sm:px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                activeTab === id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/80"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {activeTab === "profile" && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2 rounded text-sm flex items-center gap-2"
              >
                <Save size={16} />
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  New password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2 rounded text-sm flex items-center gap-2"
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
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0B0F19] p-3 rounded border border-gray-700"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications[key])}
                    onChange={() => handleNotificationChange(key)}
                    className="w-4 h-4 cursor-pointer shrink-0"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={savingPrefs}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2 rounded text-sm flex items-center gap-2"
              >
                <Save size={16} />
                {savingPrefs ? "Saving…" : "Save preferences"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Session</h3>
        <p className="text-gray-400 text-sm mb-4">
          Sign out on this device. You will need to sign in again to use the
          dashboard.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded text-sm flex items-center gap-2"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );
}

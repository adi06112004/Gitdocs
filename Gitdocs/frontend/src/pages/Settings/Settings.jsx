import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings as SettingsIcon,
  Save,
  LogOut,
  Bell,
  Lock,
  User,
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";

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
  const [notifications, setNotifications] = useState({
    commits: true,
    documents: true,
    projects: true,
    mentions: true,
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState("");

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

  const handleSaveProfile = () => {
    // TODO: Implement API call to update profile
    setMessage("Profile updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Passwords do not match!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    // TODO: Implement API call to update password
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMessage("Password updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
    }
  };

  return (
    <div className="bg-[#0B0F19] min-h-screen text-white">
      <div className="ml-64 pt-20 px-6 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-400">
            Manage your account and preferences
          </p>
        </div>

        {message && (
          <div className="bg-green-600 text-white p-3 rounded">{message}</div>
        )}

        {/* TABS */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <User className="inline mr-2" size={16} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTab === "password"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Lock className="inline mr-2" size={16} />
              Password
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTab === "notifications"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Bell className="inline mr-2" size={16} />
              Notifications
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="p-6 space-y-6">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            )}

            {/* PASSWORD TAB */}
            {activeTab === "password" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleSavePassword}
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Save size={16} />
                  Update Password
                </button>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#0B0F19] p-3 rounded border border-gray-700">
                  <div>
                    <p className="font-medium">Commit Notifications</p>
                    <p className="text-xs text-gray-400">
                      Get notified when commits are made
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.commits}
                    onChange={() => handleNotificationChange("commits")}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between bg-[#0B0F19] p-3 rounded border border-gray-700">
                  <div>
                    <p className="font-medium">Document Updates</p>
                    <p className="text-xs text-gray-400">
                      Get notified when documents are updated
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.documents}
                    onChange={() => handleNotificationChange("documents")}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between bg-[#0B0F19] p-3 rounded border border-gray-700">
                  <div>
                    <p className="font-medium">Project Changes</p>
                    <p className="text-xs text-gray-400">
                      Get notified when projects are modified
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.projects}
                    onChange={() => handleNotificationChange("projects")}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between bg-[#0B0F19] p-3 rounded border border-gray-700">
                  <div>
                    <p className="font-medium">Mentions & Comments</p>
                    <p className="text-xs text-gray-400">
                      Get notified when you're mentioned
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.mentions}
                    onChange={() => handleNotificationChange("mentions")}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LOGOUT SECTION */}
        <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Danger Zone
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Once you logout, you'll need to sign back in to access your
            workspace.
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded text-sm flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

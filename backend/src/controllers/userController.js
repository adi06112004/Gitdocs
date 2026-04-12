import User from "../models/User.js";

const defaultNotifications = () => ({
  commits: true,
  documents: true,
  projects: true,
  mentions: true,
});

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  return res.json(users);
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(user);
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(user.toJSON());
};

export const updateMe = async (req, res) => {
  const { name, email } = req.body || {};
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (email !== undefined && email !== user.email) {
    const nextEmail = String(email).toLowerCase().trim();
    const taken = await User.findOne({ email: nextEmail });
    if (taken) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    user.email = nextEmail;
  }

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (trimmed.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    user.name = trimmed;
  }

  await user.save();
  return res.json(user.toJSON());
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();
  return res.json({ message: "Password updated" });
};

export const updatePreferences = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const incoming = req.body?.notifications || req.body || {};
  const existingNotif = user.preferences?.notifications;
  const existingPlain =
    existingNotif && typeof existingNotif === "object"
      ? existingNotif.toObject?.() || existingNotif
      : {};
  const base = {
    ...defaultNotifications(),
    ...existingPlain,
  };

  const next = { ...base };
  for (const key of ["commits", "documents", "projects", "mentions"]) {
    if (incoming[key] !== undefined) {
      next[key] = Boolean(incoming[key]);
    }
  }

  user.preferences = user.preferences || {};
  user.preferences.notifications = next;
  await user.save();
  return res.json(user.toJSON());
};

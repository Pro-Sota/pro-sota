"use client";

import { useState } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Lock,
  Bell,
  Palette,
  Shield,
  Key,
  LogOut,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiKey, setApiKey] = useState("sk_live_1234567890abcdef");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    organizationName: "Acme Architecture",
    email: "admin@acmeArchitecture.com",
    timezone: "UTC",
    theme: "Light",
    language: "English",
    twoFactor: false,
    strongPasswords: true,
    emailNotifications: true,
    weeklyReports: false,
    securityAlerts: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const generateNewApiKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account and organization preferences
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Changes saved successfully
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-slate-900" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Account</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                />
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-slate-900" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Preferences</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                >
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                >
                  <option>English</option>
                  <option>Portuguese</option>
                  <option>Spanish</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Zone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                >
                  <option>UTC</option>
                  <option>GMT</option>
                  <option>CAT</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-slate-900" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Security</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <span className="text-gray-900 font-medium">
                  Two-Factor Authentication
                </span>
                <input
                  type="checkbox"
                  name="twoFactor"
                  checked={formData.twoFactor}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer accent-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <span className="text-gray-900 font-medium">
                  Require Strong Passwords
                </span>
                <input
                  type="checkbox"
                  name="strongPasswords"
                  checked={formData.strongPasswords}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer accent-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <span className="text-gray-900 font-medium">
                  Security Alerts
                </span>
                <input
                  type="checkbox"
                  name="securityAlerts"
                  checked={formData.securityAlerts}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer accent-slate-900"
                />
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-slate-900" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <span className="text-gray-900 font-medium">
                  Email Notifications
                </span>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer accent-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <span className="text-gray-900 font-medium">
                  Weekly Reports
                </span>
                <input
                  type="checkbox"
                  name="weeklyReports"
                  checked={formData.weeklyReports}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer accent-slate-900"
                />
              </label>
            </div>
          </section>

          {/* API Keys */}
          <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Key className="text-slate-900" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">API Keys</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Live API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 bg-gray-50 text-gray-900 font-mono text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={copyApiKey}
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
                  >
                    <Copy size={18} />
                    {copiedApiKey ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <button
                onClick={generateNewApiKey}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Generate New Key
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-xl bg-red-50 p-6 shadow-sm border border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-2xl font-semibold text-red-900">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white">
                <div>
                  <p className="font-medium text-gray-900">
                    Logout from all devices
                  </p>
                  <p className="text-sm text-gray-600">
                    Sign out from all active sessions
                  </p>
                </div>
                <button className="rounded-lg px-4 py-2 text-red-600 border border-red-300 hover:bg-red-50 transition flex items-center gap-2 font-medium">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white">
                <div>
                  <p className="font-medium text-gray-900">
                    Delete account
                  </p>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="rounded-lg px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 font-medium">
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button className="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-900 hover:bg-gray-50 transition font-medium">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-white hover:bg-slate-800 transition font-medium flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
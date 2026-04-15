import { useState } from "react";
import { User, Bell, Shield, Palette, GraduationCap, Save, Check, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { Theme } from "../context/ThemeContext";

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const { theme, setTheme, isDark } = useTheme();
  const [form, setForm] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@university.edu",
    studentId: "CS-2023-0047",
    major: "Computer Science",
    year: "Junior",
    gpa_target: "3.8",
    notifications_email: true,
    notifications_push: true,
    notifications_grades: true,
    notifications_assignments: true,
    language: "English",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key: keyof typeof form) => {
    setForm((f) => ({ ...f, [key]: !f[key as keyof typeof form] }));
  };

  const card = "bg-card border-border";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const inputCls = isDark
    ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-indigo-400 focus:ring-indigo-900/30"
    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-400 focus:ring-indigo-100";
  const disabledCls = isDark
    ? "bg-slate-700/50 border-slate-700 text-slate-500 cursor-not-allowed"
    : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed";
  const sectionHeaderBorder = isDark ? "border-slate-700" : "border-slate-100";
  const selectBg = isDark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800";
  const rowHover = isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-100";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className={textPrimary} style={{ fontWeight: 700, fontSize: "1.2rem" }}>Settings</h2>
        <p className={`${textMuted} text-sm`}>Manage your account and preferences</p>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <SettingsSection title="Profile" icon={User} iconBg={isDark ? "bg-indigo-900/50" : "bg-indigo-100"} iconColor="text-indigo-500" isDark={isDark}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl" style={{ fontWeight: 700 }}>AJ</span>
            </div>
            <div>
              <p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>Profile Photo</p>
              <button className="text-indigo-500 text-xs mt-1 hover:text-indigo-400 transition" style={{ fontWeight: 500 }}>Upload new photo</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} inputCls={inputCls} labelCls={textMuted} />
            <FormField label="Email Address" value={form.email} type="email" onChange={(v) => setForm((f) => ({ ...f, email: v }))} inputCls={inputCls} labelCls={textMuted} />
            <FormField label="Student ID" value={form.studentId} onChange={() => {}} disabled inputCls={disabledCls} labelCls={textMuted} />
            <FormField label="Major" value={form.major} onChange={(v) => setForm((f) => ({ ...f, major: v }))} inputCls={inputCls} labelCls={textMuted} />
          </div>
        </SettingsSection>

        {/* Academic */}
        <SettingsSection title="Academic" icon={GraduationCap} iconBg={isDark ? "bg-violet-900/50" : "bg-violet-100"} iconColor="text-violet-500" isDark={isDark}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`${textMuted} text-xs mb-1.5 block`} style={{ fontWeight: 600 }}>Year</label>
              <select value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition ${selectBg}`}>
                {["Freshman", "Sophomore", "Junior", "Senior", "Graduate"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <FormField label="GPA Target" value={form.gpa_target} type="number" onChange={(v) => setForm((f) => ({ ...f, gpa_target: v }))} inputCls={inputCls} labelCls={textMuted} />
          </div>
        </SettingsSection>

        {/* Appearance — now wired to ThemeContext */}
        <SettingsSection title="Appearance" icon={Palette} iconBg={isDark ? "bg-emerald-900/50" : "bg-emerald-100"} iconColor="text-emerald-500" isDark={isDark}>
          <label className={`${textMuted} text-xs mb-3 block`} style={{ fontWeight: 600 }}>Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { id: "light" as Theme, icon: Sun, label: "Light", desc: "Clean & bright" },
              { id: "dark" as Theme, icon: Moon, label: "Dark", desc: "Easy on eyes" },
              { id: "system" as Theme, icon: Monitor, label: "System", desc: "Follows OS" },
            ] as const).map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id === "system" ? "light" : t.id)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition ${
                    isActive
                      ? "border-indigo-500 " + (isDark ? "bg-indigo-900/20" : "bg-indigo-50")
                      : isDark ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <t.icon className={`w-5 h-5 ${isActive ? "text-indigo-500" : textMuted}`} />
                  <div>
                    <p className={`text-sm ${isActive ? "text-indigo-500" : textPrimary}`} style={{ fontWeight: isActive ? 700 : 500 }}>
                      {t.label}
                    </p>
                    <p className={`text-xs ${textMuted} mt-0.5`}>{t.desc}</p>
                  </div>
                  {isActive && (
                    <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 ${isDark ? "bg-slate-700/40" : "bg-slate-50"}`}>
            {isDark ? <Moon className="w-4 h-4 text-indigo-400 flex-shrink-0" /> : <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            <p className={`text-xs ${textMuted}`}>
              Currently using <strong className={textPrimary}>{isDark ? "Dark" : "Light"} Mode</strong>. You can also toggle from the header or sidebar.
            </p>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={Bell} iconBg={isDark ? "bg-amber-900/40" : "bg-amber-100"} iconColor="text-amber-500" isDark={isDark}>
          <div className="space-y-1">
            {[
              { key: "notifications_email", label: "Email Notifications", sub: "Receive updates via email" },
              { key: "notifications_push", label: "Push Notifications", sub: "Browser push alerts" },
              { key: "notifications_grades", label: "Grade Updates", sub: "Notify when grades are posted" },
              { key: "notifications_assignments", label: "Assignment Reminders", sub: "Remind me before deadlines" },
            ].map(({ key, label, sub }) => (
              <div key={key} className={`flex items-center justify-between p-3 rounded-xl ${rowHover} transition`}>
                <div>
                  <p className={`${textPrimary} text-sm`} style={{ fontWeight: 500 }}>{label}</p>
                  <p className={`${textMuted} text-xs`}>{sub}</p>
                </div>
                <button
                  onClick={() => toggle(key as keyof typeof form)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form[key as keyof typeof form] ? "bg-indigo-600" : isDark ? "bg-slate-600" : "bg-slate-200"}`}
                >
                  <div
                    className={`bg-white rounded-full shadow absolute top-0.5 transition-transform`}
                    style={{ width: 18, height: 18, transform: form[key as keyof typeof form] ? "translateX(20px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
            ))}
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" icon={Shield} iconBg={isDark ? "bg-red-900/40" : "bg-red-100"} iconColor="text-red-500" isDark={isDark}>
          <div className="space-y-2">
            {[
              { label: "Change Password", right: "Update →", color: "text-indigo-500" },
              { label: "Two-Factor Authentication", right: "Enabled", color: "text-emerald-500" },
              { label: "Active Sessions", right: "Manage →", color: "text-indigo-500" },
            ].map(({ label, right, color }) => (
              <button key={label} className={`w-full flex items-center justify-between p-3 rounded-xl transition ${isDark ? "bg-slate-700/30 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"}`}>
                <span className={`${textPrimary} text-sm`} style={{ fontWeight: 500 }}>{label}</span>
                <span className={`${color} text-xs`} style={{ fontWeight: 600 }}>{right}</span>
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm transition shadow-lg ${saved ? "bg-emerald-500 shadow-emerald-900/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20"}`}
            style={{ fontWeight: 600 }}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon: Icon, iconBg, iconColor, isDark, children }: {
  title: string; icon: React.ElementType; iconBg: string; iconColor: string; isDark: boolean; children: React.ReactNode;
}) {
  const card = "bg-card border-border";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const border = isDark ? "border-slate-700" : "border-slate-100";
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${border}`}>
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className={textPrimary} style={{ fontWeight: 700, fontSize: "0.9rem" }}>{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FormField({ label, value, type = "text", onChange, disabled = false, inputCls, labelCls }: {
  label: string; value: string; type?: string; onChange: (v: string) => void;
  disabled?: boolean; inputCls: string; labelCls: string;
}) {
  return (
    <div>
      <label className={`${labelCls} text-xs mb-1.5 block`} style={{ fontWeight: 600 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition ${inputCls}`}
      />
    </div>
  );
}

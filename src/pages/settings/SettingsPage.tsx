import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  Clock,
  ShieldAlert,
  Save,
  Info,
  ChevronRight,
} from "lucide-react";

import type { CreateSettings, Settings } from "@/models/Settings";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { Department } from "@/model_types/department";
import { toast } from "@saintrelion/notifications";

const SettingsPage = () => {
  const user = useCurrentUser<User>();

  const [draft, setDraft] = useState<CreateSettings>(() => ({
    department: user?.department ?? "",
    timeIn: "08:00",
    timeOut: "17:00",
    gracePeriodMinutes: 15,
  }));

  const {
    useList: getSettings,
    useInsert: insertSettings,
    useUpdate: updateSettings,
  } = useResourceLocked<Settings, CreateSettings, CreateSettings>("settings", {
    showToast: false,
  });

  const settingsData = getSettings({
    filters: { department: user.department },
  }).data;

  const existingSettings = settingsData?.[0];

  useEffect(() => {
    if (existingSettings) {
      setDraft({
        department: existingSettings.department,
        timeIn: existingSettings.timeIn,
        timeOut: existingSettings.timeOut,
        gracePeriodMinutes: existingSettings.gracePeriodMinutes,
      });
    }
  }, [existingSettings]);

  const handleSave = async () => {
    if (!existingSettings) {
      await insertSettings.run(draft);
    } else {
      await updateSettings.run({
        id: existingSettings.id,
        payload: draft,
      });
    }

    toast.success("Settings modified");
  };

  // Shared styles
  const inputStyle =
    "rounded-xl border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:ring-emerald-500/10";
  const labelStyle =
    "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400";

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20">
      {/* TERMINAL HEADER */}
      <div className="flex flex-col justify-between gap-6 border-b border-slate-200 px-2 pb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.8rem] bg-slate-900 text-white shadow-2xl shadow-slate-200">
            <SettingsIcon
              size={32}
              strokeWidth={1.5}
              className="animate-[spin_8s_linear_infinite]"
            />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase">
              System <span className="text-emerald-600">Config</span>
            </h1>
            <p className="mt-1 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
              Logic Parameters /{" "}
              {Department[user.department as keyof typeof Department]}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* LEFT: CONFIGURATION FORM (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-[2.5rem] border border-white bg-white p-10 shadow-xl shadow-slate-200/50">
            <div className="mb-8 flex items-center gap-3">
              <Clock className="text-emerald-500" size={20} />
              <h2 className="text-xs font-black tracking-[0.2em] text-slate-800 uppercase">
                Time Bound Parameters
              </h2>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={labelStyle}>Shift Start (Time In)</Label>
                  <Input
                    type="time"
                    className={inputStyle}
                    value={draft.timeIn}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, timeIn: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className={labelStyle}>Shift End (Time Out)</Label>
                  <Input
                    type="time"
                    className={inputStyle}
                    value={draft.timeOut}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, timeOut: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={labelStyle}>Grace Period Buffer</Label>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600">
                    {draft.gracePeriodMinutes} Minutes
                  </span>
                </div>
                <Input
                  type="number"
                  min={0}
                  className={inputStyle}
                  value={draft.gracePeriodMinutes}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      gracePeriodMinutes: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-[10px] leading-relaxed font-bold text-slate-400 italic">
                  * Minutes allowed after official shift start before tardiness
                  triggers.
                </p>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleSave}
                  className="h-14 w-full rounded-2xl bg-slate-900 font-black tracking-widest text-white uppercase shadow-xl shadow-slate-200 transition-all hover:bg-emerald-600 active:scale-95"
                >
                  <Save size={18} className="mr-2" />
                  Commit Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: RULES MANIFEST (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center gap-2 px-4">
            <ShieldAlert size={18} className="text-emerald-500" />
            <h2 className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
              Auto-Penalty Manifest
            </h2>
          </div>

          <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <div className="space-y-6">
              <RuleItem label="Excused Absence" value="+8.0h" />
              <RuleItem label="Unexcused Absence" value="+16.0h" />

              <div className="my-4 h-px bg-white/10" />

              <div className="space-y-3">
                <p className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  Tardiness Escalation
                </p>
                <div className="space-y-2">
                  <EscalationStep offense="1st" penalty="Excused" />
                  <EscalationStep offense="2nd" penalty="+2.0 Hours" />
                  <EscalationStep offense="3rd" penalty="+4.0 Hours" />
                  <EscalationStep offense="4th+" penalty="+6.0 Hours" />
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />
                  <p className="text-[10px] leading-relaxed font-medium text-slate-400">
                    After{" "}
                    <span className="text-white">5 unexcused absences</span>,
                    the system enforces a full internship hour reset to original
                    requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MICRO COMPONENTS ---

function RuleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-black text-white">
        {value}
      </span>
    </div>
  );
}

function EscalationStep({
  offense,
  penalty,
}: {
  offense: string;
  penalty: string;
}) {
  return (
    <div className="group flex items-center justify-between text-[11px]">
      <div className="flex items-center gap-2">
        <ChevronRight size={10} className="text-emerald-500" />
        <span className="font-medium text-slate-400">{offense} Offense</span>
      </div>
      <span className="font-black text-slate-200">{penalty}</span>
    </div>
  );
}

export default SettingsPage;

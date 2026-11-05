import {
  inputStyle,
  labelStyle,
} from "@/features/SettingsPage/lib/form-styles";
import { RuleItem } from "@/features/SettingsPage/components/RuleItem";
import { useSettingsPage } from "@/features/SettingsPage/hooks/useSettingsPage";
import { DemoNotice } from "@/shared/components/demo/DemoNotice";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { isDemo } from "@/shared/config/demo";
import { Department } from "@/shared/model/department";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const { user, draft, setDraft, handleSave } = useSettingsPage();

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {isDemo && <DemoNotice />}
      <header className="border-b border-slate-200 pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Department administration
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Shift rules
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Attendance times for{" "}
          {Department[user.department as keyof typeof Department]}.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="border border-slate-200 bg-white p-5 sm:p-8">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Daily schedule
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set the expected start and end of the training day.
            </p>
          </div>
          <div className="space-y-7 pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className={labelStyle}>Time in</Label>
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
                <Label className={labelStyle}>Time out</Label>
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
            <div className="space-y-2 border-t border-slate-200 pt-6">
              <Label className={labelStyle}>Grace period</Label>
              <div className="flex max-w-xs items-center gap-3">
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
                <span className="text-sm text-slate-500">minutes</span>
              </div>
              <p className="text-sm text-slate-500">
                Time allowed after shift start before a late arrival is
                recorded.
              </p>
            </div>
            <div className="flex justify-end border-t border-slate-200 pt-6">
              <Button
                onClick={handleSave}
                className="h-11 bg-[#1677ff] px-5 font-semibold text-white hover:bg-[#0864db]"
              >
                <Save size={16} className="mr-2" /> Save shift rules
              </Button>
            </div>
          </div>
        </section>

        <aside className="self-start border-l-2 border-[#1677ff] bg-slate-100 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Attendance rules
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These existing penalties are applied automatically to required
            hours.
          </p>
          <dl className="mt-5 space-y-3 border-t border-slate-300 pt-5 text-sm">
            <RuleItem label="Excused absence" value="+8 hours" />
            <RuleItem label="Unexcused absence" value="+16 hours" />
          </dl>
          <h3 className="mt-7 border-t border-slate-300 pt-5 text-sm font-semibold text-slate-900">
            Late arrival escalation
          </h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex justify-between gap-3">
              <span>First</span>
              <span>Excused</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Second</span>
              <span>+2 hours</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Third</span>
              <span>+4 hours</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Fourth onward</span>
              <span>+6 hours</span>
            </li>
          </ol>
          <p className="mt-6 border-t border-slate-300 pt-5 text-sm leading-6 text-slate-600">
            Five unexcused absences reset the intern’s accumulated hours against
            their original requirement.
          </p>
        </aside>
      </div>
    </div>
  );
}

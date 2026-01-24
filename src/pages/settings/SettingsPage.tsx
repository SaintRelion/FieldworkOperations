import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateSettings, Settings } from "@/models/Settings";
import type { User } from "@/models/User";
import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import { useEffect, useState } from "react";

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
  } = useResourceLocked<Settings, CreateSettings, CreateSettings>("settings");

  // load settings for current department
  const settingsList = getSettings({
    filters: {
      department: user.department,
    },
  }).data;
  const existingSettings = settingsList[0];

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

  const handleSave = () => {
    if (!existingSettings) {
      insertSettings.run(draft);
    } else {
      updateSettings.run({
        id: existingSettings.id,
        payload: draft,
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Adviser Settings – {user?.department}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time In / Out */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time In</Label>
              <Input
                type="time"
                value={draft.timeIn}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, timeIn: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Time Out</Label>
              <Input
                type="time"
                value={draft.timeOut}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, timeOut: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Grace Period */}
          <div className="space-y-2">
            <Label>Grace Period (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={draft.gracePeriodMinutes}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  gracePeriodMinutes: Number(e.target.value),
                }))
              }
            />
            <p className="text-muted-foreground text-xs">
              Minutes allowed after official time in before tardiness is
              counted. Default is 15 minutes.
            </p>
          </div>

          {/* Rules Notice */}
          <div className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
            <p className="text-foreground font-medium">Penalty Rules</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>
                <b>Absence (Excused):</b> +8 required hours
              </li>
              <li>
                <b>Absence (Unexcused):</b> +16 required hours
              </li>
              <li>
                <b>After 5 unexcused absences:</b> Internship resets remaining
                hours
              </li>
              <li>
                <b>Tardiness beyond grace period:</b>
                <ul className="list-disc pl-4">
                  <li>1st offense – excused</li>
                  <li>2nd – +2 hours</li>
                  <li>3rd – +4 hours</li>
                  <li>4th+ – +6 hours</li>
                </ul>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
export default SettingsPage;

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
import type { Settings } from "@/models/settings";
import { useAuth } from "@saintrelion/auth-lib";
import { useDBOperations } from "@saintrelion/data-access-layer";
import { useMemo } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user } = useAuth();

  const {
    useSelect: settingsSelect,
    useInsert: settingsInsert,
    useUpdate: settingsUpdate,
  } = useDBOperations<Settings>("Settings");

  // load settings for current department
  const { data: settingsList = [] } = settingsSelect({
    mockOptions: {
      filterFn: (s) => s.department === user?.department,
    },
    firebaseOptions: {
      filterField: "department",
      value: user?.department,
      // sort: { field: "timeDateISO", direction: "desc" },
    },
  });

  const settings = useMemo(() => {
    return (
      settingsList[0] ?? {
        id: "",
        department: user?.department ?? "",
        timeIn: "08:00",
        timeOut: "17:00",
        gracePeriodMinutes: 5,
        penaltyRate: 1,
      }
    );
  }, [settingsList, user]);

  const handleSave = () => {
    if (settings.id == "") {
      settingsInsert.mutate({
        department: settings.department,
        timeIn: settings.timeIn,
        timeOut: settings.timeOut,
        gracePeriodMinutes: settings.gracePeriodMinutes,
        penaltyRate: settings.penaltyRate,
      });
      toast("✅ Settings Saved. Your department rules were added");
    } else {
      settingsUpdate.mutate({
        id: settings.id,
        updates: {
          department: settings.department,
          timeIn: settings.timeIn,
          timeOut: settings.timeOut,
          gracePeriodMinutes: settings.gracePeriodMinutes,
          penaltyRate: settings.penaltyRate,
        },
      });
      toast("✅ Settings Saved. Your department rules were updated");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Adviser Settings – {user?.department}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time In/Out */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time In</Label>
              <Input
                type="time"
                defaultValue={settings.timeIn}
                onChange={(e) => (settings.timeIn = e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Time Out</Label>
              <Input
                type="time"
                defaultValue={settings.timeOut}
                onChange={(e) => (settings.timeOut = e.target.value)}
              />
            </div>
          </div>

          {/* Penalty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Penalty Minutes</Label>
              <Input
                type="number"
                defaultValue={settings.gracePeriodMinutes}
                onChange={(e) =>
                  (settings.gracePeriodMinutes = Number(e.target.value))
                }
              />
              <p className="text-muted-foreground mt-1 text-xs">
                How many minutes after the official time in before penalties
                apply.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Penalty Rate (hrs)</Label>
              <Input
                type="number"
                defaultValue={settings.penaltyRate}
                onChange={(e) =>
                  (settings.penaltyRate = Number(e.target.value))
                }
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Penalty applied for each grace period exceeded (e.g. every 5
                minutes late + 1 hour).
              </p>
            </div>
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

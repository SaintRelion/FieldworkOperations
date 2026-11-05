import { isDemo } from "@/shared/config/demo";
import { toast } from "@saintrelion/notifications";
export function blockDemoAction() {
  if (!isDemo) return false;
  toast.info(
    "This is a demo. Registration, account changes, deletion, and shift settings are disabled. Nothing was changed.",
  );
  return true;
}

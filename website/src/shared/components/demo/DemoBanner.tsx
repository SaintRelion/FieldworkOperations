import { useAuth } from "@/shared/hooks/useAuth";
import { DemoPicker } from "@/shared/components/demo/DemoPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { exitDemo, isDemo } from "@/shared/config/demo";
import { useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
export function DemoBanner() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [dataError, setDataError] = useState(false);
  const client = useQueryClient();
  useEffect(
    () =>
      client.getQueryCache().subscribe((event) => {
        if (
          event.query.queryKey[0] === "demo" &&
          event.query.state.status === "error"
        )
          setDataError(true);
      }),
    [client],
  );
  if (!isDemo) return null;
  return (
    <aside className="mb-8 border-2 border-amber-400 bg-amber-50 p-4 text-sm text-amber-950 sm:p-5">
      <div className="mx-auto flex max-w-[1420px] flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <TriangleAlert
            className="mt-0.5 h-6 w-6 shrink-0"
            aria-hidden="true"
          />
          <div>
            <strong className="block text-base">This is a demo</strong>
            <p className="mt-1 leading-6">
              All accounts and records are samples. Use sample information only.
            </p>
            <p className="mt-1 text-xs">
              Signed in as {user?.firstName} {user?.lastName}. Your changes stay
              in this demo.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className="min-h-11 px-3 font-semibold text-amber-950 underline"
            onClick={() => setOpen(true)}
          >
            Switch account
          </button>
          <button className="min-h-11 px-3 underline" onClick={exitDemo}>
            Exit demo
          </button>
        </div>
      </div>
      {dataError && (
        <p role="alert" className="mx-auto max-w-[1420px] text-red-700">
          Some records could not load. Please try again.{" "}
          <button
            className="min-h-11 underline"
            onClick={() => {
              setDataError(false);
              void client.invalidateQueries({ queryKey: ["demo"] });
            }}
          >
            Retry
          </button>
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#f4f1ea]">
          <DialogHeader>
            <DialogTitle>Switch account</DialogTitle>
          </DialogHeader>
          <DemoPicker onSelected={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </aside>
  );
}

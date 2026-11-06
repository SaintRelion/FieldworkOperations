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
import { ChevronDown, TriangleAlert } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useEffect, useState } from "react";
export function DemoMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
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
    <>
      <Popover open={detailsOpen} onOpenChange={setDetailsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={
              dataError
                ? "Demo details: some records could not load"
                : "Demo details"
            }
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-amber-300/40 bg-amber-300/10 px-3 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-300/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            <TriangleAlert size={15} aria-hidden="true" />
            Demo
            {dataError && (
              <span
                className="h-2 w-2 rounded-full bg-red-400"
                aria-hidden="true"
              />
            )}
            <ChevronDown size={13} aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={12}
          className="w-80 max-w-[calc(100vw-2rem)] border-slate-200 bg-white p-5 text-slate-900 shadow-xl"
        >
          <h2 className="text-base font-semibold">Demo workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            All accounts and records are samples. Use sample information only.
            Your changes are separate from other visitors.
          </p>
          <p className="mt-3 border-t border-slate-100 pt-3 text-sm">
            Signed in as{" "}
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>
            .
          </p>
          {dataError && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              Some records could not load.{" "}
              <button
                className="min-h-11 font-semibold underline"
                onClick={() => {
                  setDataError(false);
                  void client.invalidateQueries({ queryKey: ["demo"] });
                }}
              >
                Retry
              </button>
            </p>
          )}
          <div className="mt-4 grid gap-2">
            <button
              className="min-h-11 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-700"
              onClick={() => {
                setDetailsOpen(false);
                setOpen(true);
              }}
            >
              Switch account
            </button>
            <button
              className="min-h-11 rounded-md border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50"
              onClick={exitDemo}
            >
              Exit demo
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#f4f1ea]">
          <DialogHeader>
            <DialogTitle>Switch account</DialogTitle>
          </DialogHeader>
          <DemoPicker onSelected={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

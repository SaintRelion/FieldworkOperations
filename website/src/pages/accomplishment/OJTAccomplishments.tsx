import React, { useMemo, useRef, useState } from "react";
import {
  Plus,
  Camera,
  Upload,
  X,
  ImageOff,
  Loader2,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import { useCurrentUser } from "@saintrelion/auth-lib";
import { useResourceLocked } from "@saintrelion/data-access-layer";
import {
  getCurrentDateTimeString,
  formatReadableDate,
} from "@saintrelion/time-functions";
import { toast } from "@saintrelion/notifications";
import type { User } from "@/models/User";
import type {
  Accomplishment,
  CreateAccomplishment,
} from "@/models/Accomplishment";
import { AccomplishmentReportDialog } from "@/components/AccomplishmentReportDialog";

// ─── HELPERS────
const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });

// ─── MAIN PAGE──
export default function OJTAccomplishments() {
  const user = useCurrentUser<User>();

  const { useList: getAccomplishments, useInsert: insertAccomplishment } =
    useResourceLocked<Accomplishment, CreateAccomplishment>("accomplishment", {
      showToast: false,
    });

  const accomplishments = getAccomplishments({
    filters: { userId: user.id },
  }).data;

  const [showModal, setShowModal] = useState(false);

  // Group by date descending → [date, items][]
  const sortedGrouped = useMemo<[string, Accomplishment[]][]>(() => {
    const map: Record<string, Accomplishment[]> = {};
    [...accomplishments]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .forEach((item) => {
        if (!map[item.date]) map[item.date] = [];
        map[item.date].push(item);
      });
    return Object.entries(map);
  }, [accomplishments]);

  const handleInsert = async (payload: CreateAccomplishment) => {
    await insertAccomplishment.run(payload);
    toast.success("Accomplishment logged!");
    setShowModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-5 border-b border-[#152238]/15 pb-7 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-[#1677ff] uppercase">Intern / work log</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#152238] sm:text-4xl">Accomplishments</h1>
          <p className="mt-2 text-sm text-slate-600">Keep a dated record of the work you completed during training.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Report button — only show if there's data to report */}
          {accomplishments.length > 0 && (
            <AccomplishmentReportDialog
              groupedAccomplishments={sortedGrouped}
            />
          )}

          <button
            onClick={() => setShowModal(true)}
            className="flex min-h-11 items-center gap-2 bg-[#1677ff] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0864db]"
          >
            <Plus size={16} />
            Add entry
          </button>
        </div>
      </div>

      {sortedGrouped.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="space-y-6">
          {sortedGrouped.map(([date, items]) => (
            <DaySection key={date} date={date} items={items} />
          ))}
        </div>
      )}

      {showModal && (
        <AddAccomplishmentModal
          userId={user.id}
          onClose={() => setShowModal(false)}
          onSubmit={handleInsert}
          isLoading={insertAccomplishment.isLocked}
        />
      )}
    </div>
  );
}

// ─── DAY SECTION
function DaySection({
  date,
  items,
}: {
  date: string;
  items: Accomplishment[];
}) {
  const today = getCurrentDateTimeString().slice(0, 10);
  const isToday = date === today;

  return (
    <section className="border border-[#152238]/12 bg-white">
        <div className="flex items-center justify-between border-b border-[#152238]/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <CalendarDays size={16} className="text-[#1677ff]" />
            <span className="text-sm font-semibold text-[#152238]">
              {formatReadableDate(date)}
            </span>
            {isToday && (
              <span className="bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 uppercase">
                Today
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {items.length} {items.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="divide-y divide-[#152238]/10">
          {items.map((item) => (
            <AccomplishmentCard key={item.id} item={item} />
          ))}
        </div>
    </section>
  );
}

// ─── ACCOMPLISHMENT CARD ───────────────────────────────────────────────────────
function AccomplishmentCard({ item }: { item: Accomplishment }) {
  return (
    <div className="flex items-start gap-4 p-5 sm:px-6">
      <div className="h-16 w-20 shrink-0 overflow-hidden bg-slate-100">
        {item.image ? (
          <img
            src={item.image}
            alt="accomplishment"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
            <ImageOff size={20} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between py-1">
        <p className="text-sm leading-relaxed text-slate-700">
          {item.description}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <CheckCircle2 size={13} className="text-[#1677ff]" />
          <span className="text-[10px] font-semibold tracking-[0.12em] text-[#1677ff] uppercase">
            Logged
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed border-[#152238]/20 bg-white px-6 py-14 text-center">
      <h2 className="text-xl font-semibold text-[#152238]">
        No accomplishments yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
        Add your first entry to start a dated record of your training work.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#1677ff] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0864db]"
      >
        <Plus size={16} /> Add First Entry
      </button>
    </div>
  );
}

function AddAccomplishmentModal({
  userId,
  onClose,
  onSubmit,
  isLoading,
}: {
  userId: string;
  onClose: () => void;
  onSubmit: (payload: CreateAccomplishment) => Promise<void>;
  isLoading: boolean;
}) {
  const today = getCurrentDateTimeString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setImage(b64);
    setImagePreview(b64);
    if (cameraActive) stopCamera();
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch {
      setCameraError("Camera access denied. Please use file upload instead.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const b64 = canvas.toDataURL("image/jpeg", 0.85);
    setImage(b64);
    setImagePreview(b64);
    stopCamera();
  };

  const clearImage = () => {
    setImage("");
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please describe what you accomplished.");
      return;
    }
    if (!date) {
      toast.error("Please set a date.");
      return;
    }
    await onSubmit({ userId, image, description: description.trim(), date });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#09111f]/70 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-[#152238]/15 bg-white p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#152238]">
              New accomplishment
            </h2>
            <p className="mt-1 text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
              What did you accomplish?
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-500 transition-all hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Date */}
          <div>
            <label className="mb-2 block text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Image */}
          <div>
            <label className="mb-2 block text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
              Photo{" "}
              <span className="font-bold tracking-normal text-slate-300 normal-case">
                (optional)
              </span>
            </label>

            {cameraActive && (
              <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-48 w-full object-cover"
                />
                <div className="flex gap-2 p-3">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 rounded-xl bg-white py-2.5 text-[10px] font-black tracking-widest text-slate-800 uppercase hover:bg-slate-50"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-[10px] font-black text-white uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <p className="mb-2 text-[11px] font-black text-rose-500">
                {cameraError}
              </p>
            )}

            {imagePreview && !cameraActive && (
              <div className="relative mb-3 overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-44 w-full object-cover"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {!imagePreview && !cameraActive && (
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-3.5 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:border-slate-900 hover:text-slate-900"
                >
                  <Camera size={15} /> Camera
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-3.5 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:border-slate-900 hover:text-slate-900"
                >
                  <Upload size={15} /> Upload
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you accomplished today..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !description.trim()}
            className="flex w-full items-center justify-center gap-2 bg-[#1677ff] py-4 text-sm font-semibold text-white transition-colors hover:bg-[#0864db] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {isLoading ? "Saving..." : "Save Accomplishment"}
          </button>
        </div>
      </div>
    </div>
  );
}

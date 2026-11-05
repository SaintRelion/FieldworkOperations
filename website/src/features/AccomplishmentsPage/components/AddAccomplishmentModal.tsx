import { toBase64 } from "@/features/AccomplishmentsPage/lib/images";
import { demoPhoto, isDemo } from "@/shared/config/demo";
import type { CreateAccomplishment } from "@/shared/model/Accomplishment";
import { toast } from "@saintrelion/notifications";
import { getCurrentDateTimeString } from "@saintrelion/time-functions";
import { Camera, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";

export function AddAccomplishmentModal({
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
    if (isDemo) {
      setImage(demoPhoto);
      setImagePreview(demoPhoto);
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setImage(b64);
    setImagePreview(b64);
    if (cameraActive) stopCamera();
  };

  const startCamera = async () => {
    if (isDemo) {
      setImage(demoPhoto);
      setImagePreview(demoPhoto);
      return;
    }
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
        {/* ============================================================ */}
        {/* MARK: Header */}
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
          {/* ============================================================ */}
          {/* MARK: Date */}
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

          {/* ============================================================ */}
          {/* MARK: Image */}
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
                  onClick={() => {
                    if (isDemo) {
                      setImage(demoPhoto);
                      setImagePreview(demoPhoto);
                    } else fileRef.current?.click();
                  }}
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

          {/* ============================================================ */}
          {/* MARK: Description */}
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

          {/* ============================================================ */}
          {/* MARK: Submit */}
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

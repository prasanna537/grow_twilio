"use client";

import { Trash2, Loader2, X } from "lucide-react";
import { useDeleteSession } from "@/lib/hooks";
import { toast } from "sonner";

interface DeleteSessionDialogProps {
  sessionName: string;
  onClose: () => void;
}

export function DeleteSessionDialog({
  sessionName,
  onClose,
}: DeleteSessionDialogProps) {
  const { mutateAsync, isPending } = useDeleteSession();

  async function handleDelete() {
    try {
      await mutateAsync(sessionName);
      toast.success(`Session "${sessionName}" deleted`);
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete session";
      toast.error(message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/20 p-2.5">
            <Trash2 className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Delete Session
            </h2>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-200">
            &ldquo;{sessionName}&rdquo;
          </span>
          ? This will stop and logout the session permanently.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 rounded-lg border border-slate-700/50 text-slate-400 text-sm hover:text-slate-200 hover:border-slate-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

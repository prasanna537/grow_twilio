"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Loader2, ShieldCheck } from "lucide-react";
import { useCreateSession } from "@/lib/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, {
      message: "Only alphanumeric, hyphens, underscores allowed",
    })
    .max(54, "Name too long (max 54 chars)")
    .optional()
    .or(z.literal("")),
  start: z.boolean(),
  webhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface CreateSessionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function CreateSessionDialog({
  open = true,
  onOpenChange,
  onClose,
}: CreateSessionDialogProps) {
  const { mutateAsync, isPending } = useCreateSession();

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", start: true, webhookUrl: "" },
  });

  if (!open) return null;

  async function onSubmit(values: FormValues) {
    try {
      const config = values.webhookUrl
        ? { webhooks: [{ url: values.webhookUrl, events: ["message", "session.status"] }] }
        : undefined;

      const res = await mutateAsync({
        name: values.name || undefined,
        start: values.start,
        config,
      });

      toast.success(`Session "${res.name}" created!`);
      handleClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to create session";
      toast.error(message);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="new-session-title">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="new-session-title" className="text-lg font-semibold">
              Create new session
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Connect a WhatsApp number to your workspace.
            </p>
          </div>
          <button className="icon-button" onClick={handleClose}>
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium">
              Session name <span className="text-muted-foreground">(optional)</span>
            </span>
            <input
              {...register("name")}
              autoFocus
              placeholder="e.g. customer-support"
              className={cn("form-input font-mono", errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium">
              Webhook URL <span className="text-muted-foreground">(optional)</span>
            </span>
            <input
              {...register("webhookUrl")}
              placeholder="https://example.com/api/webhook"
              type="url"
              className={cn("form-input font-mono", errors.webhookUrl && "border-destructive")}
            />
            {errors.webhookUrl && (
              <p className="text-[11px] text-destructive">{errors.webhookUrl.message}</p>
            )}
          </label>

          <label className="flex items-center gap-3 cursor-pointer pt-1">
            <input
              {...register("start")}
              type="checkbox"
              className="w-4 h-4 rounded"
            />
            <span className="text-xs font-medium">Start session immediately after creation</span>
          </label>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mr-1 inline size-3.5 text-primary" />
            You&apos;ll receive a QR code to link this session after creation.
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="soft-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

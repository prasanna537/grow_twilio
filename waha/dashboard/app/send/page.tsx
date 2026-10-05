"use client";

import { useState, useEffect, useCallback } from "react";
import { getSettings, normalizeChatId, validateChatId, extractErrorMessage } from "@/lib/api";
import {
  ChevronRight,
  Copy,
  LoaderCircle,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSessions,
  useSendText,
  useSendImage,
  useSendVideo,
  useSendFile,
  useSendVoice,
  useSendLinkCustomPreview,
  useSendButtons,
  useSendList,
  useSendForwardMessage,
  useSendSeen,
  useStartTyping,
  useStopTyping,
  useSendLocation,
} from "@/lib/hooks";
import { WAHASessionStatus, WAMessage } from "@/lib/types";
import { toast } from "sonner";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <AlertTriangle className="size-3 shrink-0" />
          {error}
        </span>
      )}
    </label>
  );
}

/**
 * Safely convert any value to a displayable string.
 * WAHA's whatsapp-web.js returns message IDs as complex objects
 * ({fromMe, remote, id, $1, _serialized}) rather than plain strings.
 */
function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "-";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    // whatsapp-web.js MessageId format
    const obj = val as Record<string, unknown>;
    if (typeof obj._serialized === "string") return obj._serialized;
    if (typeof obj.id === "string") return obj.id;
    return JSON.stringify(val);
  }
  return String(val);
}

function ResponsePanel({ response }: { response: WAMessage | null }) {
  if (!response) return null;

  const msgId = safeStr(response.id);
  const to = safeStr(response.to);
  const ack = safeStr(response.ackName || response.ack || "sent");
  const ts = response.timestamp
    ? new Date(Number(response.timestamp) * 1000).toLocaleString()
    : "-";

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <CheckCircle2 className="size-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-400">Message sent successfully</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/70">Message ID</span>
        <span className="font-mono break-all">{msgId}</span>
        <span className="font-medium text-foreground/70">Timestamp</span>
        <span>{ts}</span>
        <span className="font-medium text-foreground/70">To</span>
        <span className="font-mono">{to}</span>
        <span className="font-medium text-foreground/70">ACK</span>
        <span>{ack}</span>
      </div>
    </div>
  );
}

// ─── Tab configuration ────────────────────────────────────────────────────────

const TABS = [
  "Text",
  "Image",
  "Video",
  "Document",
  "Voice",
  "Link Preview",
  "Buttons ⚠",
  "List",
  "Forward",
  "Seen",
  "Typing",
  "Location",
] as const;
type Tab = (typeof TABS)[number];

// ─── Main component ───────────────────────────────────────────────────────────

export default function SendMessagePage() {
  const { data: sessions } = useSessions(true);
  const workingSessions =
    sessions?.filter((s) => s.status === WAHASessionStatus.WORKING) ?? [];

  const [tab, setTab] = useState<Tab>("Text");
  const [session, setSession] = useState("");
  const [chatId, setChatId] = useState("919876543210@c.us");
  const [chatIdError, setChatIdError] = useState<string>("");

  // Text
  const [text, setText] = useState("Hello from WAHA!");

  // Media (Image / Video / Document / Voice)
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaMimetype, setMediaMimetype] = useState("");
  const [caption, setCaption] = useState("");

  // Link Custom Preview
  const [linkText, setLinkText] = useState("Check this out! https://github.com/");
  const [previewUrl, setPreviewUrl] = useState("https://github.com/");
  const [previewTitle, setPreviewTitle] = useState("GitHub");
  const [previewDesc, setPreviewDesc] = useState("Where the world builds software");
  const [previewImgUrl, setPreviewImgUrl] = useState("");

  // Buttons (deprecated)
  const [btnHeader, setBtnHeader] = useState("How are you?");
  const [btnBody, setBtnBody] = useState("Tell us how are you please 🙏");
  const [btnFooter, setBtnFooter] = useState("");

  // List
  const [listTitle, setListTitle] = useState("Simple Menu");
  const [listDesc, setListDesc] = useState("Please choose an option");
  const [listButton, setListButton] = useState("Choose");
  const [listFooter, setListFooter] = useState("Thank you!");

  // Forward
  const [forwardMessageId, setForwardMessageId] = useState(
    "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA"
  );

  // Seen
  const [seenMessageId, setSeenMessageId] = useState("");

  // Location
  const [latitude, setLatitude] = useState("37.7749");
  const [longitude, setLongitude] = useState("-122.4194");
  const [locationTitle, setLocationTitle] = useState("Our office");

  // Response display
  const [lastResponse, setLastResponse] = useState<WAMessage | null>(null);
  const [docsUrl, setDocsUrl] = useState("http://localhost:3000/");

  const sendText = useSendText();
  const sendImage = useSendImage();
  const sendVideo = useSendVideo();
  const sendFile = useSendFile();
  const sendVoice = useSendVoice();
  const sendLinkCustomPreview = useSendLinkCustomPreview();
  const sendButtons = useSendButtons();
  const sendList = useSendList();
  const sendForward = useSendForwardMessage();
  const sendSeen = useSendSeen();
  const startTyping = useStartTyping();
  const stopTyping = useStopTyping();
  const sendLocation = useSendLocation();

  const isPending =
    sendText.isPending ||
    sendImage.isPending ||
    sendVideo.isPending ||
    sendFile.isPending ||
    sendVoice.isPending ||
    sendLinkCustomPreview.isPending ||
    sendButtons.isPending ||
    sendList.isPending ||
    sendForward.isPending ||
    sendSeen.isPending ||
    startTyping.isPending ||
    stopTyping.isPending ||
    sendLocation.isPending;

  const activeSession = session || workingSessions[0]?.name || "";

  useEffect(() => {
    const settings = getSettings();
    setDocsUrl(`${settings.baseUrl}/`);
  }, []);

  // Auto-set default mimetypes per tab
  useEffect(() => {
    if (tab === "Image") setMediaMimetype("image/jpeg");
    else if (tab === "Video") setMediaMimetype("video/mp4");
    else if (tab === "Document") setMediaMimetype("application/pdf");
    else if (tab === "Voice") setMediaMimetype("audio/ogg; codecs=opus");
    setLastResponse(null);
  }, [tab]);

  const validateFields = useCallback((): boolean => {
    const err = validateChatId(chatId);
    setChatIdError(err || "");
    if (err) return false;

    if (!activeSession) {
      toast.error("Select a working WhatsApp session first.");
      return false;
    }
    return true;
  }, [chatId, activeSession]);

  const resolvedChatId = (() => {
    try {
      return normalizeChatId(chatId);
    } catch {
      return chatId;
    }
  })();

  const handleSend = async () => {
    if (!validateFields()) return;

    try {
      let res: WAMessage | unknown;

      if (tab === "Text") {
        if (!text.trim()) {
          toast.error("Message text is required.");
          return;
        }
        res = await sendText.mutateAsync({
          session: activeSession,
          chatId,
          text,
          linkPreview: true,
        });

      } else if (tab === "Image") {
        if (!mediaUrl.trim()) { toast.error("Image URL is required."); return; }
        res = await sendImage.mutateAsync({
          session: activeSession,
          chatId,
          file: { mimetype: mediaMimetype || "image/jpeg", url: mediaUrl },
          caption,
        });

      } else if (tab === "Video") {
        if (!mediaUrl.trim()) { toast.error("Video URL is required."); return; }
        res = await sendVideo.mutateAsync({
          session: activeSession,
          chatId,
          file: { mimetype: mediaMimetype || "video/mp4", url: mediaUrl },
          caption,
        });

      } else if (tab === "Document") {
        if (!mediaUrl.trim()) { toast.error("File URL is required."); return; }
        res = await sendFile.mutateAsync({
          session: activeSession,
          chatId,
          file: { mimetype: mediaMimetype || "application/pdf", url: mediaUrl },
          caption,
        });

      } else if (tab === "Voice") {
        if (!mediaUrl.trim()) { toast.error("Voice file URL is required."); return; }
        res = await sendVoice.mutateAsync({
          session: activeSession,
          chatId,
          file: { mimetype: "audio/ogg; codecs=opus", url: mediaUrl },
        });

      } else if (tab === "Link Preview") {
        if (!linkText.trim() || !previewUrl.trim()) {
          toast.error("Text and preview URL are required.");
          return;
        }
        if (!linkText.includes(previewUrl)) {
          toast.error("The text must include the preview URL.");
          return;
        }
        res = await sendLinkCustomPreview.mutateAsync({
          session: activeSession,
          chatId,
          text: linkText,
          preview: {
            url: previewUrl,
            title: previewTitle,
            description: previewDesc,
            ...(previewImgUrl ? { image: { url: previewImgUrl } } : {}),
          },
        });

      } else if (tab === "Buttons ⚠") {
        res = await sendButtons.mutateAsync({
          session: activeSession,
          chatId,
          header: btnHeader,
          body: btnBody,
          footer: btnFooter || undefined,
          buttons: [
            { type: "reply", text: "Yes!", id: "btn_yes" },
            { type: "reply", text: "No thanks", id: "btn_no" },
          ],
        });

      } else if (tab === "List") {
        if (!listButton.trim()) { toast.error("Button label is required."); return; }
        res = await sendList.mutateAsync({
          session: activeSession,
          chatId,
          message: {
            title: listTitle,
            description: listDesc || undefined,
            footer: listFooter || undefined,
            button: listButton,
            sections: [
              {
                title: "Options",
                rows: [
                  { title: "Option 1", rowId: "option1", description: "First option" },
                  { title: "Option 2", rowId: "option2", description: "Second option" },
                  { title: "Option 3", rowId: "option3" },
                ],
              },
            ],
          },
        });

      } else if (tab === "Forward") {
        if (!forwardMessageId.trim()) { toast.error("Message ID to forward is required."); return; }
        res = await sendForward.mutateAsync({
          session: activeSession,
          chatId,
          messageId: forwardMessageId,
        });

      } else if (tab === "Seen") {
        res = await sendSeen.mutateAsync({
          session: activeSession,
          chatId,
          ...(seenMessageId ? { messageId: seenMessageId } : {}),
        });
        toast.success("Marked as seen.");
        setLastResponse(null);
        return;

      } else if (tab === "Typing") {
        res = await startTyping.mutateAsync({
          session: activeSession,
          chatId,
        });
        toast.success("Typing indicator started. Use 'Stop Typing' to clear it.");
        setLastResponse(null);
        return;

      } else if (tab === "Location") {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
          toast.error("Enter valid latitude and longitude numbers.");
          return;
        }
        res = await sendLocation.mutateAsync({
          session: activeSession,
          chatId,
          latitude: lat,
          longitude: lng,
          title: locationTitle || undefined,
        });
      }

      if (res && typeof res === "object" && "id" in res) {
        setLastResponse(res as WAMessage);
        toast.success("Sent successfully!");
      }
    } catch (error) {
      const msg = extractErrorMessage(error);
      toast.error(msg, { duration: 6000 });
    }
  };

  const handleStopTyping = async () => {
    if (!validateFields()) return;
    try {
      await stopTyping.mutateAsync({ session: activeSession, chatId });
      toast.success("Typing indicator stopped.");
    } catch (error) {
      toast.error(extractErrorMessage(error), { duration: 6000 });
    }
  };

  // ─── Curl preview ────────────────────────────────────────────────────────

  const baseUrl = getSettings().baseUrl;

  const curlPreview = (() => {
    const sid = activeSession || "<session>";
    const cid = resolvedChatId || "<chatId>";
    const h = `  -H "X-Api-Key: ••••" \\\n  -H "Content-Type: application/json" \\\n`;

    if (tab === "Text") {
      return `curl -X POST ${baseUrl}/api/sendText \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","text":"${text.replace(/'/g, "\\'")}"}'`;
    }
    if (tab === "Image") {
      return `curl -X POST ${baseUrl}/api/sendImage \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","file":{"mimetype":"${mediaMimetype || "image/jpeg"}","url":"${mediaUrl}"},"caption":"${caption}"}'`;
    }
    if (tab === "Video") {
      return `curl -X POST ${baseUrl}/api/sendVideo \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","file":{"mimetype":"${mediaMimetype || "video/mp4"}","url":"${mediaUrl}"},"caption":"${caption}"}'`;
    }
    if (tab === "Document") {
      return `curl -X POST ${baseUrl}/api/sendFile \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","file":{"mimetype":"${mediaMimetype || "application/pdf"}","url":"${mediaUrl}"},"caption":"${caption}"}'`;
    }
    if (tab === "Voice") {
      return `curl -X POST ${baseUrl}/api/sendVoice \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","file":{"mimetype":"audio/ogg; codecs=opus","url":"${mediaUrl}"}}'`;
    }
    if (tab === "Link Preview") {
      return `curl -X POST ${baseUrl}/api/send/link-custom-preview \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","text":"${linkText.replace(/'/g, "\\'")}","preview":{"url":"${previewUrl}","title":"${previewTitle}","description":"${previewDesc}"}}'`;
    }
    if (tab === "Buttons ⚠") {
      return `curl -X POST ${baseUrl}/api/sendButtons \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","header":"${btnHeader}","body":"${btnBody}","buttons":[{"type":"reply","text":"Yes!","id":"btn_yes"},{"type":"reply","text":"No thanks","id":"btn_no"}]}'`;
    }
    if (tab === "List") {
      return `curl -X POST ${baseUrl}/api/sendList \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","message":{"title":"${listTitle}","button":"${listButton}","sections":[{"title":"Options","rows":[{"title":"Option 1","rowId":"option1"}]}]}}'`;
    }
    if (tab === "Forward") {
      return `curl -X POST ${baseUrl}/api/forwardMessage \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","messageId":"${forwardMessageId}"}'`;
    }
    if (tab === "Seen") {
      return `curl -X POST ${baseUrl}/api/sendSeen \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}"}'`;
    }
    if (tab === "Typing") {
      return `# Start typing:\ncurl -X POST ${baseUrl}/api/startTyping \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}"}'\n\n# Stop typing:\ncurl -X POST ${baseUrl}/api/stopTyping \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}"}'`;
    }
    if (tab === "Location") {
      return `curl -X POST ${baseUrl}/api/sendLocation \\\n${h}  -d '{"session":"${sid}","chatId":"${cid}","latitude":${latitude || 37.7749},"longitude":${longitude || -122.4194},"title":"${locationTitle}"}'`;
    }
    return "";
  })();

  const sendLabel = (() => {
    if (tab === "Seen") return "Mark as Seen";
    if (tab === "Typing") return "Start Typing";
    return `Send ${tab.replace(" ⚠", "")}`;
  })();

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Send message</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Test your API requests before wiring them into your app.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              activeSession ? "bg-emerald-500" : "bg-muted-foreground"
            )}
          />
          {activeSession ? `Using ${activeSession}` : "No active session"}
        </span>
      </div>

      {workingSessions.length === 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-900/10 px-4 py-3 text-sm text-yellow-300">
          <AlertTriangle className="size-4 shrink-0" />
          No connected WhatsApp sessions. Go to Sessions to connect one first.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* ── Form panel ── */}
        <div className="panel">
          {/* Tabs */}
          <div className="border-b border-border p-4">
            <div className="flex flex-wrap gap-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn("tab-button", tab === t && "tab-button-active")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5">
            {/* Session selector */}
            <Field label="Session">
              <select
                className="form-input"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              >
                <option value="">
                  {workingSessions.length > 0
                    ? `Auto (${workingSessions[0]?.name})`
                    : "No working sessions"}
                </option>
                {workingSessions.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Chat ID – shown for all tabs except none */}
            <Field label="Chat ID" error={chatIdError}>
              <input
                value={chatId}
                onChange={(e) => {
                  setChatId(e.target.value);
                  setChatIdError(validateChatId(e.target.value) || "");
                }}
                className={cn("form-input", chatIdError && "border-red-500/60")}
                placeholder="919876543210@c.us"
              />
              <span className="text-xs text-muted-foreground">
                Format: <code className="font-mono">919876543210@c.us</code> or bare number like{" "}
                <code className="font-mono">919876543210</code>
              </span>
            </Field>

            {/* ── Tab-specific fields ── */}

            {tab === "Text" && (
              <>
                <Field label="Message">
                  <textarea
                    className="form-input min-h-32 resize-y"
                    placeholder="Write your message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </Field>
                <Field label="Preview">
                  <div className="preview-bubble">{text || "Your message here"}</div>
                </Field>
              </>
            )}

            {(tab === "Image" || tab === "Video" || tab === "Document" || tab === "Voice") && (
              <>
                <Field label={`${tab} URL`}>
                  <input
                    className="form-input"
                    placeholder={
                      tab === "Image"
                        ? "https://picsum.photos/800"
                        : tab === "Video"
                        ? "https://example.com/video.mp4"
                        : tab === "Voice"
                        ? "https://example.com/voice.opus"
                        : "https://example.com/file.pdf"
                    }
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                </Field>
                <Field label="MIME Type">
                  <input
                    className="form-input"
                    value={mediaMimetype}
                    onChange={(e) => setMediaMimetype(e.target.value)}
                    placeholder={
                      tab === "Image"
                        ? "image/jpeg"
                        : tab === "Video"
                        ? "video/mp4"
                        : tab === "Voice"
                        ? "audio/ogg; codecs=opus"
                        : "application/pdf"
                    }
                  />
                </Field>
                {tab !== "Voice" && (
                  <Field label="Caption (optional)">
                    <input
                      className="form-input"
                      placeholder="Add a caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </Field>
                )}
              </>
            )}

            {tab === "Link Preview" && (
              <>
                <Field label="Message Text (must include the URL below)">
                  <textarea
                    className="form-input min-h-20 resize-y"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Check this out! https://github.com/"
                  />
                </Field>
                <Field label="Preview URL">
                  <input
                    className="form-input"
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    placeholder="https://github.com/"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preview Title">
                    <input
                      className="form-input"
                      value={previewTitle}
                      onChange={(e) => setPreviewTitle(e.target.value)}
                      placeholder="GitHub"
                    />
                  </Field>
                  <Field label="Preview Description">
                    <input
                      className="form-input"
                      value={previewDesc}
                      onChange={(e) => setPreviewDesc(e.target.value)}
                      placeholder="Where the world builds software"
                    />
                  </Field>
                </div>
                <Field label="Preview Image URL (optional)">
                  <input
                    className="form-input"
                    value={previewImgUrl}
                    onChange={(e) => setPreviewImgUrl(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </Field>
              </>
            )}

            {tab === "Buttons ⚠" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/10 px-4 py-3 text-xs text-yellow-300">
                  <strong>Deprecated:</strong> The Buttons API is marked deprecated in WAHA WEBJS
                  engine. It may not work reliably on newer WhatsApp versions. The endpoint is still
                  present at <code>/api/sendButtons</code>.
                </div>
                <Field label="Header">
                  <input className="form-input" value={btnHeader} onChange={(e) => setBtnHeader(e.target.value)} />
                </Field>
                <Field label="Body">
                  <input className="form-input" value={btnBody} onChange={(e) => setBtnBody(e.target.value)} />
                </Field>
                <Field label="Footer (optional)">
                  <input className="form-input" value={btnFooter} onChange={(e) => setBtnFooter(e.target.value)} />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Buttons are pre-filled: <em>Yes!</em> and <em>No thanks</em> (reply type).
                  Customize in the API call for real use.
                </p>
              </div>
            )}

            {tab === "List" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title">
                    <input className="form-input" value={listTitle} onChange={(e) => setListTitle(e.target.value)} />
                  </Field>
                  <Field label="Button Label">
                    <input className="form-input" value={listButton} onChange={(e) => setListButton(e.target.value)} />
                  </Field>
                </div>
                <Field label="Description (optional)">
                  <input className="form-input" value={listDesc} onChange={(e) => setListDesc(e.target.value)} />
                </Field>
                <Field label="Footer (optional)">
                  <input className="form-input" value={listFooter} onChange={(e) => setListFooter(e.target.value)} />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Sections/rows are pre-filled: Option 1, 2, 3. Customize in the API call for real use.
                </p>
              </div>
            )}

            {tab === "Forward" && (
              <Field label="Message ID to Forward">
                <input
                  className="form-input font-mono text-xs"
                  value={forwardMessageId}
                  onChange={(e) => setForwardMessageId(e.target.value)}
                  placeholder="false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA"
                />
              </Field>
            )}

            {tab === "Seen" && (
              <>
                <Field label="Message ID (optional — leave blank to mark all recent messages as seen)">
                  <input
                    className="form-input font-mono text-xs"
                    value={seenMessageId}
                    onChange={(e) => setSeenMessageId(e.target.value)}
                    placeholder="false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA"
                  />
                </Field>
                <p className="text-xs text-muted-foreground">
                  When Message ID is empty, WAHA will read all messages in the last 7 days for this chat.
                </p>
              </>
            )}

            {tab === "Typing" && (
              <p className="text-sm text-muted-foreground">
                Click <strong>Start Typing</strong> to show the typing indicator in the recipient&apos;s chat.
                Then use <strong>Stop Typing</strong> to clear it.
              </p>
            )}

            {tab === "Location" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Latitude">
                    <input
                      className="form-input"
                      placeholder="37.7749"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      className="form-input"
                      placeholder="-122.4194"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Title (optional)">
                  <input
                    className="form-input"
                    value={locationTitle}
                    onChange={(e) => setLocationTitle(e.target.value)}
                    placeholder="Our office"
                  />
                </Field>
              </div>
            )}

            {/* Response panel */}
            {lastResponse && <ResponsePanel response={lastResponse} />}

            {/* Action buttons */}
            <div className="flex justify-end gap-2">
              {tab === "Typing" && (
                <button
                  className="soft-button"
                  onClick={handleStopTyping}
                  disabled={isPending}
                >
                  {stopTyping.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : null}
                  Stop Typing
                </button>
              )}
              <button
                className="soft-button"
                onClick={() => {
                  setText("Hello from WAHA!");
                  setChatId("919876543210@c.us");
                  setChatIdError("");
                  setMediaUrl("");
                  setCaption("");
                  setLastResponse(null);
                }}
              >
                Clear
              </button>
              <button
                className="primary-button"
                onClick={handleSend}
                disabled={isPending || workingSessions.length === 0}
              >
                {isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {sendLabel}
              </button>
            </div>
          </div>
        </div>

        {/* ── Request preview panel ── */}
        <div className="panel flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <p className="text-sm font-medium">Request preview</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Equivalent API request (updates live)
              </p>
            </div>
            <button
              className="icon-button"
              onClick={() => {
                navigator.clipboard.writeText(curlPreview);
                toast.success("Copied to clipboard!");
              }}
            >
              <Copy className="size-4" />
            </button>
          </div>
          <div className="flex-1 bg-[#0d1315] p-5">
            <pre className="whitespace-pre-wrap text-xs leading-6 text-emerald-200/80">
              <code>{curlPreview}</code>
            </pre>
          </div>
          <div className="flex items-center gap-2 border-t border-border p-4">
            <span
              className={cn(
                "size-2 rounded-full",
                activeSession ? "bg-emerald-500" : "bg-muted-foreground"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {activeSession ? "Ready to send" : "Select a session"}
            </span>
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-primary"
            >
              View API docs <ChevronRight className="inline size-3" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

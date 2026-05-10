import { Layout } from "@/components/Layout";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Send, Trash2, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API = "/api";

interface Message {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

function getInitials(name: string) {
  return name
    .split(/[\s._-]/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic avatar colour from username */
const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-sky-500 to-cyan-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-blue-600",
];
function avatarColor(username: string) {
  let h = 0;
  for (let i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function Community() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  /** Count of unique users who posted in the last 15 minutes */
  const onlineCount = useMemo(() => {
    const cutoff = Date.now() - 15 * 60 * 1000;
    const active = new Set(
      messages
        .filter((m) => new Date(m.created_at).getTime() > cutoff)
        .map((m) => m.user_id)
    );
    return Math.max(active.size, 1); // always show at least 1 (the current user)
  }, [messages]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ── Fetch current user id ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.sub ?? payload.id ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  /* ── Poll messages every 4 s ── */
  const fetchMessages = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/messages?limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      const data: Message[] = await res.json();
      setMessages(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load messages";
      console.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 4000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  /* ── Auto-scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send ── */
  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to chat.");
      setSending(false);
      return;
    }
    try {
      const res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(await res.text());
      setText("");
      await fetchMessages();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* ── Delete ── */
  const deleteMsg = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API}/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete message.");
    }
  };

  /* ── Keyboard send (Enter, Shift+Enter = newline) ── */
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  /* ── Group messages by date ── */
  const grouped: { date: string; msgs: Message[] }[] = [];
  for (const m of messages) {
    const d = fmtDate(m.created_at);
    if (!grouped.length || grouped[grouped.length - 1].date !== d) {
      grouped.push({ date: d, msgs: [m] });
    } else {
      grouped[grouped.length - 1].msgs.push(m);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-0 h-[calc(100vh-5rem)] animate-fade-up">

        {/* ── Header card ── */}
        <div className="glass-card rounded-b-none border-b-0 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground leading-none">
                Community Chat
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Global group chat — all traders welcome
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-bull animate-pulse-dot" />
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {onlineCount} online
            </span>
          </div>
        </div>

        {/* ── Messages area ── */}
        <div
          className="glass-card rounded-none border-t-0 border-b-0 flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-1"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No messages yet — be the first!</p>
            </div>
          ) : (
            grouped.map(({ date, msgs }) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold px-2">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {msgs.map((m, idx) => {
                  const isOwn = currentUserId === m.user_id;
                  const prevSame = idx > 0 && msgs[idx - 1].user_id === m.user_id;

                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "group flex items-end gap-2.5",
                        isOwn ? "flex-row-reverse" : "flex-row",
                        prevSame ? "mt-0.5" : "mt-3"
                      )}
                    >
                      {/* Avatar */}
                      {!prevSame ? (
                        <div
                          className={cn(
                            "h-8 w-8 shrink-0 rounded-full bg-gradient-to-br flex items-center justify-center text-[11px] font-bold text-white shadow-sm",
                            avatarColor(m.username)
                          )}
                        >
                          {getInitials(m.username)}
                        </div>
                      ) : (
                        <div className="h-8 w-8 shrink-0" />
                      )}

                      {/* Bubble */}
                      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
                        {!prevSame && (
                          <div
                            className={cn(
                              "flex items-baseline gap-2 mb-1",
                              isOwn && "flex-row-reverse"
                            )}
                          >
                            <span className="text-xs font-semibold text-foreground">
                              {isOwn ? "You" : m.username}
                            </span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {fmtTime(m.created_at)}
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words shadow-card",
                            isOwn
                              ? "gradient-primary text-primary-foreground rounded-br-sm"
                              : "bg-surface-elevated text-foreground border border-border rounded-bl-sm"
                          )}
                        >
                          {m.content}

                          {/* Time on same-sender follow-up */}
                          {prevSame && (
                            <span
                              className={cn(
                                "absolute -bottom-4 text-[10px] text-muted-foreground tabular-nums opacity-0 group-hover:opacity-100 transition-opacity",
                                isOwn ? "right-1" : "left-1"
                              )}
                            >
                              {fmtTime(m.created_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete (own messages only) */}
                      {isOwn && (
                        <button
                          onClick={() => deleteMsg(m.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-bear-soft text-muted-foreground hover:text-bear"
                          aria-label="Delete message"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="glass-card rounded-t-none border-t-0 px-4 py-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <textarea
                ref={inputRef}
                id="chat-input"
                rows={1}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  // auto-grow up to 5 rows
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={onKey}
                placeholder="Send a message… (Enter to send, Shift+Enter for newline)"
                className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none leading-relaxed"
                style={{ maxHeight: 120 }}
                disabled={sending}
              />
            </div>

            <Button
              id="chat-send-btn"
              onClick={send}
              disabled={!text.trim() || sending}
              className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-10 w-10 rounded-xl p-0 shrink-0 disabled:opacity-40 disabled:shadow-none transition-opacity"
            >
              {sending ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="mt-1.5 text-[10px] text-muted-foreground/60 pl-1">
            Be respectful · no financial advice · no spam
          </p>
        </div>
      </div>
    </Layout>
  );
}

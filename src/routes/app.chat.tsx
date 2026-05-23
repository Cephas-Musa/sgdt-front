import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, Search, Phone, MoreVertical, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi, apiGetConversations, apiGetMessages, apiSendMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
});

type Conversation = {
  id: number;
  name?: string;
  participant?: { full_name?: string; phone_number?: string; role?: string };
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  is_online?: boolean;
};

type Message = {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  is_mine?: boolean;
};

function ChatPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: rawConversations, loading: convsLoading } = useApi(apiGetConversations);
  const conversations = (rawConversations as Conversation[] ?? []);

  const selected = conversations.find((c) => c.id === selectedId);
  const filtered = conversations.filter(
    (c) => !search || (c.participant?.full_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedId) return;
    setMessagesLoading(true);
    apiGetMessages(selectedId)
      .then((msgs) => setMessages(msgs as Message[]))
      .catch(() => toast.error("Erreur lors du chargement des messages"))
      .finally(() => setMessagesLoading(false));
  }, [selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!newMsg.trim() || !selectedId) return;
    const content = newMsg.trim();
    setNewMsg("");
    setSending(true);
    try {
      const msg = await apiSendMessage(selectedId, content) as Message;
      setMessages((prev) => [...prev, { ...msg, is_mine: true }]);
    } catch {
      toast.error("Erreur envoi du message");
    } finally {
      setSending(false);
    }
  }, [newMsg, selectedId]);

  const getConvName = (c: Conversation) => c.participant?.full_name ?? c.name ?? "Inconnu";
  const getConvRole = (c: Conversation) => c.participant?.role ?? "";
  const getConvAvatar = (c: Conversation) => (getConvName(c)[0] ?? "?").toUpperCase();
  const getLastTime = (c: Conversation) => c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-border bg-card">
      {/* === LISTE DES CONVERSATIONS (sidebar gauche) === */}
      <div
        className={cn(
          "flex flex-col border-r border-border bg-card",
          "w-full md:w-80 md:min-w-[320px] shrink-0",
          selectedId ? "hidden md:flex" : "flex",
        )}
      >
        {/* Header */}
        <div className="border-b border-border p-3">
          <h2 className="text-lg font-semibold mb-2">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Liste conversations */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Aucune conversation</div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
                  selectedId === conv.id && "bg-accent/10",
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-sm">
                    {getConvAvatar(conv)}
                  </div>
                  {conv.is_online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{getConvName(conv)}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{getLastTime(conv)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{conv.last_message ?? "—"}</span>
                    {(conv.unread_count ?? 0) > 0 && (
                      <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{getConvRole(conv)}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* === DÉTAIL CONVERSATION (zone droite) === */}
      <div className={cn("flex flex-1 flex-col", !selectedId ? "hidden md:flex" : "flex")}>
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <div className="text-lg font-medium">Sélectionnez une conversation</div>
              <div className="text-sm">Choisissez un contact pour démarrer</div>
            </div>
          </div>
        ) : (
          <>
            {/* Header conversation */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-card">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden shrink-0"
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-sm">
                  {getConvAvatar(selected)}
                </div>
                {selected.is_online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{getConvName(selected)}</div>
                <div className="text-xs text-muted-foreground">
                  {selected.is_online ? "En ligne" : "Hors ligne"} · {getConvRole(selected)}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4z' fill='%23000' fill-opacity='.015'/%3E%3C/svg%3E\")",
              }}
            >
              {messagesLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-10">Aucun message — commencez la conversation</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex", msg.is_mine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                        msg.is_mine
                          ? "bg-accent text-accent-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md",
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      <div className={cn("flex items-center gap-1 mt-1", msg.is_mine ? "justify-end" : "")}>
                        <span className={cn("text-[10px]", msg.is_mine ? "text-accent-foreground/60" : "text-muted-foreground")}>
                          {new Date(msg.created_at).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {msg.is_mine && <CheckCheck className="h-3 w-3 text-accent-foreground/60" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* Input message */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Tapez un message…"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" size="sm" className="shrink-0" disabled={sending || !newMsg.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

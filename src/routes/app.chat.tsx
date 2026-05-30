import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, Search, Phone, MoreVertical, CheckCheck, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi, apiGetDossiers, apiGetDossierChat, apiSendDossierChat } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
});

type Message = {
  id: number;
  message: string;
  sender_id: number;
  created_at: string;
  sender?: {
    id: number;
    full_name: string;
    role: string;
  };
};

function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const { data: rawDossiers, loading: convsLoading } = useApi(apiGetDossiers);
  const dossiers = (rawDossiers as any[] ?? []);

  const selected = dossiers.find((d) => String(d.id) === selectedId);
  const filtered = dossiers.filter(
    (d) => !search || (d.reference ?? "").toLowerCase().includes(search.toLowerCase()) || (d.importateur ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedId) return;
    setMessagesLoading(true);
    apiGetDossierChat(selectedId)
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
      const resp: any = await apiSendDossierChat(selectedId, content);
      const msg = resp.data as Message;
      setMessages((prev) => [...prev, msg]);
    } catch {
      toast.error("Erreur envoi du message");
    } finally {
      setSending(false);
    }
  }, [newMsg, selectedId]);

  const getDossierName = (d: any) => d.reference ? `Dossier ${d.reference}` : "Dossier Inconnu";
  const getDossierAvatar = (d: any) => "📁";
  
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border border-border bg-card">
      {/* === LISTE DES DOSSIERS (sidebar gauche) === */}
      <div
        className={cn(
          "flex flex-col border-r border-border bg-card",
          "w-full md:w-80 md:min-w-[320px] shrink-0",
          selectedId ? "hidden md:flex" : "flex",
        )}
      >
        {/* Header */}
        <div className="border-b border-border p-3">
          <h2 className="text-lg font-semibold mb-2">Chat Contextuel Dossiers</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un dossier…"
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
            <div className="p-6 text-center text-sm text-muted-foreground">Aucun dossier trouvé</div>
          ) : (
            filtered.map((dossier) => (
              <button
                key={dossier.id}
                onClick={() => setSelectedId(String(dossier.id))}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
                  selectedId === String(dossier.id) && "bg-accent/10",
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent text-xl">
                    {getDossierAvatar(dossier)}
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{getDossierName(dossier)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{dossier.importateur}</div>
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
              <div className="text-4xl mb-3"><FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50"/></div>
              <div className="text-lg font-medium">Sélectionnez un dossier</div>
              <div className="text-sm">Ouvrez le canal de discussion d'un dossier</div>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent text-lg">
                  {getDossierAvatar(selected)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{getDossierName(selected)}</div>
                <div className="text-xs text-muted-foreground">
                  Discussion d'équipe sur ce dossier
                </div>
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
                <div className="text-center text-sm text-muted-foreground py-10">Aucun message — commencez la discussion</div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                  <div
                    key={msg.id}
                    className={cn("flex flex-col", isMine ? "items-end" : "items-start")}
                  >
                    {!isMine && msg.sender && (
                      <span className="text-[10px] text-muted-foreground mb-1 ml-1">{msg.sender.full_name} ({msg.sender.role})</span>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                        isMine
                          ? "bg-accent text-accent-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md",
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                      <div className={cn("flex items-center gap-1 mt-1", isMine ? "justify-end" : "")}>
                        <span className={cn("text-[10px]", isMine ? "text-accent-foreground/60" : "text-muted-foreground")}>
                          {new Date(msg.created_at).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isMine && <CheckCheck className="h-3 w-3 text-accent-foreground/60" />}
                      </div>
                    </div>
                  </div>
                  );
                })
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
                  placeholder="Tapez un message pour ce dossier…"
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

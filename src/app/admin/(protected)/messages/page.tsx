"use client";
import { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string | null;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const { getMessages } = await import("@/actions/contact");
      const data = await getMessages();
      setMessages(data as unknown as Message[]);
    } catch { /* noop */ }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleToggleRead = async (id: string, read: boolean) => {
    const { markMessageRead } = await import("@/actions/contact");
    await markMessageRead(id, !read);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: !read } : m));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { deleteContactMessage } = await import("@/actions/contact");
    await deleteContactMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 tracking-tight">Messages</h1>
        {unread > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold dark:bg-purple-500/20 dark:text-purple-400 bg-purple-100 text-purple-700">{unread} unread</span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 dark:text-white/40 text-gray-400">Loading...</div>
      ) : messages.length === 0 ? (
        <GlassCard className="text-center py-16 dark:text-white/40 text-gray-400">No messages yet</GlassCard>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <GlassCard key={msg.id} className={`overflow-hidden transition-all duration-200 ${!msg.read ? "dark:border-purple-500/30 border-purple-200" : ""}`}>
              <div
                className="flex items-center gap-3 p-4 cursor-pointer dark:hover:bg-white/5 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
              >
                <div className="flex-shrink-0">
                  {msg.read
                    ? <MailOpen size={16} className="dark:text-white/30 text-gray-400" />
                    : <Mail size={16} className="text-purple-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${!msg.read ? "dark:text-white text-gray-900" : "dark:text-white/70 text-gray-600"}`}>{msg.name}</span>
                    {msg.email && <span className="text-xs dark:text-white/40 text-gray-400">{msg.email}</span>}
                  </div>
                  <p className="text-sm dark:text-white/60 text-gray-500 truncate">{msg.subject}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs dark:text-white/30 text-gray-400 hidden sm:block">{formatDate(msg.createdAt)}</span>
                  {expanded === msg.id ? <ChevronUp size={14} className="dark:text-white/40 text-gray-400" /> : <ChevronDown size={14} className="dark:text-white/40 text-gray-400" />}
                </div>
              </div>

              {expanded === msg.id && (
                <div className="border-t dark:border-white/10 border-gray-200 p-4 space-y-3">
                  <p className="text-sm dark:text-white/80 text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <NeonButton variant="ghost" size="sm" onClick={() => handleToggleRead(msg.id, msg.read)}>
                      {msg.read ? <><Mail size={12} /> Mark Unread</> : <><MailOpen size={12} /> Mark Read</>}
                    </NeonButton>
                    <NeonButton variant="danger" size="sm" onClick={() => handleDelete(msg.id)}>
                      <Trash2 size={12} />
                      Delete
                    </NeonButton>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

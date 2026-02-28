import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import { checkHealth, sendQuery } from "./api";
import "./App.css";

/* ── helpers ── */
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const createChat = () => ({
  id: genId(),
  title: "New Chat",
  messages: [],
  createdAt: Date.now(),
});

/* ── Persist chats in localStorage ── */
const STORAGE_KEY = "legal_llm_chats";
const loadChats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};
const saveChats = (chats, activeId) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, activeId }));
  } catch { /* ignore */ }
};

export default function App() {
  /* ── state ── */
  const [chats, setChats] = useState(() => {
    const saved = loadChats();
    return saved?.chats?.length ? saved.chats : [createChat()];
  });
  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = loadChats();
    return saved?.activeId || chats[0]?.id;
  });
  const [loading, setLoading] = useState(false);
  const [serverUp, setServerUp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  /* ── persist on change ── */
  useEffect(() => { saveChats(chats, activeChatId); }, [chats, activeChatId]);

  /* ── health-check on mount ── */
  useEffect(() => {
    const ping = () => checkHealth().then(() => setServerUp(true)).catch(() => setServerUp(false));
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ── close sidebar on mobile after action ── */
  const closeSidebarMobile = useCallback(() => {
    if (window.innerWidth <= 768) setSidebarOpen(false);
  }, []);

  /* ── send message ── */
  const handleSend = async (query) => {
    if (!query.trim() || loading) return;

    const userMsg = { role: "user", text: query, time: Date.now() };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0 ? query.slice(0, 40) : c.title,
            }
          : c
      )
    );
    setLoading(true);

    try {
      const data = await sendQuery(query);
      const botMsg = {
        role: "bot",
        text: data.response || data.detail || "No response.",
        time: Date.now(),
        timeSec: data.time_sec || null,
      };
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, messages: [...c.messages, botMsg] } : c
        )
      );
    } catch (err) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, { role: "bot", text: `Error: ${err.message}`, time: Date.now() }] }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── chat management ── */
  const newChat = () => {
    const chat = createChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    closeSidebarMobile();
  };

  const switchChat = (id) => {
    setActiveChatId(id);
    closeSidebarMobile();
  };

  const deleteChat = (id) => {
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (updated.length === 0) {
        const fresh = createChat();
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (activeChatId === id) setActiveChatId(updated[0].id);
      return updated;
    });
  };

  const clearAllChats = () => {
    const fresh = createChat();
    setChats([fresh]);
    setActiveChatId(fresh.id);
  };

  return (
    <div className="app">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        serverUp={serverUp}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={newChat}
        onSwitchChat={switchChat}
        onDeleteChat={deleteChat}
        onClearAll={clearAllChats}
        onPrompt={(q) => { handleSend(q); closeSidebarMobile(); }}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatArea
        messages={messages}
        loading={loading}
        onSend={handleSend}
        onPrompt={handleSend}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
    </div>
  );
}

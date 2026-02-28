import React, { useState } from "react";

const QUICK_PROMPTS = [
  { label: "IPC Section 302",     query: "What is Section 302 of IPC?" },
  { label: "Fundamental Rights",  query: "What are the fundamental rights under the Indian Constitution?" },
  { label: "Bail under CrPC",     query: "Explain bail provisions under CrPC" },
  { label: "Article 21",          query: "What is Article 21 of the Indian Constitution?" },
  { label: "RTI Act 2005",        query: "Explain the Right to Information Act 2005" },
  { label: "Dowry Prohibition",   query: "Explain the Dowry Prohibition Act" },
];

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Sidebar({
  isOpen,
  serverUp,
  chats,
  activeChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onClearAll,
  onPrompt,
  onClose,
}) {
  const [showPrompts, setShowPrompts] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  const chatHistory = chats.filter((c) => c.messages.length > 0);

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Legal LLM</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Chat
      </button>

      {/* Chat History */}
      <div className="sidebar-section chat-history-section">
        <h3>
          Chat History
          {chatHistory.length > 0 && <span className="chat-count">{chatHistory.length}</span>}
        </h3>
        <div className="chat-list">
          {chatHistory.length === 0 ? (
            <p className="empty-state">No conversations yet</p>
          ) : (
            chatHistory.map((c) => (
              <div
                key={c.id}
                className={`chat-item ${c.id === activeChatId ? "active" : ""}`}
                onClick={() => onSwitchChat(c.id)}
              >
                <div className="chat-item-content">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  <span className="chat-item-title">{c.title}</span>
                </div>
                <div className="chat-item-meta">
                  <span className="chat-item-time">{timeAgo(c.createdAt)}</span>
                  <button
                    className="chat-delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }}
                    title="Delete chat"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {chatHistory.length > 1 && (
          <button
            className="clear-all-btn"
            onClick={() => {
              if (confirmClear) { onClearAll(); setConfirmClear(false); }
              else setConfirmClear(true);
            }}
            onBlur={() => setConfirmClear(false)}
          >
            {confirmClear ? "Confirm clear all?" : "Clear all chats"}
          </button>
        )}
      </div>

      {/* Quick Prompts (collapsible) */}
      <div className="sidebar-section">
        <h3
          className="collapsible-header"
          onClick={() => setShowPrompts((v) => !v)}
        >
          Quick Prompts
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`chevron ${showPrompts ? "open" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </h3>
        {showPrompts && (
          <div className="prompts-list">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} className="prompt-btn" onClick={() => onPrompt(p.query)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className={`status-dot ${serverUp ? "online" : "offline"}`} />
        <span>{serverUp ? "Server Online" : "Server Offline"}</span>
        <span className="version-tag">v1.0</span>
      </div>
    </aside>
  );
}

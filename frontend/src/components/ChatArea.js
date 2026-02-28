import React, { useRef, useEffect, useState, useCallback } from "react";

const EXAMPLE_CARDS = [
  { icon: "section",  title: "IPC Section 420",   desc: "Cheating & dishonestly inducing delivery of property", prompt: "What is Section 420 of IPC?" },
  { icon: "article",  title: "Article 14",        desc: "Right to Equality under Indian Constitution",         prompt: "Explain Article 14 of the Indian Constitution" },
  { icon: "fir",      title: "Filing an FIR",     desc: "Process and legal requirements",                      prompt: "What is the process of filing an FIR in India?" },
  { icon: "bail",     title: "Bail Provisions",   desc: "Understanding bail under CrPC",                       prompt: "Explain bail provisions under CrPC" },
  { icon: "rights",   title: "Fundamental Rights", desc: "Part III of the Indian Constitution",                prompt: "What are the fundamental rights under the Indian Constitution?" },
  { icon: "rti",      title: "RTI Act 2005",      desc: "Right to Information",                                prompt: "Explain the Right to Information Act 2005" },
];

const ICONS = {
  section: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  article: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  fir: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  bail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  rights: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  rti: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

/* simple timestamp formatter */
function fmtTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatArea({ messages, loading, onSend, onPrompt, onToggleSidebar }) {
  const [input, setInput] = useState("");
  const [showScroll, setShowScroll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);

  /* auto-scroll on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* show/hide scroll-to-bottom */
  const handleScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScroll(gap > 200);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const submit = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const hasMessages = messages.length > 0;

  return (
    <main className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h1>Indian Legal Assistant</h1>
          <p>Powered by Fine-tuned Phi-3 on Indian Law</p>
        </div>
      </div>

      {/* Messages */}
      <div className="messages" ref={messagesRef} onScroll={handleScroll}>
        {!hasMessages && (
          <div className="welcome">
            <div className="welcome-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2>Ask me about Indian Law</h2>
            <p>I'm trained on Indian Penal Code, Constitution, CrPC, and more. Ask any legal question!</p>
            <div className="example-cards">
              {EXAMPLE_CARDS.map((c, i) => (
                <div key={i} className="card" onClick={() => onPrompt(c.prompt)}>
                  <div className="card-icon">{ICONS[c.icon]}</div>
                  <div>
                    <strong>{c.title}</strong>
                    <span>{c.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role} msg-enter`}>
            {m.role === "bot" && (
              <div className="avatar bot-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            )}
            <div className="bubble-wrapper">
              <div className="bubble">{m.text}</div>
              <div className="msg-meta">
                <span className="msg-time">{fmtTime(m.time)}</span>
                {m.role === "bot" && m.timeSec && (
                  <span className="msg-time">{m.timeSec}s</span>
                )}
                {m.role === "bot" && (
                  <button
                    className={`copy-btn ${copiedIdx === i ? "copied" : ""}`}
                    onClick={() => copyText(m.text, i)}
                    title="Copy response"
                  >
                    {copiedIdx === i ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                    <span>{copiedIdx === i ? "Copied!" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>
            {m.role === "user" && (
              <div className="avatar user-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="message bot msg-enter">
            <div className="avatar bot-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="bubble-wrapper">
              <div className="bubble">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom FAB */}
      {showScroll && (
        <button className="scroll-bottom-btn" onClick={scrollToBottom} aria-label="Scroll to bottom">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* Input */}
      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask a legal question about Indian law..."
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={handleKey}
          />
          <button className="send-btn" onClick={submit} disabled={loading || !input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="disclaimer">
          This AI provides general legal information, not legal advice. Consult a lawyer for specific cases.
        </p>
      </div>
    </main>
  );
}

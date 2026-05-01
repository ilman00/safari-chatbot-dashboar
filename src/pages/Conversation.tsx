import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

interface Customer {
  phone: string;
  name: string | null;
  lastMessage: string;
  lastMessageTime: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();

  const isToday = d.toDateString() === today.toDateString();

  return isToday
    ? formatTime(iso)
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
}

function getInitials(name: string | null, phone: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return phone.slice(-2);
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-amber-500 text-white rounded-br-md"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

        <p
          className={`text-[11px] mt-1 text-right ${
            isUser ? "text-white/70" : "text-gray-400"
          }`}
        >
          {formatTime(msg.created_at)}
        </p>
      </div>
    </div>
  );
}

export default function Conversations() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);
  const [showThread, setShowThread] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin/conversations");
      setCustomers(res.data);
      setFiltered(res.data);
    } catch {
      console.error("Failed to fetch conversations");
    }
  };

  const fetchThread = async (phone: string) => {
    try {
      const res = await api.get(`/admin/conversations/${phone}`);
      setMessages(res.data);
    } catch {
      console.error("Failed to fetch thread");
    }
  };

  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(
      customers.filter(
        (c) =>
          c.phone.includes(q) ||
          c.name?.toLowerCase().includes(q) ||
          c.lastMessage?.toLowerCase().includes(q)
      )
    );
  }, [search, customers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    fetchCustomers();

    const interval = setInterval(() => {
      fetchCustomers();

      if (selected) {
        fetchThread(selected.phone);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [selected]);

  const handleSelect = (customer: Customer) => {
    setSelected(customer);
    fetchThread(customer.phone);
    setShowThread(true);
  };

  const handleBack = () => {
    setShowThread(false);
    setSelected(null);
  };

  const handleSend = async () => {
    if (!sendText.trim() || !selected) return;

    setSending(true);

    try {
      await api.post("/admin/send-message", {
        to: selected.phone,
        message: sendText.trim(),
      });

      setSendText("");

      fetchThread(selected.phone);
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-56px)] md:h-dvh flex bg-white overflow-hidden">
      {/* ───────── CONTACT LIST ───────── */}
      <div
        className={`
          ${
            showThread ? "hidden" : "flex"
          } md:flex flex-col w-full md:w-[320px] lg:w-[360px]
          border-r border-gray-200 bg-white shrink-0
          transition-all duration-300
        `}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-gray-900 font-semibold text-base mb-3">
            Messages
          </h2>

          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.phone}
              onClick={() => handleSelect(c)}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left border-b border-gray-50 hover:bg-gray-50 transition ${
                selected?.phone === c.phone ? "bg-amber-50" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
                  selected?.phone === c.phone
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {getInitials(c.name, c.phone)}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {c.name || c.phone}
                  </span>

                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {formatDate(c.lastMessageTime)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 truncate">
                  {c.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ───────── CHAT AREA ───────── */}
      <div
        className={`
          ${
            showThread ? "flex" : "hidden"
          } md:flex flex-1 flex-col min-w-0 bg-gray-50
          transition-all duration-300
        `}
      >
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
              <button
                onClick={handleBack}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-semibold text-sm">
                {getInitials(selected.name, selected.phone)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {selected.name || selected.phone}
                </p>

                <p className="text-xs text-gray-400 truncate">
                  {selected.phone}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No messages yet
                </div>
              ) : (
                messages.map((msg, i) => <Bubble key={i} msg={msg} />)
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 md:px-4 py-3 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={sendText}
                onChange={(e) => setSendText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message ${
                  selected.name || selected.phone
                }...`}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />

              <button
                onClick={handleSend}
                disabled={sending || !sendText.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-xl transition shrink-0"
              >
                <svg
                  className="w-4 h-4 rotate-90"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                No conversation selected
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Choose a contact to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/auth/authSelectors";
import type { EnquiryMessage, TradeMessage } from "@/types/bidding";

type GenericMessage = EnquiryMessage | TradeMessage;

interface ChatPanelProps {
  title?: string;
  subtitle?: string;
  messages: GenericMessage[];
  onSendMessage: (body: string, attachment?: File) => Promise<void>;
  isSending?: boolean;
}

export default function ChatPanel({
  title = "Chat Room",
  subtitle,
  messages,
  onSendMessage,
  isSending = false,
}: ChatPanelProps) {
  const user = useAppSelector(selectUser);
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() && !file) return;
    await onSendMessage(inputText, file || undefined);
    setInputText("");
    setFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-gray">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary-fixed font-bold">
            <span className="material-symbols-outlined">forum</span>
          </div>
          <div>
            <h3 className="font-headline-md text-body-lg font-bold text-ameefar-navy">{title}</h3>
            {subtitle && (
              <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-gray/50 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.sender_role === user?.role || msg.sender_name === user?.full_name;
          const initials = msg.sender_name.substring(0, 2).toUpperCase();
          const timeString = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  isMe ? 'bg-ameefar-navy text-white' : 'bg-primary-container text-white'
                }`}
              >
                {isMe ? 'YOU' : initials}
              </div>
              <div className="space-y-1">
                <div
                  className={`p-4 rounded-xl shadow-sm ${
                    isMe
                      ? 'bg-ameefar-navy text-white rounded-tr-none'
                      : 'bg-white border border-border-subtle text-on-surface rounded-tl-none'
                  }`}
                >
                  <p className="text-body-md whitespace-pre-wrap">{msg.body}</p>
                  
                  {msg.attachment_url && (
                    <div
                      className={`mt-3 p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all border ${
                        isMe ? 'bg-white/10 border-white/20 hover:border-white' : 'bg-surface-gray border-border-subtle hover:border-primary'
                      }`}
                      onClick={() => window.open(msg.attachment_url || '', '_blank')}
                    >
                      <span className="material-symbols-outlined">description</span>
                      <div className="flex-1 overflow-hidden">
                        <p className={`text-body-sm font-bold truncate ${isMe ? 'text-white' : 'text-ameefar-navy'}`}>
                          {msg.attachment_name || 'Attachment'}
                        </p>
                      </div>
                      <span className="material-symbols-outlined">download</span>
                    </div>
                  )}
                </div>
                <p className={`text-[11px] font-label-md ${isMe ? 'text-right mr-1 text-outline' : 'ml-1 text-outline'}`}>
                  {timeString} {('is_internal' in msg && msg.is_internal) ? '(Internal)' : ''}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-outline-variant italic">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-border-subtle">
        {file && (
          <div className="mb-3 flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-md inline-flex border border-border-subtle">
            <span className="material-symbols-outlined text-[16px] text-outline">attach_file</span>
            <span className="text-label-md text-on-surface">{file.name}</span>
            <button onClick={() => setFile(null)} className="ml-2 hover:text-error">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
        <div className="flex items-end gap-3 bg-surface-gray rounded-xl p-2 border border-border-subtle focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 transition-all">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="hidden" 
          />
          <button 
            className="p-2 text-outline-variant hover:text-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 text-body-md py-2 px-1 resize-none overflow-hidden max-h-[150px]"
            placeholder="Type your message..."
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button
            onClick={handleSend}
            disabled={isSending || (!inputText.trim() && !file)}
            className="h-10 w-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-container transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined font-variation-fill">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

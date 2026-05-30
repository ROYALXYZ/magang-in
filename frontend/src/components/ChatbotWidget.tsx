import { useState, useRef, useEffect } from 'react';
import styles from './ChatbotWidget.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  text: 'Halo! 👋 Saya asisten Magang-in. ada yang bisa saya bantu? Kamu bisa tanya seputar cara melamar, tips magang, atau navigasi platform.',
  sender: 'bot',
  timestamp: new Date(),
};

// Dummy bot responses (nanti bisa diganti dengan API call)
function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('lamar') || msg.includes('apply')) {
    return 'Untuk melamar magang:\n1. Buka halaman Lowongan\n2. Pilih lowongan yang kamu minati\n3. Klik "Lamar Sekarang"\n4. Upload CV (PDF, max 5MB) dan tulis cover letter\n5. Klik "Kirim Lamaran"\n\nPastikan profil dan skill kamu sudah lengkap ya!';
  }
  if (msg.includes('skill') || msg.includes('keahlian')) {
    return 'Kamu bisa menambah skill dengan 2 cara:\n1. Self-declare — pilih manual dari daftar skill\n2. Upload CV — AI akan mengekstrak skill dari CV kamu secara otomatis\n\nAkses dari menu Onboarding atau halaman Profil.';
  }
  if (msg.includes('cv') || msg.includes('resume')) {
    return 'Untuk upload CV:\n- Format: PDF saja\n- Ukuran max: 5MB\n- AI akan menganalisis dan mengekstrak skill dari CV kamu\n\nKamu bisa upload di halaman Onboarding atau saat melamar lowongan.';
  }
  if (msg.includes('rekomendasi') || msg.includes('matching') || msg.includes('cocok')) {
    return 'Fitur AI Matching akan mencocokkan skill kamu dengan lowongan yang tersedia. Semakin lengkap skill yang kamu deklarasikan, semakin akurat rekomendasinya!\n\nAkses dari Dashboard → Rekomendasi AI.';
  }
  if (msg.includes('profil') || msg.includes('profile')) {
    return 'Di halaman Profil kamu bisa:\n- Edit nama, email, telepon, alamat\n- Update pendidikan dan institusi\n- Lihat dan kelola skill\n\nAkses dari Dashboard → menu Profil.';
  }
  if (msg.includes('status') || msg.includes('lamaran')) {
    return 'Kamu bisa cek status lamaran di halaman Dashboard. Status yang mungkin:\n- 🟡 Pending — sedang ditinjau\n- 🟢 Accepted — diterima!\n- 🔴 Rejected — belum beruntung\n\nJangan menyerah, terus coba ya!';
  }
  if (msg.includes('halo') || msg.includes('hai') || msg.includes('hi') || msg.includes('hello')) {
    return 'Hai juga! 😊 Ada yang bisa saya bantu hari ini?';
  }
  if (msg.includes('terima kasih') || msg.includes('thanks') || msg.includes('makasih')) {
    return 'Sama-sama! Semoga sukses dengan pencarian magangnya. Jangan ragu tanya lagi kalau butuh bantuan! 🚀';
  }

  return 'Hmm, saya belum bisa menjawab pertanyaan itu. Coba tanya tentang:\n- Cara melamar magang\n- Upload CV\n- Skill & rekomendasi AI\n- Status lamaran\n- Profil\n\nAtau hubungi tim support kami untuk bantuan lebih lanjut.';
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input saat popup dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // Tambah pesan user
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulasi delay bot response (biar natural)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <div className={styles.popup}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.botAvatar}>
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1H5a2 2 0 0 1-2-2v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                  <circle cx="9" cy="13" r="1" fill="white"/>
                  <circle cx="15" cy="13" r="1" fill="white"/>
                </svg>
              </div>
              <div>
                <span className={styles.headerTitle}>Magang-in Assistant</span>
                <span className={styles.headerStatus}>Online</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Tutup chat">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id} className={msg.sender === 'user' ? styles.userBubbleWrap : styles.botBubbleWrap}>
                {msg.sender === 'bot' && (
                  <div className={styles.bubbleAvatar}>🤖</div>
                )}
                <div className={msg.sender === 'user' ? styles.userBubble : styles.botBubble}>
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={styles.botBubbleWrap}>
                <div className={styles.bubbleAvatar}>🤖</div>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Ketik pesan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()} aria-label="Kirim pesan">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>
    </>
  );
}

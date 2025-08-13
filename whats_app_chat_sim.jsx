import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, ChevronLeft, MoreVertical } from "lucide-react";

// === WhatsApp Chat Simulator (Box / Autoplay on View) ===
// Uso principal:
// <WhatsAppChatSim
//    scriptUrl="/path/para/script.json" // opcional (array [{from:"me|them", text:"...", typingMs:1200}])
//    speed={1}
//    once
// />
// - Autoplay quando o componente ficar visível no viewport (IntersectionObserver)
// - Sem caixa de texto e sem controles — apenas animação
// - Fundo transparente para encaixar dentro da "tela" do mockup do celular
// - Se scriptUrl não for informado, usa um roteiro padrão (demo)

export default function WhatsAppChatSim({ script: externalScript, scriptUrl, speed = 1, once = true, visibilityThreshold = 0.5 }) {
  // Tema (mantém look WhatsApp, com fundo transparente ao redor)
  const theme = {
    headerBg: "#075E54",
    headerFg: "#E6FFFA",
    chatBg: "transparent",
    bubbleMe: "#DCF8C6",
    bubbleThem: "#FFFFFF",
    ticks: "#34B7F1",
  };

  // Script padrão (caso não venha de fora)
  const defaultScript = useMemo(
    () => [
      { from: "them", text: "Oi! Vi seu trabalho com o Agente Guia 👀", typingMs: 1200 },
      { from: "them", text: "Você consegue automatizar o atendimento do meu WhatsApp?", typingMs: 1500 },
      { from: "me", text: "Consigo sim. Montamos um fluxo com IA + integrações. Quer ver um exemplo?", typingMs: 900 },
      { from: "them", text: "Quero muito! Como funciona o disparo inicial?", typingMs: 1100 },
      { from: "me", text: "Abertura com menu, coleta de dados e qualificação. Tudo com tom humano.", typingMs: 1200 },
      { from: "me", text: "Te mando uma demo interativa ainda hoje.", typingMs: 900 },
      { from: "them", text: "Perfeito. Qual investimento inicial?", typingMs: 1000 },
      { from: "me", text: "Planos a partir de R$ 497/mês + setup único. Fechamos?", typingMs: 1100 },
      { from: "them", text: "Fechamos! Me envia o contrato.", typingMs: 800 },
    ],
    []
  );

  const [script, setScript] = useState(externalScript || defaultScript);
  const [displayed, setDisplayed] = useState([]);
  const [idx, setIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [running, setRunning] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [startClock] = useState(() => new Date());
  const wrapperRef = useRef(null);
  const scrollRef = useRef(null);

  // Carrega script externo quando visível (se houver URL)
  useEffect(() => {
    if (!scriptUrl) return;
    let cancel = false;
    // Aguardar visibilidade para fetch (economiza)
    const target = wrapperRef.current;
    if (!target) return;

    const io = new IntersectionObserver(async (entries) => {
      const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= visibilityThreshold);
      if (visible) {
        try {
          const res = await fetch(scriptUrl, { cache: "no-store" });
          if (!res.ok) throw new Error("Falha ao carregar script");
          const data = await res.json();
          if (!cancel && Array.isArray(data) && data.length) setScript(data);
        } catch (e) {
          // mantém default
          console.warn(e);
        } finally {
          io.disconnect();
        }
      }
    }, { threshold: [0, visibilityThreshold, 1] });

    io.observe(target);
    return () => { cancel = true; io.disconnect(); };
  }, [scriptUrl, visibilityThreshold]);

  // Inicia reprodução quando visível
  useEffect(() => {
    const target = wrapperRef.current;
    if (!target) return;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= visibilityThreshold);
      if (visible) {
        if (once && hasPlayed) return;
        setRunning(true);
      } else if (!once) {
        // se não for "once", pausa quando sai da tela
        setRunning(false);
      }
    }, { threshold: [0, visibilityThreshold, 1] });

    io.observe(target);
    return () => io.disconnect();
  }, [once, hasPlayed, visibilityThreshold]);

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [displayed, isTyping]);

  // Animação de digitação e envio
  useEffect(() => {
    if (!running) return;
    if (idx >= script.length) {
      setRunning(false);
      setHasPlayed(true);
      return;
    }
    const next = script[idx];
    setIsTyping(true);
    const typingTime = Math.max(400, next.typingMs || 1000) / (speed || 1);
    const t = setTimeout(() => {
      setIsTyping(false);
      const minutesPassed = Math.min(59, Math.floor((Date.now() - startClock.getTime()) / 60000));
      const ts = new Date(startClock.getTime() + minutesPassed * 60000);
      const timeLabel = ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setDisplayed((prev) => [
        ...prev,
        { id: `${Date.now()}-${idx}`,
          ...next,
          time: timeLabel,
          status: next.from === "me" ? "sent" : undefined,
        },
      ]);
      setIdx((v) => v + 1);
    }, typingTime);
    return () => clearTimeout(t);
  }, [running, idx, script, speed, startClock]);

  // Atualiza ticks para "lido"
  useEffect(() => {
    if (!displayed.length) return;
    const t = setTimeout(() => {
      setDisplayed((prev) => prev.map((m) => (m.from === "me" && !m.statusUpdated ? { ...m, status: "read", statusUpdated: true } : m)));
    }, 1200 / (speed || 1));
    return () => clearTimeout(t);
  }, [displayed, speed]);

  // Reset automático quando sair e voltar (se once = false)
  useEffect(() => {
    if (once) return; // não resetar
    if (!running && idx >= script.length) {
      // terminou enquanto não visível; prepara para repetir
      const t = setTimeout(() => {
        setDisplayed([]); setIdx(0); setIsTyping(false);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [running, idx, script.length, once]);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <div className="w-full h-full flex flex-col rounded-[28px] overflow-hidden" style={{ background: "transparent" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: theme.headerBg, color: theme.headerFg }}>
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 opacity-90" />
            <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center">
              <span className="text-sm font-semibold">G</span>
            </div>
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-sm font-semibold">Agente Guia</div>
            <div className="text-xs opacity-80">online agora</div>
          </div>
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 opacity-90" />
            <Phone className="w-5 h-5 opacity-90" />
            <MoreVertical className="w-5 h-5 opacity-90" />
          </div>
        </div>

        {/* Chat */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3" style={{ background: theme.chatBg }}>
          <div className="flex justify-center my-2">
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 text-white/80">Hoje</span>
          </div>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {displayed.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, translateY: 8, scale: 0.98 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className={`w-full flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-md ${m.from === "me" ? "rounded-tr-md" : "rounded-tl-md"}`}
                    style={{ background: m.from === "me" ? theme.bubbleMe : theme.bubbleThem }}
                  >
                    <div className="whitespace-pre-wrap leading-snug text-[13.5px] text-black/90">{m.text}</div>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <span className="text-[10px] opacity-70 text-black/70">{m.time}</span>
                      {m.from === "me" && (
                        <span className="ml-1 inline-flex -space-x-1">
                          <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden>
                            <path d="M5.5 8.5L2.5 5.5L1 7l4.5 4 6-8-1.5-1-4.5 6.5z" fill={m.status === "read" ? theme.ticks : "#9aa2a6"} />
                            <path d="M9.5 8.5L6.5 5.5 5 7l4.5 4 6-8-1.5-1-4.5 6.5z" fill={m.status === "read" ? theme.ticks : "#9aa2a6"} />
                          </svg>
                        </span>
                      )}
                    </div>
                    {/* cauda */}
                    <span className={`absolute top-0 ${m.from === "me" ? "right-0 translate-x-1" : "left-0 -translate-x-1"} w-3 h-3 overflow-hidden`}>
                      <span className={`absolute w-3 h-3 rotate-45 top-1 ${m.from === "me" ? "right-1" : "left-1"}`} style={{ background: m.from === "me" ? theme.bubbleMe : theme.bubbleThem }} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Indicador de digitando */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, translateY: 8, scale: 0.98 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className="w-full flex justify-start"
                >
                  <div className="max-w-[60%] rounded-2xl rounded-tl-md px-3 py-2 bg-white shadow-md">
                    <div className="flex items-end gap-1">
                      <Dots />
                      <span className="text-[10px] text-black/60 ml-auto">digitando…</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-black/40"
          animate={{ opacity: [0.2, 1, 0.2], translateY: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

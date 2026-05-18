import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAI } from '../../context/AIContext';
import { fetchOpenRouterChat } from '../../lib/ai/openrouter';
import { Send, Loader2, Sparkles, User, Bot, Crown, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../../components/GlassCard';
import { useMemoryLite } from '../../hooks/useMemoryLite';

export default function RoomieChat() {
  const { role, profile } = useAuth();
  const { activeModel, temperature } = useAI();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visionImage, setVisionImage] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const { memory } = useMemoryLite(role);

  const isClient = role === 'client';
  const firstName = profile?.full_name?.split(' ')[0] || 'Roomie';

  // Dual Persona System Prompts
  const systemPromptClient = `Eres Roomie, "Luxury Beauty Companion" emocional, elegante y cálido. Inspiras y acompañas en belleza, skincare, wellness (Daily Glow) y lifestyle.
REGLAS VITALES:
- Usa respuestas CORTAS, fluidas y muy concisas. Jamás des listas enormes estilo bot.
- Tono: Minimalista, femenino, empático, aspiracional (Headspace / Glossier vibe). Eres su confidente y stylist de lujo.
- Inspira a la acción sutilmente. Jamás debes revelar que eres código o IA, mantén el aura mágica.
El nombre de la usuaria es ${firstName}. Preferencias implícitas: ${JSON.stringify(memory)}.`;

  const systemPromptSalon = `Eres Roomie, "Luxury Business Partner" para directores de salones premium.
REGLAS VITALES:
- Ayudas a crear naming elegantes, copy persuasivo, bundles y estrategias de upselling suave.
- Respuestas CORTAS y asertivas. Sin biblias. Usa viñetas estéticas si es estrictamente necesario.
- Tono: Calmado, consultivo, profesionalismo luxury.
El nombre de la jefa del salón es ${firstName}. Datos de su salón: ${JSON.stringify(memory)}.`;

  useEffect(() => {
    // Initial greeting
    setMessages([
      { role: 'assistant', content: isClient 
        ? `Hola ${firstName}. Estoy aquí para guiarte en tu rutina de skincare, recomendarte looks y acompañarte en tu wellness journey. ¿En qué nos enfocamos hoy?` 
        : `Hola ${firstName}. Lista para optimizar tu salón. ¿Qué idea refinaremos hoy? ¿Nuevos bundles exquisitos, redacción de servicios, o estrategias de precio?` 
      }
    ]);
  }, [role, firstName, isClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("La imagen debe ser menor a 5MB.");
    
    // Lectura simple de archios a base64 para mandar a OpenRouter Vision Payload
    const reader = new FileReader();
    reader.onload = (event) => setVisionImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const clientSuggestions = [
    "Brunch aesthetic (Outfit)",
    "Soft luxury office",
    "Cena elegante"
  ];
  
  const salonSuggestions = [
    "Redactar descripción premium",
    "Ideas para promos de temporada",
    "Estrategia de upselling amable"
  ];

  const suggestions = isClient ? clientSuggestions : salonSuggestions;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !visionImage) return;

    const userMessageContent = visionImage 
         ? [
            { type: "text", text: input || "Mira esto." },
            { type: "image_url", image_url: { url: visionImage } }
           ]
         : input;

    const uiMessage = { role: 'user', content: input, image: visionImage };
    setMessages(prev => [...prev, uiMessage]);
    setInput('');
    setVisionImage(null);
    setLoading(true);

    const apiMessages = [
      { role: 'system', content: isClient ? systemPromptClient : systemPromptSalon },
      ...messages.map(m => ({
        role: m.role,
        content: m.image 
          ? [ { type: "text", text: m.content || "Mira esto." }, { type: "image_url", image_url: { url: m.image } } ]
          : m.content
      })),
      { role: 'user', content: userMessageContent }
    ];

    const response = await fetchOpenRouterChat(apiMessages, {
      model: activeModel,
      temperature
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col animate-fade-in pb-10 md:pb-0" data-testid="roomie-chat">
      <header className="mb-4">
         <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-1">
            {isClient ? "Beauty Companion" : "Business Intelligence"}
         </p>
         <h1 className="font-display font-extrabold text-3xl text-violet-900 flex items-center gap-2">
            Roomie Concierge <Crown className="text-magenta-500" strokeWidth={2.5} size={22}/>
         </h1>
      </header>

      <GlassCard className="flex-1 flex flex-col overflow-hidden !px-0 !py-0 shadow-soft border-violet-100/50 bg-white/40">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${isUser ? 'bg-gradient-to-br from-violet-500 to-sky-400 text-white' : 'bg-white text-magenta-500 ring-1 ring-magenta-500/20'}`}>
                  {isUser ? <User size={16}/> : <Bot size={16}/>}
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-gradient-to-br from-violet-500 to-magenta-500 text-white rounded-tr-sm shadow-md' : 'bg-white/90 dark:bg-gray-800 text-violet-900 dark:text-gray-100 rounded-tl-sm shadow-sm border border-violet-100/50'}`}>
                  {msg.image && (
                     <div className="mb-2 relative">
                       <img src={msg.image} alt="Vision" className="w-[180px] h-[180px] object-cover rounded-xl shadow-sm border border-white/20"/>
                     </div>
                  )}
                  {msg.content}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-white text-magenta-500 flex items-center justify-center flex-shrink-0 mt-1 ring-1 ring-magenta-500/20 shadow-sm animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-white/80 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-violet-50/50 flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin text-magenta-500" />
                 <span className="text-sm font-medium text-violet-400 italic">Analizando tu petición...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 2 && !loading && (
          <div className="flex flex-wrap items-center gap-2 max-w-4xl mx-auto px-4 mb-2 animate-fade-in">
             {suggestions.map((s, idx) => (
                <button
                   key={idx}
                   onClick={() => setInput(s)}
                   className="text-xs font-semibold text-violet-600 bg-violet-50/80 hover:bg-white border border-violet-100 hover:border-magenta-300 px-3 py-1.5 rounded-full shadow-sm transition-all"
                >
                   {s}
                </button>
             ))}
          </div>
        )}

        <div className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-violet-100/50 flex flex-col">
          {visionImage && (
             <div className="relative mb-3 w-16 h-16 max-w-4xl mx-auto w-full animate-fade-in self-start left-4">
                <img src={visionImage} className="object-cover w-full h-full rounded-xl shadow-md border-2 border-magenta-500" alt="Preview"/>
                <button type="button" onClick={() => setVisionImage(null)} className="absolute -top-2 -right-2 bg-white text-magenta-500 rounded-full shadow-sm ring-1 ring-violet-100"><X size={14}/></button>
             </div>
          )}
          <form className="relative flex items-center max-w-4xl mx-auto w-full" onSubmit={handleSend}>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
             <button 
               type="button"
               onClick={handleImageClick}
               className="absolute left-2 p-2.5 text-violet-400 hover:text-magenta-500 transition-colors"
               title="Subir foto de referencia (Vision)"
             >
               <Camera size={20} strokeWidth={1.5} />
             </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={(isClient ? "¿Qué rutina de skincare debería probar si vivo en un clima húmedo?" : "¿Me ayudas a nombrar mi nueva técnica premium de balayage?")}
              className="w-full bg-white dark:bg-gray-800 rounded-full pl-12 pr-14 py-3.5 text-sm md:text-base outline-none ring-1 ring-violet-100 focus:ring-2 focus:ring-magenta-500/60 shadow-inner text-violet-900 dark:text-white placeholder-violet-300 transition-all font-medium"
              disabled={loading}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={loading || (!input.trim() && !visionImage)}
              className="absolute right-1.5 p-2.5 bg-gradient-to-br from-magenta-500 to-violet-500 text-white rounded-full shadow-glow disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-all"
            >
              <Send size={16} className={loading ? 'opacity-0' : ''} />
              {loading && <Loader2 size={16} className="absolute inset-x-0 inset-y-0 m-auto animate-spin" />}
            </button>
          </form>
          <div className="text-center mt-2.5">
            <p className="text-[10px] text-violet-400/80 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
               <Sparkles size={10} className="text-magenta-500/70" /> Modelo Activo: {activeModel.split('/').pop()}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

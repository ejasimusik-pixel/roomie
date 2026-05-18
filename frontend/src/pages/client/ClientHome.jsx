import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, Droplets, Sun, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import GlassCard from "../../components/GlassCard";

export default function ClientHome() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] || "Roomie";

  // Mock de "Daily Glow" & Rituals
  const todayRitual = {
    title: "Quiet Luxury Prep ✨",
    description: "Una rutina enfocada en máxima hidratación, brillo espejo y preparación de outfit para un día de fluidez elegante.",
    time: "15 min",
  };

  const beautyStats = [
    { label: "Hidratación", value: "Óptima", icon: Droplets, color: "text-sky-400" },
    { label: "Brillo Capilar", value: "Espejo", icon: Sun, color: "text-amber-400" },
    { label: "Consistency Streak", value: "4 días", icon: Star, color: "text-magenta-500" }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10" data-testid="client-home">
      <header className="space-y-2 mt-4 text-center md:text-left">
        <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">
          {new Date().toLocaleDateString("es", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="font-display font-extrabold text-4xl text-violet-900 tracking-tight break-words">
          Hola, {firstName}.
        </h1>
        <p className="text-violet-500 font-medium">Bienvenida a tu Glow Journey.</p>
      </header>

      {/* Today's Ritual (Emotional Hook) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-magenta-500" size={20} />
          <h2 className="font-display font-bold text-xl text-violet-900">
            Today's Ritual
          </h2>
        </div>
        
        <GlassCard testId="client-daily-ritual" className="relative overflow-hidden bg-gradient-to-br from-violet-50/80 to-white/60 !border-0 shadow-[0_8px_30px_rgb(200,60,180,0.06)] group p-6 md:p-8 cursor-pointer hover:shadow-[0_8px_40px_rgb(200,60,180,0.12)] transition-all" onClick={() => navigate('/app/concierge')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-magenta-500/20 to-transparent rounded-bl-full pointer-events-none" />
          
          <p className="text-xs uppercase tracking-[0.2em] text-violet-400 font-bold mb-2">
            Paso guiado por Roomie
          </p>
          <h3 className="font-display font-bold text-3xl text-violet-900 mb-3 group-hover:text-magenta-600 transition-colors">
            {todayRitual.title}
          </h3>
          <p className="text-violet-600/90 text-sm md:text-base max-w-lg mb-6 leading-relaxed">
            {todayRitual.description}
          </p>
          <button className="text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-magenta-500 px-5 py-2.5 rounded-full shadow-glow">
            Comenzar ({todayRitual.time})
          </button>
        </GlassCard>
      </section>

      {/* Beauty Score / Energy (Soft Tracking) */}
      <section>
        <h2 className="font-display font-bold text-xl text-violet-900 mb-4 px-1">
          Tu Beauty Energy
        </h2>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {beautyStats.map((stat, i) => (
             <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl p-4 text-center border border-violet-50/50 shadow-soft flex flex-col items-center justify-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm mb-3 ${stat.color}`}>
                   <stat.icon size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">{stat.label}</p>
                <p className="font-display font-bold text-lg text-violet-900">{stat.value}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Outfit & Multimodal Integration Teaser in Hub */}
      <section>
        <h2 className="font-display font-bold text-xl text-violet-900 mb-4 px-1 mt-6">
          Concierge Options
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <GlassCard className="hover:scale-[1.02] cursor-pointer transition-transform" onClick={() => navigate('/app/concierge')}>
             <p className="font-display font-bold text-lg text-violet-900 mb-1">Outfit Assistant 👗</p>
             <p className="text-sm text-violet-500">Deja que Roomie estilice tu evento de hoy ("Brunch aesthetic").</p>
          </GlassCard>
          <GlassCard className="hover:scale-[1.02] cursor-pointer transition-transform" onClick={() => navigate('/app/concierge')}>
             <p className="font-display font-bold text-lg text-violet-900 mb-1">Tu Salón de Lujo 🥂</p>
             <p className="text-sm text-violet-500">Contactar velozmente a ColorRoom para tu mantenimiento.</p>
          </GlassCard>
        </div>
      </section>

      {/* PWA / App Install Soft CTA */}
      <section className="bg-gradient-to-r from-violet-100/50 to-magenta-50/50 rounded-2xl p-4 text-center border border-white mt-8 mb-6 hover:shadow-soft transition-all">
         <p className="font-display text-sm font-extrabold text-violet-900 tracking-wide">Mantén tu Glow Roomie cerca ✨</p>
         <p className="text-xs text-violet-500 font-medium leading-relaxed mt-1">Abre el menú de opciones tu navegador celular y toca "Añadir a inicio" para instalar la aplicación nativa y disfrutar la experiencia completa.</p>
      </section>
    </div>
  );
}

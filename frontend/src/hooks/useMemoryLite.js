import { useState, useEffect } from "react";

export function useMemoryLite(role) {
  const [memory, setMemory] = useState({});

  useEffect(() => {
    // Load local storage memory context based on active role (for Demo simulation)
    const key = `roomie_memory_${role}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      setMemory(JSON.parse(data));
    } else {
      // Default dummy context for the demo
      if (role === 'client') {
        const dummy = {
          tipo_cabello: "Fino y procesado",
          preocupacion_principal: "Puntas secas y algo de frizz húmedo",
          salon_favorito: "ColorRoom",
          estilo_deseado: "Old Money / Quiet Luxury"
        };
        setMemory(dummy);
        localStorage.setItem(key, JSON.stringify(dummy));
      } else {
        const dummy = {
          nombre_salon: "ColorRoom",
          especialidad: "Colorimetría y Balayage Premium",
          vibra_de_marca: "Luxury Minimalist",
          objetivo_actual: "Aumentar el ticket promedio con upselling"
        };
        setMemory(dummy);
        localStorage.setItem(key, JSON.stringify(dummy));
      }
    }
  }, [role]);

  const updateMemory = (newPrefs) => {
    const updated = { ...memory, ...newPrefs };
    setMemory(updated);
    localStorage.setItem(`roomie_memory_${role}`, JSON.stringify(updated));
  };

  return { memory, updateMemory };
}

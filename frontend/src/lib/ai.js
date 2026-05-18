/**
 * ROOMIE — AI scaffolding (mock implementations for Demo-Ready P0)
 * ----------------------------------------------------------------------------
 * Vendor-agnostic by design. 
 */

export async function extractProductFromImage(_file) {
  // Fake realistic extraction delay
  await new Promise(r => setTimeout(r, 2000));
  
  return { 
    data: {
      name: "Olaplex No. 4 Bond Maintenance",
      brand: "Olaplex",
      category: "Cabello",
      description: "Shampoo reparador altamente concentrado que hidrata y suaviza intensamente.",
      price_cents: 120000, // $1,200.00
      currency: "MXN",
      recommended_for: ["Seco", "Teñido", "Dañado"]
    },
    mocked: true, 
    hint: "Simulated response for demonstration purposes." 
  };
}

export async function extractProductFromUrl(_url) {
  await new Promise(r => setTimeout(r, 2000));
  return { data: null, mocked: true, hint: "URL extraction not yet simulated." };
}

export async function suggestServicesForSalon(_salon, _existingServices) {
  await new Promise(r => setTimeout(r, 1500));
  
  return {
    suggestions: [
      {
        category: "Cabello",
        name: "Gloss Hidratante Rápido",
        rationale: "Tus clientas suelen agendar color. Ofrecer un Gloss como mantenimiento entre sesiones aumentará la retención.",
        est_price: "$1,200"
      },
      {
        category: "Spa",
        name: "Masaje Capilar Express",
        rationale: "Ideal para up-sell durante el tiempo de lavado final. Cero costo de producto extra y 100% ganancia.",
        est_price: "$350"
      }
    ],
    mocked: true
  };
}

export async function composeRoomieReply(_salon, _context) {
  return { data: null, mocked: true, reply: null };
}

export const AI_READY = true;

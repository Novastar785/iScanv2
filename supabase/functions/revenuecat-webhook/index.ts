import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- ⚙️ CONFIGURACIÓN DE TUS PLANES (El cerebro de los créditos) ---
// CLAVE (Izquierda): El "Identifier" exacto que pusiste en RevenueCat / App Store.
// VALOR (Derecha): La cantidad de créditos a otorgar.

const CREDIT_MAP = {
  // SUSCRIPCIONES (Recurrentes - "Use it or lose it")
  "aura_premium:auraweeklypremium": 150,   // Semanal
  "aura_premium:auramonthlypremium": 700,  // Mensual
  "aurayearlypremium": 10000, // Antes: aura_yearly_premium

  // Si usaste guiones medios en Google, descomenta y usa estos:
  // "aura-weekly-premium": 150,
  // "aura-monthly-premium": 700,

  // PACKS (Pago único - Se suman)
  // Estos suelen ser "In-App Products", Google suele ser más flexible aquí,
  // pero por consistencia revisa si también necesitas cambiarlos.
  "aurapack50": 50,    
  "aurapack100": 100, 
  "aurapack500": 500   
};

serve(async (req) => {
  try {
    // 1. Verificar seguridad (Token secreto en la URL)
    // URL esperada: .../revenuecat-webhook?secret=MI_SECRETO_AURA_123
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    // ¡CAMBIA ESTO POR TU SECRETO REAL!
    if (secret !== "MI_SECRETO_AURA_123") { 
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Inicializar Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const event = body.event;
    
    if (!event) return new Response("No event data", { status: 400 });

    const type = event.type;
    const appUserId = event.app_user_id;
    const productId = event.product_id;
    
    console.log(`🔔 Evento recibido: ${type} para ${appUserId} (${productId})`);

    // 3. Lógica de Negocio

    // --- CASO A: SUSCRIPCIONES (Renovación o Compra Inicial) ---
    // Si el producto está en el mapa y es un evento de renovación/compra/cambio
    if (type === "INITIAL_PURCHASE" || type === "RENEWAL" || type === "PRODUCT_CHANGE") {
      
      const creditsToGive = CREDIT_MAP[productId as keyof typeof CREDIT_MAP];
      
      // Verificamos si es una suscripción (por convención de nombre o lista explícita)
      // Asumimos que todo lo que no sea "pack" es suscripción en este mapa simple
      if (creditsToGive && !productId.includes("pack")) {
        console.log(`💎 Reseteando créditos de suscripción a: ${creditsToGive}`);
        
        // UPSERT: Sobrescribe subscription_credits (Use it or lose it)
        const { error } = await supabaseAdmin
          .from("user_credits")
          .upsert({ 
            user_id: appUserId, 
            subscription_credits: creditsToGive, 
            updated_at: new Date()
          }, { onConflict: 'user_id' });
          
        if (error) {
            console.error("Error DB:", error);
            throw error;
        }
      }
      // Si por alguna razón un pack llega como INITIAL_PURCHASE (a veces pasa en sandbox)
      else if (creditsToGive && productId.includes("pack")) {
         await addPackCredits(supabaseAdmin, appUserId, creditsToGive);
      }
    }

    // --- CASO B: PACKS (Compras no recurrentes) ---
    if (type === "NON_RENEWING_PURCHASE") {
      const creditsToGive = CREDIT_MAP[productId as keyof typeof CREDIT_MAP];
      if (creditsToGive) {
        await addPackCredits(supabaseAdmin, appUserId, creditsToGive);
      }
    }

    // --- CASO C: EXPIRACIÓN ---
    if (type === "EXPIRATION") {
       console.log("🚫 Suscripción expirada. Removiendo créditos recurrentes.");
       // Opcional: Poner a 0 solo si quieres ser estricto inmediatamente
       await supabaseAdmin.from("user_credits").update({ subscription_credits: 0 }).eq("user_id", appUserId);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

// Función auxiliar para SUMAR créditos de pack (sin borrar los de suscripción)
async function addPackCredits(supabase: any, userId: string, amount: number) {
  console.log(`➕ Sumando ${amount} créditos de pack al usuario ${userId}`);
  
  // 1. Obtener saldo actual
  const { data: current, error: fetchError } = await supabase
    .from("user_credits")
    .select("pack_credits")
    .eq("user_id", userId)
    .single();
  
  // Si da error y no es "no rows", lanzamos error
  if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching user:", fetchError);
  }

  const currentPack = current ? (current.pack_credits || 0) : 0;
  const newTotal = currentPack + amount;

  // 2. Guardar nuevo saldo
  if (current) {
      // Usuario existe: Actualizamos solo pack_credits
      await supabase.from("user_credits").update({ pack_credits: newTotal, updated_at: new Date() }).eq("user_id", userId);
  } else {
      // Usuario nuevo: Insertamos fila
      await supabase.from("user_credits").insert({ 
          user_id: userId, 
          pack_credits: newTotal, 
          subscription_credits: 0 
      });
  }
}
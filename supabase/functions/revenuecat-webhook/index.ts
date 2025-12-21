import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CONFIGURACIÓN ---
const WEBHOOK_SECRET = "LYH_SECRET_WEBHOOK_KEY_2025"; // <--- ¡Asegúrate que coincida con RevenueCat!

const CREDIT_MAP: Record<string, number> = {
  // SUSCRIPCIONES (Recurrentes)
  "lyhweeklypremium": 150,
  "lyhmonthlypremium": 700,
  "lyhyearlypremium": 10000,

  // PACKS (Pago único)
  "lyhpack50": 50,
  "lyhpack100": 100,
  "lyhpack500": 500
};

serve(async (req) => {
  try {
    // 1. Verificación de Seguridad
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    if (secret !== WEBHOOK_SECRET) { 
      console.error("⛔ Acceso denegado. Secreto incorrecto.");
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Inicializar Admin
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
    
    console.log(`🔔 Evento: ${type} | ID: "${productId}" | User: ${appUserId}`);

    // --- CASO DE EXPIRACIÓN (Importante para modelos de suscripción) ---
    if (type === "EXPIRATION") {
       console.log(`🚫 Suscripción expirada para ${appUserId}. Limpiando créditos de suscripción.`);
       // Ponemos a 0 los créditos de suscripción (pero dejamos los packs si tuviera)
       await supabaseAdmin
         .from("user_credits")
         .update({ subscription_credits: 0, updated_at: new Date() })
         .eq("user_id", appUserId);
         
       return new Response(JSON.stringify({ received: true, action: "credits_removed" }));
    }

    // Si es cancelación voluntaria (pero aún tiene tiempo válido), no hacemos nada
    if (type.includes("CANCELLATION")) {
       return new Response(JSON.stringify({ received: true, ignored: "cancellation_pending_expiry" }));
    }

    // 3. Buscar Créditos
    const creditsToGive = CREDIT_MAP[productId];

    // Si no está en el mapa, respondemos 200 para que RevenueCat no reintente infinitamente
    if (!creditsToGive) {
        // Solo logueamos error si NO es un evento de expiración (ya manejado arriba)
        console.warn(`⚠️ Producto no mapeado: "${productId}". Ignorando.`);
        return new Response(JSON.stringify({ received: true, warning: "Product Not Mapped" }));
    }

    // 4. Procesar Compra / Renovación
    if (["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"].includes(type)) {
      
      const isPack = productId.toLowerCase().includes("pack");

      if (isPack) {
         // Lógica blindada para Packs (Suma + Race Condition Handler)
         await addPackCredits(supabaseAdmin, appUserId, creditsToGive);
      } else {
         // Lógica para Suscripciones (Resetea/Sobrescribe el mes)
         console.log(`💎 Suscripción: Asignando ${creditsToGive} créditos.`);
         const { error } = await supabaseAdmin
          .from("user_credits")
          .upsert({ 
            user_id: appUserId, 
            subscription_credits: creditsToGive, 
            updated_at: new Date()
          }, { onConflict: 'user_id' });
          
         if (error) {
            console.error("❌ Error DB Suscripción:", error);
            throw error; // Esto forzará un reintento de RevenueCat (500)
         }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Error General:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

// --- FUNCIÓN BLINDADA PARA PACKS ---
async function addPackCredits(supabase: any, userId: string, amount: number) {
  console.log(`➕ Procesando Pack: ${amount} créditos para ${userId}`);
  
  // Paso A: Intentar leer usuario actual
  const { data: current, error: fetchError } = await supabase
    .from("user_credits")
    .select("pack_credits")
    .eq("user_id", userId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("❌ Error leyendo usuario:", fetchError);
  }

  if (current) {
      // CASO 1: El usuario YA existe -> UPDATE
      const newTotal = (current.pack_credits || 0) + amount;
      console.log(`📝 Actualizando: ${current.pack_credits} + ${amount} = ${newTotal}`);

      const { error } = await supabase
          .from("user_credits")
          .update({ pack_credits: newTotal, updated_at: new Date() })
          .eq("user_id", userId);

      if (error) throw error; // Lanzar error para reintento

  } else {
      // CASO 2: Usuario NUEVO -> INSERT
      console.log(`🆕 Creando usuario con ${amount} créditos.`);
      
      const { error: insertError } = await supabase
          .from("user_credits")
          .insert({ 
              user_id: userId, 
              pack_credits: amount, 
              subscription_credits: 0 
          });

      // CASO 3: RACE CONDITION (El usuario se creó milisegundos antes)
      if (insertError) {
          if (insertError.code === '23505') { // Unique Violation
              console.log("🔄 Race Condition detectada. Reintentando update...");
              
              const { data: retryData } = await supabase
                  .from("user_credits")
                  .select("pack_credits")
                  .eq("user_id", userId)
                  .single();

              const retryTotal = (retryData?.pack_credits || 0) + amount;
              
              const { error: retryError } = await supabase
                  .from("user_credits")
                  .update({ pack_credits: retryTotal, updated_at: new Date() })
                  .eq("user_id", userId);

              if (retryError) {
                  console.error("❌ Falló el reintento:", retryError);
                  throw retryError;
              } else {
                  console.log("✅ Recuperado con éxito.");
              }
          } else {
              console.error("❌ Error Insert:", insertError);
              throw insertError;
          }
      }
  }
}
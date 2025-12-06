// Importamos las herramientas necesarias
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

// Configuración de seguridad para permitir que tu app se conecte
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. Manejo de permisos (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase para verificar créditos y leer prompts
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 2. BUSCAMOS TU LLAVE SECRETA "AURA"
    const apiKey = Deno.env.get("GEMINI_API_KEY_AURA");
    
    if (!apiKey) {
      throw new Error("ERROR CRÍTICO: No encontré la llave GEMINI_API_KEY_AURA en los secretos de Supabase.");
    }

    // 3. Recibimos los datos (CAMBIO: Eliminamos 'modelName' ya que no lo usaremos desde la App)
    const { imageBase64, garmentBase64, user_id, feature_id, variant } = await req.json();

    if (!imageBase64 || !feature_id) {
      throw new Error("Faltan datos: No llegó la imagen principal o el feature_id.");
    }

    if (!user_id) {
        throw new Error("Usuario no identificado (Falta user_id para procesar créditos)");
    }

    // --- INICIO BLOQUE DE CRÉDITOS Y PROMPT (MIGRADO A DB) ---
    
    // A. Construir ID de búsqueda
    // Normalizamos a minúsculas y construimos el ID compuesto si existe variante (ej: "stylist_rock")
    let searchId = variant ? `${feature_id}_${variant}` : feature_id;
    searchId = searchId.toLowerCase().trim();

    console.log(`🔍 Buscando configuración en DB para: ${searchId}`);

    // B. Buscar en la tabla 'ai_prompts'
    let { data: promptData, error: dbError } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('id', searchId)
      .single();

    // C. Lógica de Fallback (Herencia)
    // Si no encontramos la variante específica (ej: 'stylist_rock'), buscamos el padre ('stylist')
    if (!promptData && searchId.includes('_')) {
        const parentId = searchId.split('_')[0];
        console.log(`⚠️ Variante ${searchId} no encontrada. Intentando fallback a padre: ${parentId}`);
        
        const { data: parentData } = await supabase
            .from('ai_prompts')
            .select('*')
            .eq('id', parentId)
            .single();
            
        promptData = parentData;
    }

    if (!promptData) {
        // Si falla la búsqueda (ni hijo ni padre), lanzamos error para no cobrar por algo que no existe
        throw new Error(`Configuración de prompt no encontrada para el ID: ${searchId}`);
    }

    // D. Determinar Costo desde la DB
    const cost = promptData.cost || 2; // Default de seguridad si la columna viniera vacía

    console.log(`💰 Cobrando ${cost} créditos al usuario ${user_id}...`);
    
    // E. Ejecutar Cobro (RPC existente)
    const { data: transaction, error: txError } = await supabase.rpc('deduct_credits', {
      p_user_id: user_id,
      p_cost: cost
    });

    if (txError) {
        console.error("Error en DB (Cobro):", txError);
        throw new Error(`Error verificando saldo: ${txError.message}`);
    }
    
    if (!transaction || !transaction.success) {
      return new Response(JSON.stringify({ error: "Saldo insuficiente", code: "INSUFFICIENT_CREDITS" }), {
        status: 402, 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("✅ Cobro exitoso. Preparando Prompt...");

    // F. Construir el Prompt Final usando los datos de la DB
    let finalPrompt = promptData.system_prompt;
    if (promptData.negative_prompt) {
        finalPrompt += `\n\nNEGATIVE PROMPT (Avoid these elements strictly): ${promptData.negative_prompt}`;
    }

    // --- FIN BLOQUE CRÉDITOS Y PROMPT ---


    // 4. Conectamos con Google (Lado Servidor)
    // CAMBIO: Usamos 'promptData.model_id' de la DB. Si está vacío, usamos el nuevo default.
    const modelId = promptData.model_id || "gemini-2.5-flash-image";
    // 👇 Log de la consola para ver que modelo se esta usando 👇
    console.log(`🤖 Usando modelo definido en DB: ${modelId}`); 
    // 👆 ---------------------- 👆
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });

    // 5. Preparamos el contenido para la IA usando el finalPrompt recuperado
    const contentParts: any[] = [
      finalPrompt,
      { inlineData: { data: imageBase64, mimeType: "image/jpeg" } } 
    ];

    if (garmentBase64) {
      console.log("👗 Modo Virtual Try On detectado: Agregando imagen de prenda...");
      contentParts.push({ 
        inlineData: { data: garmentBase64, mimeType: "image/jpeg" } 
      });
    }

    // 6. Generamos la imagen
    const result = await model.generateContent(contentParts);

    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
        throw new Error("Gemini no devolvió ninguna imagen.");
    }

    const imagePart = candidates[0].content.parts.find(
      (part) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
    );

    let finalData = null;
    if (imagePart && imagePart.inlineData) {
      finalData = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    return new Response(JSON.stringify({ image: finalData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Error en función:", error);
    return new Response(JSON.stringify({ error: error.message || "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
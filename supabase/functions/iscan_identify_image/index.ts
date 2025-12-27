import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // CORS Preflight
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        // 1. Get Secret
        const apiKey = Deno.env.get("iScan_GEMINI_API_KEY");
        if (!apiKey) throw new Error("Missing iScan_GEMINI_API_KEY env var");

        // 2. Parse Body
        const { imageBase64, featureId } = await req.json();
        if (!imageBase64) throw new Error("Missing imageBase64");

        // 3. Select System Prompt based on featureId
        let baseInstruction = "You are an expert taxonomist, appraiser, and scientific researcher. Your task is to Identify the OBJECT in the image with EXTREME PRECISION and RELIABILITY.\n" +
            "RULES FOR ACCURACY:\n" +
            "1. If the specific breed/species/model is ambiguous, identify to the lowest certain taxonomic level.\n" +
            "2. Failure to identify match: Return specific error.\n" +
            "3. BE CONSERVATIVE. Better broadly correct than specifically wrong.\n";

        // VALIDATION STEP
        let validationInstruction = `First, VALIDATION CHECK: Does this image contain a [${featureId}]?\n` +
            `If clearly NOT a [${featureId}], return JSON: { "error": "The image does not appear to contain a ${featureId}." }.\n`;

        // JSON OUTPUT INSTRUCTION with CARD SCHEMA
        let jsonInstruction = "If valid, return JSON with: { \n" +
            "  title: string,\n" +
            "  description: string,\n" +
            "  key_details: [{ label: string, value: string, icon: string, color: string, featured?: boolean }], \n" +
            "  health_assessment?: { is_healthy: boolean, diagnosis: string, recommendations: string } (ONLY for PLANTS),\n" +
            "  sections: [{ title: string, content: string }]\n" +
            "}\n\n" +
            "IMPORTANT: You MUST generate the 'key_details' array using the following schemas for each feature type:\n";

        let specificInstruction = "";
        switch (featureId) {
            case 'plant':
                specificInstruction = "Identify precise Species.\n" +
                    "Populate 'key_details' with:\n" +
                    "- Label: 'Toxicity', Icon: 'shield-check', Color: '#f0fdf4' (featured: true)\n" +
                    "- Label: 'Care', Icon: 'leaf', Color: '#f8fafc'\n" +
                    "- Label: 'Light', Icon: 'sun', Color: '#fff7ed'\n" +
                    "- Label: 'Water', Icon: 'droplet', Color: '#eff6ff'\n" +
                    "- Label: 'Soil', Icon: 'soil', Color: '#f5f5f4'\n" +
                    "Also include 'health_assessment' object analyzing leaf health.";
                break;
            case 'fish':
                specificInstruction = "Identify precise Fish Species.\n" +
                    "Populate 'key_details' with:\n" +
                    "- Label: 'Season', Icon: 'calendar', Color: '#fefce8'\n" +
                    "- Label: 'Regulation', Icon: 'scale', Color: '#fef2f2'\n" +
                    "- Label: 'Location', Icon: 'waves', Color: '#eff6ff'\n" +
                    "- Label: 'Edibility', Icon: 'utensils', Color: '#f0fdf4' (featured: true)\n" +
                    "- Label: 'Max Size', Icon: 'ruler', Color: '#f5f5f4'";
                break;
            case 'cat':
                specificInstruction = "Identify Cat Breed. If mixed, use 'Domestic Short/Long Hair'.\n" +
                    "Populate 'key_details' with:\n" +
                    "- Label: 'Temperament', Icon: 'smile', Color: '#fefce8' (featured: true)\n" +
                    "- Label: 'Origin', Icon: 'globe', Color: '#eff6ff'\n" +
                    "- Label: 'Lifespan', Icon: 'calendar', Color: '#f0fdf4'\n" +
                    "- Label: 'Weight', Icon: 'weight', Color: '#f5f5f4'\n" +
                    "- Label: 'Hypoallergenic', Icon: 'shield-check', Color: '#fef2f2'";
                break;
            case 'dog':
                specificInstruction = "Identify Dog Breed.\n" +
                    "Populate 'key_details' with:\n" +
                    "- Label: 'Breed Group', Icon: 'soil', Color: '#f5f5f4'\n" +
                    "- Label: 'Temperament', Icon: 'smile', Color: '#fefce8' (featured: true)\n" +
                    "- Label: 'Size', Icon: 'ruler', Color: '#eff6ff'\n" +
                    "- Label: 'Lifespan', Icon: 'calendar', Color: '#f0fdf4'\n" +
                    "- Label: 'Exercise', Icon: 'dumbbell', Color: '#fef2f2'";
                break;
            case 'rock':
                specificInstruction = "Identify Mineral/Crystal.\n" +
                    "Populate 'key_details' with:\n" +
                    "- Label: 'Type', Icon: 'diamond', Color: '#f0fdf4' (featured: true)\n" +
                    "- Label: 'Hardness Scale', Icon: 'hammer', Color: '#eff6ff'\n" +
                    "- Label: 'Chemical Formula', Icon: 'flask', Color: '#eff6ff'";
                break;
            case 'insect':
                specificInstruction = "Identify Insect Species.\n" +
                    "Populate 'key_details' with:\n" +
                    "- Label: 'Family', Icon: 'bug', Color: '#fbece1'\n" +
                    "- Label: 'Genus', Icon: 'dna', Color: '#e8f3fe'\n" +
                    "- Label: 'Lifespan', Icon: 'calendar', Color: '#fff9e5'\n" +
                    "- Label: 'Order', Icon: 'network', Color: '#f0f9ff'";
                break;
            case 'coin':
                specificInstruction = "Identify Coin (Year, Mint, Issuer).\n" +
                    "Populate 'key_details' with:\n" +
                    "- Label: 'Issuer', Icon: 'landmark', Color: '#eff6ff'\n" +
                    "- Label: 'Ref. Price', Icon: 'coins', Color: '#f0fdf4' (featured: true)\n" +
                    "- Label: 'Year', Icon: 'calendar', Color: '#fefce8'\n" +
                    "- Label: 'Composition', Icon: 'soil', Color: '#f5f5f4'";
                break;
            case 'custom':
                validationInstruction = "";
                specificInstruction = "Identify object. If product, set 'isProduct': true and include 'shopping_links'.";
                break;
            default:
                specificInstruction = "Provide general identification.";
        }

        const fullPrompt = baseInstruction + validationInstruction + jsonInstruction + specificInstruction + "\nOutput valid JSON only.";

        // 4. Call Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const result = await model.generateContent([
            fullPrompt,
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse JSON:", cleanText);
            throw new Error("AI returned invalid JSON format.");
        }

        if (jsonResponse.error) {
            return new Response(JSON.stringify(jsonResponse), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 5. Google Custom Search
        try {
            const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
            const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

            if (googleApiKey && searchEngineId && jsonResponse.title) {
                const query = encodeURIComponent(jsonResponse.title);
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${query}&searchType=image&num=4&safe=active`;
                const searchRes = await fetch(searchUrl);
                const searchData = await searchRes.json();
                if (searchData.items) {
                    jsonResponse.web_images = searchData.items.map((item: any) => ({
                        thumbnail_url: item.link,
                        search_url: item.contextLink || item.link
                    }));
                }
            }
        } catch (searchError) {
            jsonResponse.web_images = [];
        }

        return new Response(JSON.stringify(jsonResponse), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});

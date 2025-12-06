import { supabase } from '../config/supabase';

export interface PromptConfig {
  id: string;
  cost: number;
  title?: string;
}

// Descarga todos los prompts y los convierte en un objeto fácil de consultar
// Ejemplo de retorno: { 'tryon': { cost: 5, ... }, 'stylist': { cost: 2, ... } }
export const fetchAllPrompts = async (): Promise<Record<string, PromptConfig>> => {
  try {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('id, cost, title');
    
    if (error) throw error;

    const configMap: Record<string, PromptConfig> = {};
    if (data) {
      data.forEach((item) => {
        configMap[item.id] = item;
      });
    }
    return configMap;
  } catch (e) {
    console.error("Error fetching prompt config:", e);
    return {};
  }
};
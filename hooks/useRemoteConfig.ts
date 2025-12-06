import { useEffect, useState } from 'react';
import { fetchAllPrompts, PromptConfig } from '../src/services/prompts';

// Caché en memoria para que la descarga se haga solo una vez por sesión
let cachedConfig: Record<string, PromptConfig> | null = null;

export function useRemoteConfig() {
  const [config, setConfig] = useState<Record<string, PromptConfig> | null>(cachedConfig);

  useEffect(() => {
    // Si ya tenemos datos, no volvemos a llamar a la base de datos
    if (cachedConfig) {
        setConfig(cachedConfig);
        return;
    }

    // Si no, descargamos
    fetchAllPrompts().then((data) => {
      cachedConfig = data;
      setConfig(data);
    });
  }, []);

  // Función auxiliar para obtener precio con un valor por defecto de seguridad
  const getCost = (featureId: string, defaultCost: number = 2) => {
    if (!config) return defaultCost; // Aún cargando
    return config[featureId]?.cost ?? defaultCost;
  };

  return { config, getCost };
}
import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

const compressForAnalysis = async (uri: string): Promise<string> => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
    } catch (e) {
        return uri;
    }
};


export async function identifyImage(featureId: string, imageUri: string, language: string = 'en'): Promise<any> {
    try {
        console.log(`🔍 Identifying ${featureId}... Language: ${language}`);

        // --- MOCK DATA DISABLED FOR REAL AI TESTING ---
        // To re-enable mock data for UI testing, uncomment the blocks below.
        /*
        const fId = featureId.toLowerCase();
        
        // ... (Mock blocks for dog, cat, fish, rock, plant, coin, insect would go here) ...
        */

        // ----------------------------------------------


        // 1. Optimize Image
        const optimizedUri = await compressForAnalysis(imageUri);
        const base64 = await FileSystem.readAsStringAsync(optimizedUri, { encoding: 'base64' });

        // 2. Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('iscan_identify_image', {
            body: {
                imageBase64: base64,
                featureId: featureId,
                language: language // Pass language to AI
            }
        });

        if (error) {
            console.error("Supabase Function Error:", error);
            throw error;
        }

        if (data?.error) {
            throw new Error(data.error);
        }

        return data;

    } catch (e) {
        console.error("Identification Service Error:", e);
        throw e;
    }
}

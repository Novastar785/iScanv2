import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ArrowLeft, Camera, Download, Flag, Image as ImageIcon, Share2, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reportContent } from '../src/services/reportService';
// Importamos la función de IA desde la ruta correcta (src/services)
import { useTranslation } from 'react-i18next'; // ✨
import { generateAIImage } from '../src/services/gemini';

// Definición de una Opción Visual (Tarjeta)
export interface ToolOption {
  id: string;      // Identificador para la IA (ej: 'rock')
  label: string;   // Texto para el usuario (ej: 'Rockero')
  image: string;   // URL de la imagen de ejemplo
}

// Propiedades que recibe este componente reutilizable
interface ToolProps {
  title: string;
  subtitle: string;
  price: number;
  backgroundImage: string;
  apiMode: string;        // Modo base de la IA (ej: 'stylist')
  options?: ToolOption[]; // Lista opcional de sub-estilos
}

export default function GenericToolScreen({ title, subtitle, price, backgroundImage, apiMode, options }: ToolProps) {
  const router = useRouter();
  const { t } = useTranslation(); // ✨
  
  // --- ESTADOS ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Estado para la opción seleccionada (ej: 'urban')
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Seleccionar automáticamente la primera opción si existen opciones
  useEffect(() => {
    if (options && options.length > 0) {
      setSelectedOption(options[0].id);
    }
  }, [options]);

  const resetState = () => {
    setResultImage(null);
    setSelectedImage(null);
    setLoadingStage("");
    setIsProcessing(false);
    setIsSaving(false);
    setIsSharing(false);
    if (options && options.length > 0) setSelectedOption(options[0].id);
  };

  const pickImage = async (useCamera: boolean) => {
    setShowSelectionModal(false);
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== 'granted') {
      return Alert.alert(t('common.permissions_missing'), t('common.permissions_access'));
    }

    // Nombramos 'pickerOptions' para no confundir con las 'options' de estilos
    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: false, // 🔥 FIX: Desactiva el crop para evitar glitches y permitir fotos completas
      quality: 0.8 
    };

    const result = useCamera 
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setLoadingStage(t('common.generating')); 
    
    try {
      // Enviamos la imagen, el modo base y la variante seleccionada (si hay)
      const generatedImageBase64 = await generateAIImage(selectedImage, apiMode, selectedOption);

      if (generatedImageBase64) {
        setResultImage(generatedImageBase64);
      } else {
        Alert.alert(t('common.error'), t('common.error_generation'));
      }
    } catch (error: any) {
      console.error(error);
      
      // ✅ DETECCIÓN DE SALDO INSUFICIENTE
      if (error.message === 'INSUFFICIENT_CREDITS') {
        Alert.alert(
          t('common.insufficient_title'),
          t('common.insufficient_msg'),
          [
            { text: t('common.cancel'), style: "cancel" },
            { 
              text: t('common.go_store'), 
              onPress: () => router.push('/(tabs)/store') // 🛒 Redirige a la tienda
            }
          ]
        );
      } else {
        Alert.alert(t('common.error'), t('common.error_technical'));
      }
    } finally {
      setIsProcessing(false);
      setLoadingStage("");
    }
  };

  const handleSave = async () => {
    if (!resultImage) return;
    setIsSaving(true);
    try {
      // 1. Verificar si YA tenemos permiso
      const { status } = await MediaLibrary.getPermissionsAsync();
      let finalStatus = status;

      // 2. Si no lo tenemos, pedirlo
      if (status !== 'granted') {
        const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== 'granted') return Alert.alert(t('common.permission_denied'));
      
      const directory = FileSystem.cacheDirectory;
      const filename = directory + `aura_ai_${Date.now()}.png`;
      const base64Code = resultImage.includes('base64,') ? resultImage.split('base64,')[1] : resultImage;
      
      await FileSystem.writeAsStringAsync(filename, base64Code, { encoding: 'base64' });
      const asset = await MediaLibrary.createAssetAsync(filename);
      const album = await MediaLibrary.getAlbumAsync('Aura AI');
      
      if (album) { await MediaLibrary.addAssetsToAlbumAsync([asset], album, false); } 
      else { await MediaLibrary.createAlbumAsync('Aura AI', asset, false); }
      
      Alert.alert(t('common.saved'), t('common.saved_msg_album'));
    } catch (error: any) { Alert.alert(t('common.error'), error.message); } finally { setIsSaving(false); }
  };

  const handleShare = async () => {
    if (!resultImage) return;
    setIsSharing(true);
    try {
      const directory = FileSystem.cacheDirectory;
      const filename = directory + `share_aura_${Date.now()}.png`;
      const base64Code = resultImage.includes('base64,') ? resultImage.split('base64,')[1] : resultImage;
      await FileSystem.writeAsStringAsync(filename, base64Code, { encoding: 'base64' });
      
      if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(filename); }
    } catch (error) { Alert.alert(t('common.error'), t('common.share_error')); } finally { setIsSharing(false); }
  };

  const handleReport = () => {
  Alert.alert(
    t('report.title'),
    t('report.msg'),
    [
      { text: t('common.cancel'), style: 'cancel' },
      { 
        text: t('report.reason_nsfw'), 
        onPress: () => confirmReport('NSFW') 
      },
      { 
        text: t('report.reason_offensive'), 
        onPress: () => confirmReport('Offensive') 
      },
      { 
        text: t('report.reason_other'), 
        onPress: () => confirmReport('Other') 
      },
    ]
  );
};

const confirmReport = async (reason: string) => {
  // 1. Enviar a Supabase
  await reportContent(apiMode, reason, resultImage);

  // 2. Ocultar la imagen inmediatamente (Requisito de Apple)
  setResultImage(null); 
};

  // --- RENDERIZADO: PANTALLA DE RESULTADO ---
  if (resultImage) {
    return (
      <View className="flex-1 bg-black">
        <Image source={{ uri: resultImage }} className="absolute w-full h-full" resizeMode="contain" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} className="absolute bottom-0 w-full h-1/2" />
        <SafeAreaView className="flex-1 justify-between px-6 pb-8">
         {/* HEADER DE RESULTADO CON REPORTE */}
  <View className="flex-row justify-between items-start pt-4">
    {/* Botón Reportar (NUEVO) */}
    <TouchableOpacity 
      onPress={handleReport}
      className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10"
    >
      <Flag size={20} color="#ef4444" /> {/* Icono rojo */}
    </TouchableOpacity>

    <View className="bg-indigo-500 px-3 py-1 rounded-full shadow-lg">
       <Text className="text-white font-bold text-xs">{t('common.ia_generated')}</Text>
    </View>
  </View>
          <View>
            <Text className="text-white text-3xl font-bold text-center mb-2">{t('generic_tool.result_title')}</Text>
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity onPress={handleShare} disabled={isSharing} className="flex-1 h-14 bg-zinc-800 rounded-2xl justify-center items-center border border-white/10">
                 {isSharing ? <ActivityIndicator color="white" /> : <><Share2 size={20} color="white" className="mr-2" /><Text className="text-white font-bold">{t('common.share')}</Text></>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={isSaving} className="flex-1 h-14 bg-white rounded-2xl justify-center items-center shadow-lg">
                 {isSaving ? <ActivityIndicator color="black" /> : <><Download size={20} color="black" className="mr-2" /><Text className="text-black font-bold">{t('common.save')}</Text></>}
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={resetState} className="h-12 items-center justify-center">
               <Text className="text-zinc-500 font-bold">{t('generic_tool.try_again')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // --- RENDERIZADO: PANTALLA PRINCIPAL (SELECCIÓN) ---
  return (
    <View className="flex-1 bg-[#0f0f0f]">
      {/* Fondo Dinámico */}
      <Image 
        source={{ uri: selectedImage ? selectedImage : backgroundImage }} 
        className="absolute w-full h-full opacity-60" 
        blurRadius={selectedImage ? 0 : 20}
        resizeMode="cover"
      />
      <LinearGradient colors={['transparent', '#0f0f0f']} className="absolute w-full h-full" />

      <SafeAreaView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          {selectedImage && (
             <TouchableOpacity onPress={() => setSelectedImage(null)} className="bg-black/40 px-3 py-1 rounded-full border border-white/10 flex-row items-center">
                <X size={14} color="white" className="mr-1"/>
                <Text className="text-white text-xs font-bold">{t('common.cancel')}</Text>
             </TouchableOpacity>
          )}
        </View>

        <View className="flex-1 justify-end pb-12">
          {!selectedImage ? (
            // ESTADO 1: ANTES DE SUBIR FOTO
            <>
              <View className="bg-rose-500 self-start px-3 py-1 rounded-full mb-4 shadow-lg">
                <Text className="text-white text-xs font-bold">{t('common.popular')}</Text>
              </View>
              <Text className="text-white text-4xl font-bold mb-2">{title}</Text>
              <Text className="text-zinc-400 text-lg mb-8">{subtitle}</Text>
              <TouchableOpacity 
                className="w-full h-16 bg-indigo-500 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-500/50"
                onPress={() => setShowSelectionModal(true)}
              >
                <Camera size={24} color="white" className="mr-3" />
                <Text className="text-white font-bold text-lg">{t('common.upload_photo')} ({price} 💎)</Text>
              </TouchableOpacity>
            </>
          ) : (
            // ESTADO 2: FOTO LISTA, ELIGIENDO ESTILO
            <View className="bg-black/80 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                <Text className="text-white text-xl font-bold mb-1 text-center">{t('generic_tool.photo_selected')}</Text>
                <Text className="text-zinc-400 text-sm mb-6 text-center">{t('generic_tool.ready_process')}</Text>

                {/* --- SECCIÓN DE TARJETAS DE ESTILO (NUEVO) --- */}
                {options && (
                  <View className="mb-6">
                    <Text className="text-zinc-500 text-xs font-bold mb-3 uppercase tracking-widest ml-1">{t('generic_tool.choose_style')}</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                    >
                      {options.map((opt) => {
                        const isSelected = selectedOption === opt.id;
                        return (
                          <TouchableOpacity 
                            key={opt.id}
                            onPress={() => setSelectedOption(opt.id)}
                            className="relative"
                            activeOpacity={0.8}
                          >
                            {/* IMAGEN DE LA TARJETA */}
                            <View 
                              className={`w-24 h-32 rounded-xl overflow-hidden border-2 ${isSelected ? 'border-indigo-500' : 'border-white/20'}`}
                            >
                              <Image 
                                source={{ uri: opt.image }} 
                                className={`w-full h-full ${isSelected ? 'opacity-100' : 'opacity-70'}`} 
                                resizeMode="contain" 
                              />
                              <LinearGradient 
                                colors={['transparent', 'rgba(0,0,0,0.8)']} 
                                className="absolute bottom-0 w-full h-1/2" 
                              />
                            </View>

                            {/* TEXTO DE LA TARJETA */}
                            <View className="absolute bottom-2 left-0 right-0 items-center">
                              <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                                {opt.label}
                              </Text>
                            </View>

                            {/* CHECK DE SELECCIÓN */}
                            {isSelected && (
                              <View className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1 shadow-sm">
                                <Sparkles size={10} color="white" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
                {/* ------------------------------------------- */}

                <TouchableOpacity 
                  className={`w-full h-16 rounded-2xl flex-row items-center justify-center ${isProcessing ? 'bg-zinc-700' : 'bg-indigo-500'}`}
                  style={!isProcessing ? { shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 } : {}}
                  onPress={handleGenerate}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                     <><ActivityIndicator color="white" className="mr-3" /><Text className="text-zinc-300 font-bold text-xs">{loadingStage || t('common.processing')}</Text></>
                  ) : (
                    <><Sparkles size={24} color="white" className="mr-3" /><Text className="text-white font-bold text-lg">{t('generic_tool.generate_btn')}</Text></>
                  )}
                </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      <Modal visible={showSelectionModal} transparent animationType="fade">
         <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#1c1c1e] rounded-t-[32px] p-6 pb-12 border-t border-white/10">
               <Text className="text-white text-xl font-bold text-center mb-2">{t('common.upload_photo')}</Text>
               <Text className="text-zinc-500 text-center mb-8">{t('common.choose_source')}</Text>
               <TouchableOpacity onPress={() => pickImage(true)} className="bg-zinc-800 p-4 rounded-2xl mb-3 flex-row items-center border border-white/5">
                  <View className="w-10 h-10 bg-indigo-500/20 rounded-full items-center justify-center mr-4"><Camera size={20} color="#818cf8" /></View>
                  <Text className="text-white font-bold text-lg">{t('common.camera')}</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => pickImage(false)} className="bg-zinc-800 p-4 rounded-2xl mb-6 flex-row items-center border border-white/5">
                  <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center mr-4"><ImageIcon size={20} color="#c084fc" /></View>
                  <Text className="text-white font-bold text-lg">{t('common.gallery')}</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={() => setShowSelectionModal(false)} className="py-3 items-center">
                  <Text className="text-zinc-400 font-bold">{t('common.cancel')}</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}
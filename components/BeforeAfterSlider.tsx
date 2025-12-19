import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BeforeAfterSlider as ExpoSlider } from 'expo-image-compare';

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
}

export default function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterProps) {
  return (
    <View style={styles.container}>
        <ExpoSlider
            beforeImage={{ uri: beforeImage }}
            afterImage={{ uri: afterImage }}
            
            // Altura fija (ajusta si deseas más o menos altura)
            height={350} 
            
            // Color de la línea divisoria
            sliderLineColor="#4f46e5"
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
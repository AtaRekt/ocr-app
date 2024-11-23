import React, { useState, useRef } from 'react';

type ResultParams = {
  result: string;
};
import { Alert, StyleSheet, View } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedButton } from '@/components/ThemedButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

import * as ImageManipulator from 'expo-image-manipulator';

import { useRouter } from 'expo-router';

// Claude API için sabitler
const CLAUDE_API_KEY = '';

const claudeApi = axios.create({
  baseURL: 'https://api.anthropic.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01'
  }
});

// Claude'a gönderilecek sistem promptu
const SYSTEM_PROMPT = `You are a professional OCR translator. Your primary task is to:

1. Carefully scan the ENTIRE image for ALL text content:
   - Examine headers, body text, and any other textual elements
   - Extract ALL text regardless of position or formatting
   - Do not skip any text portions
   - Process the image thoroughly from top to bottom
   - Include both main text and any secondary text elements

2. Return ONLY a valid JSON object in this exact structure:
{
    "originalText": "full extracted text from image",
    "translation": "complete translated text",
    "sourceLanguage": "detected source language",
    "targetLanguage": "target language"
}

3. Critical rules:
- Output must be valid JSON
- Include ALL detected text
- No additional explanation or commentary outside JSON
- No markdown or other formatting
- Escape special characters properly
- Use proper JSON syntax with double quotes
- Process ALL visible text, not just headers
- Maintain original text flow and structure
- Preserve paragraphs and line breaks using \n
- Include any numbers, dates, or special characters
- Detect and process text regardless of size or position

4. Translation guidelines:
- Translate to [target language]
- Maintain professional terminology
- Preserve text structure in translation
- Keep technical terms accurate
- Maintain formal/informal tone as in original
- Preserve any emphasis or important formatting

Do not include any text outside the JSON structure. Ensure the response is a single, valid JSON object.`;

async function optimizeImage(uri: string): Promise<string> {
  try {
    // İlk olarak daha düşük çözünürlükte sıkıştırma deneyelim
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 0.65, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    
    if (!manipResult.base64) {
      throw new Error('Base64 conversion failed');
    }

    console.log('Image size:', manipResult.base64.length * 0.75 / 1024, 'KB');

    if (manipResult.base64.length * 0.75 > 5 * 1024 * 1024) { // base64 string boyutu yaklaşık 1.33x gerçek boyuttur
      const furtherCompressed = await ImageManipulator.manipulateAsync(
        manipResult.uri,
        [],
        { compress: 0.50, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!furtherCompressed.base64) {
        throw new Error('Further compression failed');
      }

      console.log('Further compressed size:', furtherCompressed.base64.length * 0.75 / 1024, 'KB');

      return furtherCompressed.base64 || '';
    }

    return manipResult.base64;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw error;
  }
}

async function processWithClaude(imageBase64: string, targetLang: string) {
  try {
    const response = await claudeApi.post('/messages', {
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please extract text from this image and translate it to ${targetLang}. ${SYSTEM_PROMPT}`,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    return response.data.content[0].text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
      throw new Error(error.response?.data?.error?.message || 'Failed to process with Claude');
    }
    throw error;
  }
}

export async function performOCR(imageBase64: string) {
  try {
    const targetLang = await AsyncStorage.getItem('ocr_target_language');

    if (!targetLang) {
      throw new Error('Target language not set');
    }

    return await processWithClaude(imageBase64, targetLang);

  } catch (error) {
    console.error('OCR processing failed:', error);
    throw error;
  }
}

// Component isimleri büyük harfle başlamalı
export default function CameraScreen() {
  const router = useRouter();
  const [type] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { bottom } = useSafeAreaInsets();

  const handleScanPress = async () => {
    if (!cameraRef.current || isProcessing) return;
  
    try {
      setIsProcessing(true);
  
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        base64: false,
      });
  
      // @ts-ignore
      const optimizedBase64 = await optimizeImage(photo.uri);
      const result = await performOCR(optimizedBase64);

      console.log("raw result:", result);

      // console.log("encoded result:", encodeURIComponent(result));
      
      router.push({
        pathname: '/result',
        params: { 
          result
        } as ResultParams
      });
    } catch (error) {
      console.error('Failed to process image:', error);
      Alert.alert(
        "Error",
        axios.isAxiosError(error)
          ? error.response?.data?.error?.message || "API Error"
          : "Failed to process image. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        facing={type}
        style={styles.camera}
      >
        <View style={styles.overlay}>
          {/* Kamera kılavuz alanı */}
          <View style={styles.guideArea} />
        </View>
      </CameraView>

      <View style={[styles.buttonContainer, { paddingBottom: bottom + 20 }]}>
        <ThemedButton
          text={isProcessing ? "Processing..." : "Scan & Translate"}
          style={styles.scanButton}
          icon={{
            name: isProcessing ? "hourglass" : "camera",
            position: "left"
          }}
          onPress={handleScanPress}
          disabled={isProcessing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideArea: {
    width: '80%',
    height: '70%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanButton: {
    width: 250,
    padding: 20,
  },
});
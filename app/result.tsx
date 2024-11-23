import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';

// Route parametreleri için doğru tip tanımı
type ResultParams = {
  result?: string;
}

export default function ResultScreen() {
  // useLocalSearchParams'ı string tipinde kullan
  const { result } = useLocalSearchParams<ResultParams>();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  const parseResult = (text: any) => {
    if (!text) {
      return {
        originalText: 'No text found',
        translatedText: 'No translation available'
      };
    }

    try {
      console.log('RAW DISPLAY text:', text);
      console.log('Parsed text:', JSON.parse(text));
      const decodedData = JSON.parse(text);
      return {
        originalText: decodedData.originalText || 'No original text found',
        translatedText: decodedData.translation || 'No translation found'
      };
    } catch (error) {
      console.error('Error parsing result:', error);
      return {
        originalText: 'Error parsing original text',
        translatedText: 'Error parsing translation'
      };
    }
  };

  const { originalText, translatedText } = parseResult(result);

  const handleNewScan = () => {
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Translation Result</ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Original Text</ThemedText>
          <ThemedView style={styles.textContainer}>
            <ThemedText style={styles.text}>
              {originalText}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.divider} />

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Translation</ThemedText>
          <ThemedView style={styles.textContainer}>
            <ThemedText style={styles.text}>
              {translatedText}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.footer}>
        <ThemedButton
          text="New Scan"
          icon={{
            name: "camera",
            position: "left"
          }}
          style={styles.button}
          onPress={handleNewScan}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  textContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    padding: 16,
  },
});
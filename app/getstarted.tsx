import { StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';

const TARGET_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'fa', name: 'فارسی' },
];

import { Camera } from 'expo-camera';

const TARGET_LANGUAGE_KEY = 'ocr_target_language';
const ONBOARDING_KEY = 'onboarding_complete';

export default function GetStarted() {
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();

    const handleLanguageSelect = async (langCode: string) => {
        try {
            // Dil seçimini kaydet
            await AsyncStorage.setItem(TARGET_LANGUAGE_KEY, langCode);
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            
            // Kamera izni iste
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            
            if (!cameraPermission.granted) {
                // İzin verilmediyse kullanıcıyı bilgilendir
                Alert.alert(
                    "Camera Permission Required",
                    "Please grant camera permission to use the scanner"
                );
                return;
            }
    
            // Ana sayfaya yönlendir
            router.replace('/camerascreen');
        } catch (error) {
            console.error('Failed to save target language:', error);
        }
    };

    return (
        <ThemedView style={{
            ...styles.mainContainer,
            paddingTop: top,
        }}>
            <ThemedView style={styles.headerContainer}>
                <ThemedText type="title">Select Target Language</ThemedText>
                <ThemedText
                    type="body"
                    style={styles.subtitle}
                >
                    Choose the language you want to translate to
                </ThemedText>
            </ThemedView>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                bounces={false}                    // iOS için bounce'ı kapat
                alwaysBounceVertical={false}      // iOS için vertical bounce'ı kapat
                overScrollMode="never"            // Android için overscroll efektini kapat
            >
                {TARGET_LANGUAGES.map((lang) => (
                    <ThemedButton
                        key={lang.code}
                        icon={{
                            name: "chevron.right",
                            position: "right",
                        }}
                        style={styles.languageButton}
                        text={lang.name}
                        onPress={() => handleLanguageSelect(lang.name)}
                    />
                ))}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    headerContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    subtitle: {
        marginTop: 8,
        opacity: 0.7,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollViewContent: {
        padding: 20,
        gap: 12,
    },
    languageButton: {
        width: '100%',
        padding: 16,
    },
});
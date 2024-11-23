import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';

const ONBOARDING_KEY = 'onboarding_complete';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (!onboardingComplete && segments[0] !== 'getstarted') {
          requestAnimationFrame(() => {
            router.replace('/getstarted');
          });
        } else if (onboardingComplete && segments[0] === 'getstarted') {
          requestAnimationFrame(() => {
            router.replace('/');
          });
        }
      } catch (error) {
        console.error('Onboarding check failed:', error);
      }
    };

    checkOnboarding();
  }, [segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#111' : '#111' }} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <InitialLayout />
      <Stack initialRouteName='getstarted'>
        <Stack.Screen
          name="getstarted"
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="camerascreen"
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
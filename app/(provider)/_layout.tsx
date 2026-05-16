import { Stack } from 'expo-router';
export default function ProviderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/step1" />
      <Stack.Screen name="onboarding/step2" />
      <Stack.Screen name="onboarding/step3" />
      <Stack.Screen name="onboarding/step4" />
      <Stack.Screen name="onboarding/step5" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function HirerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="provider/[id]" />
      <Stack.Screen name="provider/enquiry" />
      <Stack.Screen name="booking/[id]" />
      <Stack.Screen name="payment" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

import 'react-native-gesture-handler';
import React, { useEffect, Component } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { useAuthStore } from '../src/store/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

interface EBState { error: string | null }
class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(error: Error): EBState {
    return { error: error.message + '\n' + error.stack };
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
            App Crashed — paste this to developer:
          </Text>
          <Text style={{ fontSize: 11, color: '#333' }}>
            {this.state.error}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage().catch((e: unknown) => console.error('loadFromStorage failed:', e));
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" backgroundColor="#FAF8F5" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(hirer)" />
            <Stack.Screen name="(provider)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
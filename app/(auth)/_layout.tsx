import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false, title: '' }} />
      <Stack.Screen name="register" options={{ headerShown: false, title: '' }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false, title: '' }} />
    </Stack>
  );
}

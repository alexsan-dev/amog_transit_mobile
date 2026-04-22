import React from 'react';
import { Stack } from 'expo-router';
import { CreateOrderProvider } from '@/src/context/CreateOrderContext';

export default function CreateOrderLayout() {
  return (
    <CreateOrderProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="route" />
        <Stack.Screen name="parcel" />
        <Stack.Screen name="products" />
        <Stack.Screen name="photos" />
        <Stack.Screen name="review" />
      </Stack>
    </CreateOrderProvider>
  );
}

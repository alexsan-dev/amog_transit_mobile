import React from 'react';
import { View, ViewProps } from 'react-native';

export function Card({ children, className, ...props }: ViewProps) {
  return (
    <View
      className={`bg-surface border border-border rounded-lg shadow-sm p-4 ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}

import React from 'react';
import { TextInput as RNTextInput, TextInputProps, View } from 'react-native';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="font-body text-sm font-medium text-text mb-1.5">{label}</Text>
      )}
      <RNTextInput
        className={`
          w-full bg-surface border border-border rounded-md px-4 py-3
          font-body text-base text-text
          ${error ? 'border-error' : ''}
          ${className || ''}
        `}
        placeholderTextColor="#6b7a99"
        {...props}
      />
      {error && (
        <Text className="font-body text-xs text-error mt-1">{error}</Text>
      )}
    </View>
  );
}

import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface AmogTextProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'label' | 'micro' | 'mono';
}

const variantMap: Record<string, string> = {
  display: 'font-heading text-3xl font-extrabold',
  h1: 'font-heading text-[28px] font-bold',
  h2: 'font-heading text-[22px] font-bold',
  h3: 'font-heading text-lg font-semibold',
  body: 'font-body text-base',
  bodySm: 'font-body text-sm',
  label: 'font-body text-xs font-medium',
  micro: 'font-body text-[11px] font-semibold uppercase tracking-wider',
  mono: 'font-mono text-sm tracking-wide',
};

export function Text({ variant = 'body', className, ...props }: AmogTextProps) {
  return (
    <RNText
      className={`${variantMap[variant]} ${className || ''}`}
      {...props}
    />
  );
}

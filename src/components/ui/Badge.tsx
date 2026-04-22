import { STATUS_COLORS } from "@/src/constants/statuses";
import React from "react";
import { View } from "react-native";
import { Text } from "./Text";

interface BadgeProps {
  status: keyof typeof STATUS_COLORS;
  label: string;
}

export function Badge({ status, label }: BadgeProps) {
  const colors = STATUS_COLORS[status] ?? { bg: 'bg-border/10', text: 'text-text-muted', border: 'border-border/20' };
  return (
    <View
      className={`self-start px-2.5 py-1 rounded-sm ${colors.bg} ${colors.border} border`}
    >
      <Text className={`font-body text-xs font-medium ${colors.text}`}>
        {label}
      </Text>
    </View>
  );
}

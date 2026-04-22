import React from "react";
import { View } from "react-native";

export function Skeleton({
  width = "100%",
  height = 16,
  className,
}: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <View
      className={`bg-base-300 rounded-md animate-pulse ${className || ""}`}
      style={{ width: width as any, height }}
    />
  );
}

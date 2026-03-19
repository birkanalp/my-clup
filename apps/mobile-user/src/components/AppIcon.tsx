import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentType } from 'react';

export type AppIconName = string;

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
};

export function AppIcon({ name, size = 20, color = '#0f172a' }: AppIconProps) {
  const MaterialIcon = MaterialCommunityIcons as ComponentType<AppIconProps>;
  return <MaterialIcon name={name} size={size} color={color} />;
}

import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, textStyle, fullWidth = true,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },

  // Variants
  primary:   { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.bg3 },
  outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: COLORS.red },

  // Sizes
  size_sm: { paddingVertical: SPACING.xs,  paddingHorizontal: SPACING.md, minHeight: 36 },
  size_md: { paddingVertical: 14,          paddingHorizontal: SPACING.lg, minHeight: 48 },
  size_lg: { paddingVertical: SPACING.md,  paddingHorizontal: SPACING.xl, minHeight: 56 },

  disabled: { opacity: 0.5 },

  text:         { fontWeight: '600', letterSpacing: 0.2 },
  text_primary:   { color: COLORS.white },
  text_secondary: { color: COLORS.text0 },
  text_outline:   { color: COLORS.primary },
  text_ghost:     { color: COLORS.primary },
  text_danger:    { color: COLORS.white },

  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
});

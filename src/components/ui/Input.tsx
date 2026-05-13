import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label, error, hint, leftIcon, rightIcon,
  containerStyle, ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputRow,
        focused && styles.focused,
        error  && styles.errored,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft]}
          placeholderTextColor={COLORS.text2}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    fontSize: 13, fontWeight: '500',
    color: COLORS.text1, marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg1,
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, minHeight: 50,
  },
  focused: { borderColor: COLORS.primary },
  errored: { borderColor: COLORS.red },
  input: {
    flex: 1, paddingHorizontal: SPACING.md,
    fontSize: 15, color: COLORS.text0,
    paddingVertical: 12,
  },
  inputWithLeft: { paddingLeft: 0 },
  leftIcon:  { paddingLeft: SPACING.md },
  rightIcon: { paddingRight: SPACING.md },
  error: { fontSize: 12, color: COLORS.red,   marginTop: 4 },
  hint:  { fontSize: 12, color: COLORS.text2, marginTop: 4 },
});

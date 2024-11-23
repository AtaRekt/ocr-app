import React, { useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
  type PressableProps,
} from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ThemedButtonProps extends Omit<PressableProps, 'style'> {
  text: string;
  lightColor?: string;
  darkColor?: string;
  icon?: {
    name: IconSymbolName;
    position: 'left' | 'right';
  };
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const ThemedButton = React.memo(({
  text,
  lightColor,
  darkColor,
  icon,
  size = 'medium',
  variant = 'solid',
  disabled = false,
  style,
  textStyle,
  onPress,
  ...otherProps
}: ThemedButtonProps) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'secondaryBackground');
  const textColor = useThemeColor({}, 'textSecondary');

  const buttonStyles = useMemo(() => {
    const sizeStyles: ViewStyle = {
      small: { padding: 8, minHeight: 32 },
      medium: { padding: 10, minHeight: 40 },
      large: { padding: 12, minHeight: 48 },
    }[size];

    const variantStyles: ViewStyle = {
      solid: { backgroundColor },
      outline: { 
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: backgroundColor,
      },
      ghost: { 
        backgroundColor: 'transparent',
      },
    }[variant];

    return [
      styles.container,
      sizeStyles,
      variantStyles,
      disabled && styles.disabled,
      style,
    ];
  }, [backgroundColor, size, variant, disabled, style]);

  const textStyles = useMemo(() => {
    const sizeStyles: TextStyle = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    }[size];

    return [
      styles.text,
      { color: textColor },
      sizeStyles,
      variant !== 'solid' && { color: backgroundColor },
      disabled && styles.textDisabled,
      textStyle,
    ];
  }, [size, textColor, backgroundColor, variant, disabled, textStyle]);

  const iconColor = variant === 'solid' ? textColor : backgroundColor;
  const iconSize = {
    small: 14,
    medium: 16,
    large: 18,
  }[size];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...otherProps}
    >
      {icon?.position === 'left' && (
        <IconSymbol
          name={icon.name}
          size={iconSize}
          color={disabled ? styles.textDisabled.color : iconColor}
          style={styles.iconLeft}
        />
      )}
      
      <Text style={[textStyles, styles.textContainer]} numberOfLines={1}>
        {text}
      </Text>

      {icon?.position === 'right' && (
        <IconSymbol
          name={icon.name}
          size={iconSize}
          color={disabled ? styles.textDisabled.color : iconColor}
          style={styles.iconRight}
        />
      )}
    </TouchableOpacity>
  );
});

ThemedButton.displayName = 'ThemedButton';

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 36, // İkonlar için alan bırak
  },
  text: {
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    color: '#999',
  },
  iconLeft: {
    position: 'absolute',
    left: 16,
  },
  iconRight: {
    position: 'absolute',
    right: 16,
  },
});
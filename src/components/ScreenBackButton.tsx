import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

type ScreenBackButtonProps = {
  style?: StyleProp<ViewStyle>;
};

export default function ScreenBackButton({ style }: ScreenBackButtonProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handlePress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={handlePress}
      style={[styles.button, style]}
    >
      <Ionicons name="arrow-back" size={20} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
});

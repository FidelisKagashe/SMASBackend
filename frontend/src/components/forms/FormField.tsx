import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  placeholder?: string;
  disabled?: boolean;
  right?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  required = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  placeholder,
  disabled = false,
  right,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        label={required ? `${label} *` : label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        error={!!error}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        editable={!disabled}
        right={right}
        style={styles.input}
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
});

export default FormField;
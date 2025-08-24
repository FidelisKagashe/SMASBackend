import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { forgotPassword } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }

    try {
      await dispatch(forgotPassword(email.trim())).unwrap();
      setEmailSent(true);
      Alert.alert(
        t('common.success'),
        t('auth.passwordResetSent'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), error as string);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('auth.resetPassword')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <TextInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              disabled={emailSent}
            />

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleSendResetEmail}
              loading={isLoading}
              disabled={isLoading || emailSent}
              style={styles.sendButton}
              contentStyle={styles.buttonContent}
            >
              Send Reset Link
            </Button>

            {emailSent && (
              <Text style={[styles.successText, { color: theme.colors.success }]}>
                Reset link sent! Check your email.
              </Text>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          {t('common.back')} to Login
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  sendButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  backButton: {
    marginTop: 32,
  },
});

export default ForgotPasswordScreen;
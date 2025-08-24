import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { loginUser, authenticateWithBiometrics } from '../../store/slices/authSlice';
import { authService } from '../../services/auth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const isAvailable = await authService.isBiometricAvailable();
    setBiometricAvailable(isAvailable);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t('common.error'), t('auth.passwordRequired'));
      return;
    }

    try {
      await dispatch(loginUser({ email: email.trim(), password })).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), error as string);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await dispatch(authenticateWithBiometrics()).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), error as string);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialIcons 
            name="store" 
            size={80} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            SMAS App
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('auth.login')}
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
              error={!!error}
            />

            <TextInput
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="password"
              style={styles.input}
              error={!!error}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              {t('auth.loginButton')}
            </Button>

            <Button
              mode="text"
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              {t('auth.forgotPassword')}
            </Button>

            {biometricAvailable && (
              <>
                <Divider style={styles.divider} />
                <Button
                  mode="outlined"
                  onPress={handleBiometricLogin}
                  icon="fingerprint"
                  style={styles.biometricButton}
                  contentStyle={styles.buttonContent}
                >
                  {t('auth.biometricLogin')}
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Don't have an account?
          </Text>
          <Button mode="text" onPress={handleRegister}>
            {t('auth.registerButton')}
          </Button>
        </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
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
  loginButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  forgotButton: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  biometricButton: {
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 16,
  },
});

export default LoginScreen;
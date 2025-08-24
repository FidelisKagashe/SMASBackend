import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../services/auth';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type BiometricSetupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'BiometricSetup'>;

interface Props {
  navigation: BiometricSetupScreenNavigationProp;
}

const BiometricSetupScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const isAvailable = await authService.isBiometricAvailable();
    setBiometricAvailable(isAvailable);

    if (isAvailable) {
      const types = await authService.getBiometricTypes();
      setBiometricTypes(types.map(type => type.toString()));
    }
  };

  const handleEnableBiometric = async () => {
    setIsLoading(true);
    try {
      const success = await authService.enableBiometricAuth();
      if (success) {
        Alert.alert(
          t('common.success'),
          'Biometric authentication has been enabled successfully!',
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(t('common.error'), 'Failed to enable biometric authentication');
      }
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const getBiometricIcon = () => {
    if (biometricTypes.includes('1')) { // FINGERPRINT
      return 'fingerprint';
    } else if (biometricTypes.includes('2')) { // FACIAL_RECOGNITION
      return 'face';
    }
    return 'security';
  };

  const getBiometricDescription = () => {
    if (biometricTypes.includes('1')) {
      return 'Use your fingerprint to quickly and securely access your account.';
    } else if (biometricTypes.includes('2')) {
      return 'Use face recognition to quickly and securely access your account.';
    }
    return 'Use biometric authentication to quickly and securely access your account.';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons 
            name={getBiometricIcon() as any} 
            size={80} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('auth.enableBiometric')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {getBiometricDescription()}
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {biometricAvailable ? (
              <>
                <View style={styles.benefits}>
                  <View style={styles.benefit}>
                    <MaterialIcons 
                      name="speed" 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                    <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                      Quick access
                    </Text>
                  </View>
                  <View style={styles.benefit}>
                    <MaterialIcons 
                      name="security" 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                    <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                      Enhanced security
                    </Text>
                  </View>
                  <View style={styles.benefit}>
                    <MaterialIcons 
                      name="no-accounts" 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                    <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                      No passwords to remember
                    </Text>
                  </View>
                </View>

                <Button
                  mode="contained"
                  onPress={handleEnableBiometric}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.enableButton}
                  contentStyle={styles.buttonContent}
                >
                  {t('auth.enableBiometric')}
                </Button>
              </>
            ) : (
              <View style={styles.unavailable}>
                <MaterialIcons 
                  name="error-outline" 
                  size={48} 
                  color={theme.colors.error} 
                />
                <Text style={[styles.unavailableText, { color: theme.colors.text }]}>
                  Biometric authentication is not available on this device or not set up.
                </Text>
              </View>
            )}

            <Button
              mode="text"
              onPress={handleSkip}
              style={styles.skipButton}
            >
              Skip for now
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  benefits: {
    marginBottom: 32,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 16,
    marginLeft: 12,
  },
  enableButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  skipButton: {
    marginTop: 8,
  },
  unavailable: {
    alignItems: 'center',
    marginBottom: 32,
  },
  unavailableText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});

export default BiometricSetupScreen;
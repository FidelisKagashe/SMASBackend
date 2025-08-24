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

import { useTheme } from '../../hooks/useTheme';
import { SettingsStackParamList } from '../../navigation/MainNavigator';

type ChangePasswordScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'ChangePassword'>;

interface Props {
  navigation: ChangePasswordScreenNavigationProp;
}

const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }
    if (!formData.newPassword) {
      Alert.alert('Error', 'New password is required');
      return false;
    }
    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      Alert.alert(
        'Success',
        'Password changed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Change Password" />
          <Card.Content>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              Please enter your current password and choose a new secure password.
            </Text>

            <TextInput
              label="Current Password *"
              value={formData.currentPassword}
              onChangeText={(value) => handleInputChange('currentPassword', value)}
              mode="outlined"
              secureTextEntry={!showPasswords.current}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPasswords.current ? 'eye-off' : 'eye'}
                  onPress={() => togglePasswordVisibility('current')}
                />
              }
            />

            <TextInput
              label="New Password *"
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange('newPassword', value)}
              mode="outlined"
              secureTextEntry={!showPasswords.new}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPasswords.new ? 'eye-off' : 'eye'}
                  onPress={() => togglePasswordVisibility('new')}
                />
              }
            />

            <TextInput
              label="Confirm New Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showPasswords.confirm}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPasswords.confirm ? 'eye-off' : 'eye'}
                  onPress={() => togglePasswordVisibility('confirm')}
                />
              }
            />

            <View style={styles.passwordRequirements}>
              <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>
                Password Requirements:
              </Text>
              <Text style={[styles.requirement, { color: theme.colors.textSecondary }]}>
                • At least 8 characters long
              </Text>
              <Text style={[styles.requirement, { color: theme.colors.textSecondary }]}>
                • Different from current password
              </Text>
              <Text style={[styles.requirement, { color: theme.colors.textSecondary }]}>
                • Should contain letters and numbers
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleChangePassword}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
        >
          Change Password
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  passwordRequirements: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    marginBottom: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default ChangePasswordScreen;
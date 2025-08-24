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
  Avatar,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { updateUser } from '../../store/slices/authSlice';
import { SettingsStackParamList } from '../../navigation/MainNavigator';

type EditProfileScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'EditProfile'>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(updateUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      })).unwrap();
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Profile Picture */}
        <Card style={[styles.avatarCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={100} 
                label={getUserInitials(formData.name || 'U')}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <Button
                mode="outlined"
                onPress={() => console.log('Change avatar')}
                style={styles.changeAvatarButton}
                icon="camera"
                compact
              >
                Change Photo
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Basic Information" />
          <Card.Content>
            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Email Address *"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Account Information (Read-only) */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Account Information" />
          <Card.Content>
            <TextInput
              label="Role"
              value={user.role.replace('_', ' ').toUpperCase()}
              mode="outlined"
              editable={false}
              style={styles.input}
            />
            
            <TextInput
              label="User ID"
              value={user.id}
              mode="outlined"
              editable={false}
              style={styles.input}
            />

            <TextInput
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString()}
              mode="outlined"
              editable={false}
              style={styles.input}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
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
          onPress={handleSave}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
        >
          Save Changes
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
  avatarCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  changeAvatarButton: {
    marginTop: 16,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
  },
  roleChip: {
    marginTop: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
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

export default EditProfileScreen;
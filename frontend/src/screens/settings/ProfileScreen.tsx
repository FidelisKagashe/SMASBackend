import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Chip,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { SettingsStackParamList } from '../../navigation/MainNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAppSelector(state => state.auth);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'super_admin':
        return theme.colors.error;
      case 'manager':
      case 'shop_owner':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={getUserInitials(user.name)}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>
                  {user.name}
                </Text>
                <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                  {user.email}
                </Text>
                <Chip
                  style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) }]}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {user.role.replace('_', ' ').toUpperCase()}
                </Chip>
              </View>
            </View>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Contact Information" />
          <Card.Content>
            <List.Item
              title="Email"
              description={user.email}
              left={props => <List.Icon {...props} icon="email" />}
            />
            {user.phone && (
              <List.Item
                title="Phone"
                description={user.phone}
                left={props => <List.Icon {...props} icon="phone" />}
              />
            )}
            {user.address && (
              <List.Item
                title="Address"
                description={user.address}
                left={props => <List.Icon {...props} icon="map-marker" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Role & Permissions */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Role & Permissions" />
          <Card.Content>
            <List.Item
              title="Role"
              description={user.role.replace('_', ' ').toUpperCase()}
              left={props => <List.Icon {...props} icon="account-key" />}
              right={() => (
                <Chip
                  style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {user.role.replace('_', ' ').toUpperCase()}
                </Chip>
              )}
            />
            <List.Item
              title="Permissions"
              description={`${user.permissions.length} permissions assigned`}
              left={props => <List.Icon {...props} icon="shield-check" />}
            />
            {user.branchId && (
              <List.Item
                title="Branch"
                description="Primary branch assignment"
                left={props => <List.Icon {...props} icon="store" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Account Status */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Account Status" />
          <Card.Content>
            <List.Item
              title="Account Status"
              description={user.isActive ? 'Active' : 'Inactive'}
              left={props => <List.Icon {...props} icon="account-check" />}
              right={() => (
                <Chip
                  style={[styles.statusChip, { backgroundColor: user.isActive ? theme.colors.success : theme.colors.error }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Chip>
              )}
            />
            <List.Item
              title="Biometric Authentication"
              description={user.preferences.biometricEnabled ? 'Enabled' : 'Disabled'}
              left={props => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Chip
                  style={[styles.statusChip, { backgroundColor: user.preferences.biometricEnabled ? theme.colors.success : theme.colors.textSecondary }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {user.preferences.biometricEnabled ? 'Enabled' : 'Disabled'}
                </Chip>
              )}
            />
          </Card.Content>
        </Card>

        {/* Preferences */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Preferences" />
          <Card.Content>
            <List.Item
              title="Theme"
              description={user.preferences.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              left={props => <List.Icon {...props} icon="palette" />}
            />
            <List.Item
              title="Language"
              description={user.preferences.language === 'en' ? 'English' : 'Swahili'}
              left={props => <List.Icon {...props} icon="translate" />}
            />
            <List.Item
              title="Color Scheme"
              description={user.preferences.colorScheme?.charAt(0).toUpperCase() + user.preferences.colorScheme?.slice(1)}
              left={props => <List.Icon {...props} icon="color-lens" />}
            />
            {user.preferences.defaultBranch && (
              <List.Item
                title="Default Branch"
                description="Primary working branch"
                left={props => <List.Icon {...props} icon="store" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Account Information" />
          <Card.Content>
            <List.Item
              title="Member Since"
              description={new Date(user.createdAt).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar-plus" />}
            />
            <List.Item
              title="Last Updated"
              description={new Date(user.updatedAt).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar-edit" />}
            />
            {user.createdBy && (
              <List.Item
                title="Created By"
                description="System Administrator"
                left={props => <List.Icon {...props} icon="account-supervisor" />}
              />
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('ChangePassword')}
          style={styles.actionButton}
          icon="lock"
        >
          Change Password
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit Profile
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    marginTop: 4,
  },
  roleChip: {
    marginTop: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  editButton: {
    marginTop: 8,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  statusChip: {
    borderRadius: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
  },
});

export default ProfileScreen;
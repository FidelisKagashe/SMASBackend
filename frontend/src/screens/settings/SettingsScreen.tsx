import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  List,
  Switch,
  Button,
  Card,
  Divider,
  Menu,
  Portal,
  Modal,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { setTheme, setLanguage, updatePreferences } from '../../store/slices/settingsSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { ColorPalettes, ColorCombinations } from '../../constants/colors';
import { SettingsStackParamList } from '../../navigation/MainNavigator';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsList'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);
  const { preferences } = useAppSelector(state => state.settings);
  
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    dispatch(setTheme(newTheme));
    setThemeMenuVisible(false);
  };

  const handleLanguageChange = (language: 'en' | 'sw') => {
    dispatch(setLanguage(language));
    setLanguageMenuVisible(false);
  };

  const handleColorSchemeChange = (colorScheme: keyof typeof ColorCombinations) => {
    dispatch(updatePreferences({ colorScheme }));
    setColorModalVisible(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const renderColorOption = (name: keyof typeof ColorCombinations, colors: any) => (
    <Card
      key={name}
      style={[styles.colorCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleColorSchemeChange(name)}
    >
      <Card.Content style={styles.colorCardContent}>
        <View style={styles.colorPreview}>
          <View style={[styles.colorCircle, { backgroundColor: colors.primary }]} />
          <View style={[styles.colorCircle, { backgroundColor: colors.secondary }]} />
          <View style={[styles.colorCircle, { backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.colorName, { color: theme.colors.text }]}>
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </Text>
        {preferences.colorScheme === name && (
          <MaterialIcons name="check" size={20} color={theme.colors.primary} />
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>
                  {user?.name}
                </Text>
                <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                  {user?.email}
                </Text>
                <Text style={[styles.userRole, { color: theme.colors.primary }]}>
                  {user?.role}
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              {t('settings.profile')}
            </Button>
          </Card.Content>
        </Card>

        {/* Appearance Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title={t('settings.preferences')} />
          <Card.Content>
            <List.Item
              title={t('settings.theme')}
              description={preferences.theme === 'light' ? t('settings.lightTheme') : t('settings.darkTheme')}
              left={props => <List.Icon {...props} icon="palette" />}
              right={() => (
                <Menu
                  visible={themeMenuVisible}
                  onDismiss={() => setThemeMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setThemeMenuVisible(true)}
                      compact
                    >
                      {preferences.theme === 'light' ? 'Light' : 'Dark'}
                    </Button>
                  }
                >
                  <Menu.Item onPress={() => handleThemeChange('light')} title="Light" />
                  <Menu.Item onPress={() => handleThemeChange('dark')} title="Dark" />
                </Menu>
              )}
            />
            
            <List.Item
              title={t('settings.language')}
              description={preferences.language === 'en' ? t('settings.english') : t('settings.swahili')}
              left={props => <List.Icon {...props} icon="translate" />}
              right={() => (
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={() => setLanguageMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setLanguageMenuVisible(true)}
                      compact
                    >
                      {preferences.language === 'en' ? 'English' : 'Kiswahili'}
                    </Button>
                  }
                >
                  <Menu.Item onPress={() => handleLanguageChange('en')} title="English" />
                  <Menu.Item onPress={() => handleLanguageChange('sw')} title="Kiswahili" />
                </Menu>
              )}
            />

            <List.Item
              title="Color Scheme"
              description={`${preferences.colorScheme?.charAt(0).toUpperCase()}${preferences.colorScheme?.slice(1)} theme`}
              left={props => <List.Icon {...props} icon="color-lens" />}
              right={() => (
                <Button
                  mode="outlined"
                  onPress={() => setColorModalVisible(true)}
                  compact
                >
                  Change
                </Button>
              )}
            />
          </Card.Content>
        </Card>

        {/* Security Settings */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title={t('settings.security')} />
          <Card.Content>
            <List.Item
              title={t('settings.changePassword')}
              left={props => <List.Icon {...props} icon="lock" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('ChangePassword')}
            />
            
            <List.Item
              title="Biometric Authentication"
              description={preferences.biometricEnabled ? 'Enabled' : 'Disabled'}
              left={props => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={preferences.biometricEnabled}
                  onValueChange={(value) => 
                    dispatch(updatePreferences({ biometricEnabled: value }))
                  }
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title={t('settings.about')} />
          <Card.Content>
            <List.Item
              title={t('settings.version')}
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            
            <List.Item
              title={t('settings.support')}
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            
            <List.Item
              title={t('settings.feedback')}
              left={props => <List.Icon {...props} icon="message" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleLogout}
              icon="logout"
              buttonColor={theme.colors.error}
              style={styles.logoutButton}
            >
              {t('auth.logout')}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Color Scheme Modal */}
      <Portal>
        <Modal
          visible={colorModalVisible}
          onDismiss={() => setColorModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Choose Color Scheme
          </Text>
          <ScrollView style={styles.colorGrid}>
            {Object.entries(ColorCombinations).map(([name, colors]) =>
              renderColorOption(name as keyof typeof ColorCombinations, colors)
            )}
          </ScrollView>
          <Button
            mode="outlined"
            onPress={() => setColorModalVisible(false)}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  profileButton: {
    marginTop: 8,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  logoutButton: {
    marginTop: 8,
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorGrid: {
    maxHeight: 400,
  },
  colorCard: {
    marginBottom: 12,
    elevation: 1,
    borderRadius: 8,
  },
  colorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorPreview: {
    flexDirection: 'row',
    marginRight: 16,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  colorName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: 16,
  },
});

export default SettingsScreen;
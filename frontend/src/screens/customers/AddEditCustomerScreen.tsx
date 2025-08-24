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
  Switch,
  Menu,
  Chip,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { createCustomer, updateCustomer, fetchCustomerById } from '../../store/slices/customersSlice';
import { BusinessStackParamList } from '../../navigation/MainNavigator';
import { Customer } from '../../types';

type AddEditCustomerScreenNavigationProp = StackNavigationProp<BusinessStackParamList, 'AddEditCustomer'>;
type AddEditCustomerScreenRouteProp = RouteProp<BusinessStackParamList, 'AddEditCustomer'>;

interface Props {
  navigation: AddEditCustomerScreenNavigationProp;
  route: AddEditCustomerScreenRouteProp;
}

const AddEditCustomerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { selectedCustomer, isLoading } = useAppSelector(state => state.customers);
  const { user } = useAppSelector(state => state.auth);
  
  const { customerId } = route.params || {};
  const isEditing = !!customerId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    customerType: 'regular' as 'regular' | 'vip' | 'wholesale',
    creditLimit: '',
    isActive: true,
  });

  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  useEffect(() => {
    if (isEditing && customerId) {
      dispatch(fetchCustomerById(customerId));
    }
  }, [dispatch, isEditing, customerId]);

  useEffect(() => {
    if (isEditing && selectedCustomer) {
      setFormData({
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address,
        city: '', // This would be extracted from address if structured
        customerType: selectedCustomer.customerType,
        creditLimit: selectedCustomer.creditLimit.toString(),
        isActive: selectedCustomer.isActive,
      });
    }
  }, [isEditing, selectedCustomer]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (!formData.creditLimit || parseFloat(formData.creditLimit) < 0) {
      Alert.alert('Error', 'Valid credit limit is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const customerData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      customerType: formData.customerType,
      creditLimit: parseFloat(formData.creditLimit),
      balance: 0, // Default balance for new customers
      totalPurchases: 0, // Default for new customers
      lastPurchase: undefined,
      isActive: formData.isActive,
      branchId: user?.branchId || 'default-branch',
    };

    try {
      if (isEditing && customerId) {
        await dispatch(updateCustomer({ id: customerId, data: customerData })).unwrap();
        Alert.alert('Success', 'Customer updated successfully');
      } else {
        await dispatch(createCustomer(customerData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>)).unwrap();
        Alert.alert('Success', 'Customer created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  const customerTypes = [
    { label: 'Regular', value: 'regular' },
    { label: 'VIP', value: 'vip' },
    { label: 'Wholesale', value: 'wholesale' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Basic Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Basic Information" />
          <Card.Content>
            <TextInput
              label="Customer Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Address Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Address Information" />
          <Card.Content>
            <TextInput
              label="Address *"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
            />
            
            <TextInput
              label="City"
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Customer Classification */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Customer Classification" />
          <Card.Content>
            <Menu
              visible={typeMenuVisible}
              onDismiss={() => setTypeMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setTypeMenuVisible(true)}
                  icon="account-star"
                  style={styles.typeButton}
                >
                  {formData.customerType.charAt(0).toUpperCase() + formData.customerType.slice(1)}
                </Button>
              }
            >
              {customerTypes.map(type => (
                <Menu.Item
                  key={type.value}
                  onPress={() => {
                    handleInputChange('customerType', type.value);
                    setTypeMenuVisible(false);
                  }}
                  title={type.label}
                />
              ))}
            </Menu>

            <TextInput
              label="Credit Limit *"
              value={formData.creditLimit}
              onChangeText={(value) => handleInputChange('creditLimit', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                Active Customer
              </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
              />
            </View>
            <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
              Inactive customers won't appear in sales
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Save Button */}
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
          {isEditing ? 'Update Customer' : 'Create Customer'}
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
  sectionCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
  },
  typeButton: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 12,
    fontStyle: 'italic',
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

export default AddEditCustomerScreen;
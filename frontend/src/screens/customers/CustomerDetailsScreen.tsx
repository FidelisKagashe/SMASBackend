import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  IconButton,
  Menu,
  Avatar,
  List,
  Divider,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchCustomerById, deleteCustomer } from '../../store/slices/customersSlice';
import { BusinessStackParamList } from '../../navigation/MainNavigator';

type CustomerDetailsScreenNavigationProp = StackNavigationProp<BusinessStackParamList, 'CustomerDetails'>;
type CustomerDetailsScreenRouteProp = RouteProp<BusinessStackParamList, 'CustomerDetails'>;

interface Props {
  navigation: CustomerDetailsScreenNavigationProp;
  route: CustomerDetailsScreenRouteProp;
}

const CustomerDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { selectedCustomer, isLoading } = useAppSelector(state => state.customers);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const { customerId } = route.params;

  useEffect(() => {
    dispatch(fetchCustomerById(customerId));
  }, [dispatch, customerId]);

  const handleEdit = () => {
    navigation.navigate('AddEditCustomer', { customerId });
    setMenuVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCustomer(customerId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error as string);
            }
          },
        },
      ]
    );
    setMenuVisible(false);
  };

  const handleCall = () => {
    if (selectedCustomer?.phone) {
      Linking.openURL(`tel:${selectedCustomer.phone}`);
    }
    setMenuVisible(false);
  };

  const handleEmail = () => {
    if (selectedCustomer?.email) {
      Linking.openURL(`mailto:${selectedCustomer.email}`);
    }
    setMenuVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return theme.colors.warning;
      case 'wholesale': return theme.colors.info;
      case 'regular': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!selectedCustomer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading customer details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Customer Header */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.customerHeader}>
              <Avatar.Text 
                size={80} 
                label={getCustomerInitials(selectedCustomer.name)}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: theme.colors.text }]}>
                  {selectedCustomer.name}
                </Text>
                <Text style={[styles.customerEmail, { color: theme.colors.textSecondary }]}>
                  {selectedCustomer.email}
                </Text>
                <Text style={[styles.customerPhone, { color: theme.colors.textSecondary }]}>
                  {selectedCustomer.phone}
                </Text>
                <Chip
                  style={[styles.typeChip, { backgroundColor: getCustomerTypeColor(selectedCustomer.customerType) }]}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {selectedCustomer.customerType.toUpperCase()}
                </Chip>
              </View>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
                <Menu.Item onPress={handleCall} title="Call" leadingIcon="phone" />
                <Menu.Item onPress={handleEmail} title="Email" leadingIcon="email" />
                <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
              </Menu>
            </View>
          </Card.Content>
        </Card>

        {/* Financial Summary */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Financial Summary" />
          <Card.Content>
            <View style={styles.financialStats}>
              <View style={styles.financialItem}>
                <Text style={[styles.financialValue, { color: theme.colors.success }]}>
                  {formatCurrency(selectedCustomer.totalPurchases)}
                </Text>
                <Text style={[styles.financialLabel, { color: theme.colors.textSecondary }]}>
                  Total Purchases
                </Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={[styles.financialValue, { color: selectedCustomer.balance > 0 ? theme.colors.warning : theme.colors.text }]}>
                  {formatCurrency(selectedCustomer.balance)}
                </Text>
                <Text style={[styles.financialLabel, { color: theme.colors.textSecondary }]}>
                  Current Balance
                </Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={[styles.financialValue, { color: theme.colors.info }]}>
                  {formatCurrency(selectedCustomer.creditLimit)}
                </Text>
                <Text style={[styles.financialLabel, { color: theme.colors.textSecondary }]}>
                  Credit Limit
                </Text>
              </View>
            </View>

            {selectedCustomer.balance > 0 && (
              <View style={styles.balanceAlert}>
                <MaterialIcons name="warning" size={20} color={theme.colors.warning} />
                <Text style={[styles.balanceText, { color: theme.colors.warning }]}>
                  Customer has outstanding balance
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Contact Information" />
          <Card.Content>
            <List.Item
              title="Email"
              description={selectedCustomer.email}
              left={props => <List.Icon {...props} icon="email" />}
              right={() => (
                <IconButton
                  icon="open-in-new"
                  onPress={handleEmail}
                />
              )}
            />
            <List.Item
              title="Phone"
              description={selectedCustomer.phone}
              left={props => <List.Icon {...props} icon="phone" />}
              right={() => (
                <IconButton
                  icon="phone"
                  onPress={handleCall}
                />
              )}
            />
            <List.Item
              title="Address"
              description={selectedCustomer.address}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Account Information" />
          <Card.Content>
            <List.Item
              title="Customer Type"
              description={selectedCustomer.customerType.toUpperCase()}
              left={props => <List.Icon {...props} icon="account-star" />}
              right={() => (
                <Chip
                  style={[styles.typeChip, { backgroundColor: getCustomerTypeColor(selectedCustomer.customerType) }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {selectedCustomer.customerType.toUpperCase()}
                </Chip>
              )}
            />
            <List.Item
              title="Status"
              description={selectedCustomer.isActive ? 'Active' : 'Inactive'}
              left={props => <List.Icon {...props} icon="account-check" />}
              right={() => (
                <Chip
                  style={[styles.statusChip, { backgroundColor: selectedCustomer.isActive ? theme.colors.success : theme.colors.error }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                </Chip>
              )}
            />
            {selectedCustomer.lastPurchase && (
              <List.Item
                title="Last Purchase"
                description={new Date(selectedCustomer.lastPurchase).toLocaleDateString()}
                left={props => <List.Icon {...props} icon="calendar" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="plus"
                style={styles.actionButton}
                onPress={() => console.log('New sale for customer')}
              >
                New Sale
              </Button>
              <Button
                mode="outlined"
                icon="history"
                style={styles.actionButton}
                onPress={() => console.log('View purchase history')}
              >
                Purchase History
              </Button>
              <Button
                mode="outlined"
                icon="message"
                style={styles.actionButton}
                onPress={() => console.log('Send message')}
              >
                Send Message
              </Button>
              <Button
                mode="outlined"
                icon="account-cash"
                style={styles.actionButton}
                onPress={() => console.log('Record payment')}
              >
                Record Payment
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Record Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Record Information" />
          <Card.Content>
            <List.Item
              title="Created"
              description={new Date(selectedCustomer.createdAt).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar-plus" />}
            />
            <List.Item
              title="Last Updated"
              description={new Date(selectedCustomer.updatedAt).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar-edit" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={handleCall}
          style={styles.bottomActionButton}
          icon="phone"
        >
          Call
        </Button>
        <Button
          mode="contained"
          onPress={handleEdit}
          style={styles.bottomActionButton}
          icon="pencil"
        >
          Edit Customer
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
  sectionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  customerEmail: {
    fontSize: 16,
    marginTop: 4,
  },
  customerPhone: {
    fontSize: 16,
    marginTop: 2,
  },
  typeChip: {
    marginTop: 8,
    borderRadius: 12,
  },
  statusChip: {
    borderRadius: 12,
  },
  financialStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  financialItem: {
    alignItems: 'center',
    flex: 1,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  financialLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  balanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  balanceText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  bottomActionButton: {
    flex: 1,
  },
});

export default CustomerDetailsScreen;
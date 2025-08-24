import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  FAB,
  Chip,
  Menu,
  Button,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchCustomers, setSearchQuery, setTypeFilter } from '../../store/slices/customersSlice';
import { BusinessStackParamList } from '../../navigation/MainNavigator';
import { Customer } from '../../types';

type CustomersScreenNavigationProp = StackNavigationProp<BusinessStackParamList, 'CustomersList'>;

interface Props {
  navigation: CustomersScreenNavigationProp;
}

const CustomersScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const { 
    customers, 
    isLoading, 
    searchQuery, 
    typeFilter 
  } = useAppSelector(state => state.customers);

  const [refreshing, setRefreshing] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCustomers());
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleCustomerPress = (customerId: string) => {
    navigation.navigate('CustomerDetails', { customerId });
  };

  const handleAddCustomer = () => {
    navigation.navigate('AddEditCustomer', {});
  };

  const handleTypeFilter = (type: string | null) => {
    dispatch(setTypeFilter(type));
    setTypeMenuVisible(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || customer.customerType === typeFilter;
    return matchesSearch && matchesType;
  });

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

  const renderCustomer = ({ item }: { item: Customer }) => (
    <Card 
      style={[styles.customerCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleCustomerPress(item.id)}
    >
      <Card.Content>
        <View style={styles.customerHeader}>
          <Avatar.Text 
            size={48} 
            label={getCustomerInitials(item.name)}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.customerInfo}>
            <Text style={[styles.customerName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.customerEmail, { color: theme.colors.textSecondary }]}>
              {item.email}
            </Text>
            <Text style={[styles.customerPhone, { color: theme.colors.textSecondary }]}>
              {item.phone}
            </Text>
          </View>
          <View style={styles.customerActions}>
            <Chip
              style={[styles.typeChip, { backgroundColor: getCustomerTypeColor(item.customerType) }]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.customerType.toUpperCase()}
            </Chip>
            <IconButton
              icon="phone"
              size={20}
              onPress={() => console.log('Call customer')}
            />
          </View>
        </View>
        
        <View style={styles.customerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatCurrency(item.totalPurchases)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Purchases
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: item.balance > 0 ? theme.colors.warning : theme.colors.text }]}>
              {formatCurrency(item.balance)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Balance
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.info }]}>
              {formatCurrency(item.creditLimit)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Credit Limit
            </Text>
          </View>
        </View>

        {item.lastPurchase && (
          <Text style={[styles.lastPurchase, { color: theme.colors.textSecondary }]}>
            Last purchase: {new Date(item.lastPurchase).toLocaleDateString()}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Regular', value: 'regular' },
    { label: 'VIP', value: 'vip' },
    { label: 'Wholesale', value: 'wholesale' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('customers.searchCustomers')}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setTypeMenuVisible(true)}
              icon="filter-variant"
              style={styles.filterButton}
            >
              {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'All Types'}
            </Button>
          }
        >
          {typeOptions.map(option => (
            <Menu.Item
              key={option.label}
              onPress={() => handleTypeFilter(option.value)}
              title={option.label}
            />
          ))}
        </Menu>
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first customer to get started'}
            </Text>
          </View>
        }
      />

      {/* Add Customer FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddCustomer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 0,
  },
  filterButton: {
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  customerCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  customerActions: {
    alignItems: 'center',
  },
  typeChip: {
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  lastPurchase: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CustomersScreen;
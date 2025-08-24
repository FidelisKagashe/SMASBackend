import React, { useState } from 'react';
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
  List,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { SalesStackParamList } from '../../navigation/MainNavigator';
import { Order } from '../../types';

type OrdersScreenNavigationProp = StackNavigationProp<SalesStackParamList, 'Orders'>;

interface Props {
  navigation: OrdersScreenNavigationProp;
}

const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      saleNumber: 'ORD-001',
      customerId: 'customer-1',
      customer: {
        id: 'customer-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        customerType: 'regular',
        creditLimit: 1000,
        balance: 0,
        totalPurchases: 5000,
        isActive: true,
        branchId: 'branch-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      products: [],
      subtotal: 100,
      tax: 18,
      discount: 0,
      total: 118,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      amountPaid: 0,
      change: 0,
      status: 'pending',
      type: 'order',
      deliveryDate: '2024-01-20',
      deliveryAddress: '123 Main St',
      isConverted: false,
      branchId: 'branch-1',
      createdBy: 'user-1',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch orders from API
    setRefreshing(false);
  };

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  const handleAddOrder = () => {
    navigation.navigate('AddEditOrder', {});
    setShowQuickActions(false);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    setStatusMenuVisible(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card 
      style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleOrderPress(item.id)}
    >
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
              {item.saleNumber}
            </Text>
            <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={{ color: 'white', fontSize: 10 }}
          >
            {item.status}
          </Chip>
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={[styles.customerName, { color: theme.colors.text }]}>
            Customer: {item.customer?.name || 'Walk-in Customer'}
          </Text>
          {item.deliveryDate && (
            <Text style={[styles.deliveryDate, { color: theme.colors.textSecondary }]}>
              Delivery: {new Date(item.deliveryDate).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        <View style={styles.orderFooter}>
          <View style={styles.conversionInfo}>
            {item.isConverted ? (
              <Chip
                style={[styles.convertedChip, { backgroundColor: theme.colors.success }]}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                Converted to Sale
              </Chip>
            ) : (
              <Chip
                style={[styles.pendingChip, { backgroundColor: theme.colors.warning }]}
                textStyle={{ color: 'white', fontSize: 10 }}
              >
                Pending Conversion
              </Chip>
            )}
          </View>
          <Text style={[styles.orderTotal, { color: theme.colors.primary }]}>
            {formatCurrency(item.total)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={[styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Title title="Order Management" />
      <Card.Content>
        <List.Item
          title="New Order"
          description="Create a new customer order"
          left={props => <List.Icon {...props} icon="plus" />}
          onPress={handleAddOrder}
        />
        <List.Item
          title="Convert to Sales"
          description="Convert pending orders to sales"
          left={props => <List.Icon {...props} icon="swap-horizontal" />}
          onPress={() => console.log('Convert orders')}
        />
      </Card.Content>
    </Card>
  );

  const statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search orders..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filtersContainer}>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setStatusMenuVisible(true)}
                icon="filter-variant"
                style={styles.filterButton}
              >
                {statusFilter || 'All Status'}
              </Button>
            }
          >
            {statusOptions.map(option => (
              <Menu.Item
                key={option.label}
                onPress={() => handleStatusFilter(option.value)}
                title={option.label}
              />
            ))}
          </Menu>
        </View>

        <Button
          mode="outlined"
          icon="menu"
          onPress={() => setShowQuickActions(!showQuickActions)}
          style={styles.quickActionsButton}
        >
          Quick Actions
        </Button>
      </View>

      {/* Quick Actions */}
      {showQuickActions && renderQuickActions()}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="clipboard-list" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No orders found' : 'No orders yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first order to get started'}
            </Text>
          </View>
        }
      />

      {/* Add Order FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddOrder}
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
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
  },
  quickActionsButton: {
    marginTop: 8,
  },
  quickActionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusChip: {
    height: 24,
    borderRadius: 12,
  },
  orderDetails: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    marginBottom: 2,
  },
  deliveryDate: {
    fontSize: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversionInfo: {
    flex: 1,
  },
  convertedChip: {
    height: 20,
    borderRadius: 10,
  },
  pendingChip: {
    height: 20,
    borderRadius: 10,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
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

export default OrdersScreen;
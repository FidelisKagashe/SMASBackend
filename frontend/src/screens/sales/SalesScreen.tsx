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
  List,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchSales, setSearchQuery, setStatusFilter, setDateFilter } from '../../store/slices/salesSlice';
import { SalesStackParamList } from '../../navigation/MainNavigator';
import { Sale } from '../../types';

type SalesScreenNavigationProp = StackNavigationProp<SalesStackParamList, 'SalesList'>;

interface Props {
  navigation: SalesScreenNavigationProp;
}

const SalesScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const { 
    sales, 
    isLoading, 
    searchQuery, 
    statusFilter, 
    dateFilter 
  } = useAppSelector(state => state.sales);

  const [refreshing, setRefreshing] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [dateMenuVisible, setDateMenuVisible] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSales());
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleSalePress = (saleId: string) => {
    navigation.navigate('SaleDetails', { saleId });
  };

  const handleAddSale = () => {
    navigation.navigate('AddEditSale', {});
    setShowQuickActions(false);
  };

  const handleOrders = () => {
    navigation.navigate('Orders');
    setShowQuickActions(false);
  };

  const handleProformaInvoices = () => {
    navigation.navigate('ProformaInvoices');
    setShowQuickActions(false);
  };

  const handleInvoices = () => {
    navigation.navigate('Invoices');
    setShowQuickActions(false);
  };

  const handleStatusFilter = (status: string | null) => {
    dispatch(setStatusFilter(status));
    setStatusMenuVisible(false);
  };

  const handleDateFilter = (filter: string) => {
    const today = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;

    switch (filter) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = startDate;
        break;
      case 'week':
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        startDate = weekStart.toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
        break;
      default:
        startDate = null;
        endDate = null;
    }

    dispatch(setDateFilter({ startDate, endDate }));
    setDateMenuVisible(false);
  };

  // Filter and sort sales
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.saleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || sale.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter.startDate && dateFilter.endDate) {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      matchesDate = saleDate >= dateFilter.startDate && saleDate <= dateFilter.endDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
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

  const renderSale = ({ item }: { item: Sale }) => (
    <Card 
      style={[styles.saleCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleSalePress(item.id)}
    >
      <Card.Content>
        <View style={styles.saleHeader}>
          <View style={styles.saleInfo}>
            <Text style={[styles.saleNumber, { color: theme.colors.text }]}>
              Sale #{item.saleNumber}
            </Text>
            <Text style={[styles.saleDate, { color: theme.colors.textSecondary }]}>
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
        
        <View style={styles.saleDetails}>
          <Text style={[styles.customerName, { color: theme.colors.text }]}>
            Customer: {item.customer?.name || 'Walk-in Customer'}
          </Text>
          <Text style={[styles.productCount, { color: theme.colors.textSecondary }]}>
            {item.products.length} item(s)
          </Text>
        </View>
        
        <View style={styles.saleFooter}>
          <View style={styles.paymentInfo}>
            <Text style={[styles.paymentMethod, { color: theme.colors.textSecondary }]}>
              {item.paymentMethod}
            </Text>
            <Text style={[styles.paymentStatus, { color: getStatusColor(item.paymentStatus) }]}>
              {item.paymentStatus}
            </Text>
          </View>
          <Text style={[styles.saleTotal, { color: theme.colors.primary }]}>
            {formatCurrency(item.total)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={[styles.quickActionsCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Title title="Sales Management" />
      <Card.Content>
        <List.Item
          title="New Sale"
          description="Create a new sale transaction"
          left={props => <List.Icon {...props} icon="plus" />}
          onPress={handleAddSale}
        />
        <List.Item
          title="Orders"
          description="Manage customer orders"
          left={props => <List.Icon {...props} icon="clipboard-list" />}
          onPress={handleOrders}
        />
        <List.Item
          title="Proforma Invoices"
          description="Create and manage proforma invoices"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={handleProformaInvoices}
        />
        <List.Item
          title="Invoices"
          description="View confirmed invoices"
          left={props => <List.Icon {...props} icon="receipt" />}
          onPress={handleInvoices}
        />
      </Card.Content>
    </Card>
  );

  const statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Completed', value: 'completed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const dateOptions = [
    { label: 'All Dates', value: null },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('sales.searchSales')}
          onChangeText={handleSearch}
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

          <Menu
            visible={dateMenuVisible}
            onDismiss={() => setDateMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setDateMenuVisible(true)}
                icon="calendar"
                style={styles.filterButton}
              >
                {dateFilter.startDate ? 'Filtered' : 'All Dates'}
              </Button>
            }
          >
            {dateOptions.map(option => (
              <Menu.Item
                key={option.label}
                onPress={() => handleDateFilter(option.value || '')}
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

      {/* Sales List */}
      <FlatList
        data={filteredSales}
        renderItem={renderSale}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="point-of-sale" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No sales found' : 'No sales yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first sale to get started'}
            </Text>
          </View>
        }
      />

      {/* Add Sale FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddSale}
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
  saleCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  saleInfo: {
    flex: 1,
  },
  saleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saleDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusChip: {
    height: 24,
    borderRadius: 12,
  },
  saleDetails: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    marginBottom: 2,
  },
  productCount: {
    fontSize: 12,
  },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  saleTotal: {
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

export default SalesScreen;
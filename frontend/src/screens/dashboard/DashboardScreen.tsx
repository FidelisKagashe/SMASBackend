import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  FAB,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchSales } from '../../store/slices/salesSlice';
import { fetchCustomers } from '../../store/slices/customersSlice';
import { syncData, getSyncStatus } from '../../store/slices/syncSlice';

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);
  const { products } = useAppSelector(state => state.products);
  const { sales } = useAppSelector(state => state.sales);
  const { customers } = useAppSelector(state => state.customers);
  const { isOnline, isSyncing, pendingChanges, lastSync } = useAppSelector(state => state.sync);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboardData();
    dispatch(getSyncStatus());
  }, [dispatch]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchProducts()),
        dispatch(fetchSales()),
        dispatch(fetchCustomers()),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (isOnline) {
      await dispatch(syncData());
    }
    setRefreshing(false);
  };

  const handleSync = () => {
    if (isOnline) {
      dispatch(syncData());
    }
  };

  // Calculate dashboard metrics
  const todaySales = sales.filter(sale => {
    const today = new Date().toDateString();
    const saleDate = new Date(sale.createdAt).toDateString();
    return saleDate === today && sale.status === 'completed';
  });

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockProducts = products.filter(product => product.stock < 10);
  const recentSales = sales.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
            {t('dashboard.welcome')}, {user?.name}!
          </Text>
          
          {/* Sync Status */}
          <View style={styles.syncStatus}>
            <Chip
              icon={isOnline ? 'wifi' : 'wifi-off'}
              style={[
                styles.statusChip,
                { backgroundColor: isOnline ? theme.colors.success : theme.colors.error }
              ]}
              textStyle={{ color: 'white' }}
            >
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </Chip>
            
            {pendingChanges > 0 && (
              <Chip
                icon="sync"
                style={[styles.statusChip, { backgroundColor: theme.colors.warning }]}
                textStyle={{ color: 'white' }}
                onPress={handleSync}
              >
                {pendingChanges} pending
              </Chip>
            )}
          </View>
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="attach-money" size={32} color={theme.colors.success} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {formatCurrency(todayRevenue)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.todaySales')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="inventory" size={32} color={theme.colors.primary} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {products.length}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.totalProducts')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="people" size={32} color={theme.colors.secondary} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {customers.length}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.totalCustomers')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="warning" size={32} color={theme.colors.warning} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {lowStockProducts.length}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.lowStock')}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Quick Actions */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title={t('dashboard.quickActions')} />
          <Card.Content>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="plus"
                style={styles.actionButton}
                onPress={() => {}}
              >
                {t('dashboard.addSale')}
              </Button>
              <Button
                mode="outlined"
                icon="plus"
                style={styles.actionButton}
                onPress={() => {}}
              >
                {t('dashboard.addProduct')}
              </Button>
              <Button
                mode="outlined"
                icon="plus"
                style={styles.actionButton}
                onPress={() => {}}
              >
                {t('dashboard.addCustomer')}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Sales */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title={t('dashboard.recentSales')} />
          <Card.Content>
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <View key={sale.id} style={styles.saleItem}>
                  <View style={styles.saleInfo}>
                    <Text style={[styles.saleId, { color: theme.colors.text }]}>
                      Sale #{sale.id.slice(-6)}
                    </Text>
                    <Text style={[styles.saleDate, { color: theme.colors.textSecondary }]}>
                      {formatDate(sale.createdAt)}
                    </Text>
                  </View>
                  <Text style={[styles.saleAmount, { color: theme.colors.success }]}>
                    {formatCurrency(sale.total)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No recent sales
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Title 
              title={t('dashboard.lowStock')} 
              left={(props) => <MaterialIcons {...props} name="warning" color={theme.colors.warning} />}
            />
            <Card.Content>
              {lowStockProducts.slice(0, 5).map((product) => (
                <View key={product.id} style={styles.stockItem}>
                  <Text style={[styles.productName, { color: theme.colors.text }]}>
                    {product.name}
                  </Text>
                  <Text style={[styles.stockLevel, { color: theme.colors.warning }]}>
                    {product.stock} left
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Sync Info */}
        {lastSync && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.syncInfo, { color: theme.colors.textSecondary }]}>
                {t('sync.lastSyncTime', { time: formatDate(lastSync) })}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Sync FAB */}
      {isOnline && pendingChanges > 0 && (
        <FAB
          icon="sync"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleSync}
          loading={isSyncing}
        />
      )}
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  syncStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    borderRadius: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    borderRadius: 12,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    marginLeft: 12,
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionCard: {
    margin: 10,
    elevation: 2,
    borderRadius: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  saleInfo: {
    flex: 1,
  },
  saleId: {
    fontSize: 16,
    fontWeight: '500',
  },
  saleDate: {
    fontSize: 12,
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productName: {
    fontSize: 16,
    flex: 1,
  },
  stockLevel: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  syncInfo: {
    textAlign: 'center',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
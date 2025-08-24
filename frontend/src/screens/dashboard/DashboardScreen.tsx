import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  FAB,
  Menu,
  Divider,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchSales } from '../../store/slices/salesSlice';
import { fetchCustomers } from '../../store/slices/customersSlice';
import { syncData, getSyncStatus } from '../../store/slices/syncSlice';
import { DashboardMetrics } from '../../types';

const screenWidth = Dimensions.get('window').width;

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
  const [selectedChart, setSelectedChart] = React.useState<'sales' | 'expenses' | 'revenue' | 'customers'>('sales');
  const [chartMenuVisible, setChartMenuVisible] = React.useState(false);
  const [dashboardMetrics, setDashboardMetrics] = React.useState<DashboardMetrics | null>(null);

  useEffect(() => {
    loadDashboardData();
    dispatch(getSyncStatus());
    loadDashboardMetrics();
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

  const loadDashboardMetrics = async () => {
    // This would typically fetch from API
    // For now, we'll calculate from existing data
    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt).toDateString();
      return saleDate === today && sale.status === 'completed';
    });
    
    const weekSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= thisWeek && sale.status === 'completed';
    });
    
    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= thisMonth && sale.status === 'completed';
    });
    
    const metrics: DashboardMetrics = {
      sales: {
        today: todaySales.reduce((sum, sale) => sum + sale.total, 0),
        thisWeek: weekSales.reduce((sum, sale) => sum + sale.total, 0),
        thisMonth: monthSales.reduce((sum, sale) => sum + sale.total, 0),
        growth: 15.5, // This would be calculated from historical data
      },
      debtors: {
        total: 25000, // This would come from debt records
        overdue: 5000,
        count: 12,
      },
      expenses: {
        today: 2500, // This would come from expense records
        thisMonth: 45000,
        budget: 50000,
      },
      creditors: {
        total: 18000, // This would come from supplier balances
        overdue: 3000,
        count: 8,
      },
      services: {
        completed: 25, // This would come from service records
        pending: 8,
        revenue: 12000,
      },
      payments: {
        received: 35000, // This would come from payment records
        paid: 28000,
        pending: 7000,
      },
    };
    
    setDashboardMetrics(metrics);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    await loadDashboardMetrics();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getChartData = () => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    switch (selectedChart) {
      case 'sales':
        return {
          labels,
          datasets: [{
            data: [2000, 4500, 2800, 8000, 9900, 4300, 6700],
            color: (opacity = 1) => `rgba(49, 130, 206, ${opacity})`,
            strokeWidth: 2,
          }],
        };
      case 'expenses':
        return {
          labels,
          datasets: [{
            data: [1200, 1900, 3000, 5000, 2000, 3000, 2500],
            color: (opacity = 1) => `rgba(245, 101, 101, ${opacity})`,
            strokeWidth: 2,
          }],
        };
      case 'revenue':
        return {
          labels,
          datasets: [{
            data: [800, 2600, -200, 3000, 7900, 1300, 4200],
            color: (opacity = 1) => `rgba(56, 161, 105, ${opacity})`,
            strokeWidth: 2,
          }],
        };
      case 'customers':
        return {
          labels,
          datasets: [{
            data: [12, 19, 15, 25, 22, 18, 24],
            color: (opacity = 1) => `rgba(128, 90, 213, ${opacity})`,
            strokeWidth: 2,
          }],
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(49, 130, 206, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  if (!dashboardMetrics) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  const lowStockProducts = products.filter(product => product.stock < 10);
  const recentSales = sales.slice(0, 5);

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
                  {formatCurrency(dashboardMetrics.sales.today)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.todaySales')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="account-balance-wallet" size={32} color={theme.colors.warning} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {formatCurrency(dashboardMetrics.debtors.total)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Debtors ({dashboardMetrics.debtors.count})
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="trending-down" size={32} color={theme.colors.error} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {formatCurrency(dashboardMetrics.expenses.today)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Today's Expenses
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="payment" size={32} color={theme.colors.info} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {formatCurrency(dashboardMetrics.creditors.total)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Creditors ({dashboardMetrics.creditors.count})
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="build" size={32} color={theme.colors.secondary} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {dashboardMetrics.services.completed}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Services Completed
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialIcons name="account-balance" size={32} color={theme.colors.primary} />
              <View style={styles.metricText}>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                  {formatCurrency(dashboardMetrics.payments.received)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                  Payments Received
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Chart Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title 
            title="Analytics Chart"
            right={() => (
              <Menu
                visible={chartMenuVisible}
                onDismiss={() => setChartMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setChartMenuVisible(true)}
                    icon="chart-line"
                    style={styles.chartMenuButton}
                  >
                    {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)}
                  </Button>
                }
              >
                <Menu.Item onPress={() => { setSelectedChart('sales'); setChartMenuVisible(false); }} title="Sales" />
                <Menu.Item onPress={() => { setSelectedChart('expenses'); setChartMenuVisible(false); }} title="Expenses" />
                <Menu.Item onPress={() => { setSelectedChart('revenue'); setChartMenuVisible(false); }} title="Revenue" />
                <Menu.Item onPress={() => { setSelectedChart('customers'); setChartMenuVisible(false); }} title="Customers" />
              </Menu>
            )}
          />
          <Card.Content>
            <LineChart
              data={getChartData()}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>

        {/* Metrics Overview Cards */}
        <View style={styles.metricsContainer}>
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
              <Button
                mode="outlined"
                icon="plus"
                style={styles.actionButton}
                onPress={() => {}}
              >
                New Expense
              </Button>
              <Button
                mode="outlined"
                icon="plus"
                style={styles.actionButton}
                onPress={() => {}}
              >
                New Purchase
              </Button>
              <Button
                mode="outlined"
                icon="analytics"
                style={styles.actionButton}
                onPress={() => {}}
              >
                View Reports
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  chartMenuButton: {
    marginRight: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
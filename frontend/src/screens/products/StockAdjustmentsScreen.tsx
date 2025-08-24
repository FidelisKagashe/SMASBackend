import React, { useState, useEffect } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { StockAdjustment } from '../../types';

const StockAdjustmentsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([
    {
      id: '1',
      productId: 'product-1',
      type: 'increase',
      quantity: 50,
      reason: 'New stock received',
      notes: 'Supplier delivery',
      branchId: 'branch-1',
      createdBy: 'user-1',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      productId: 'product-2',
      type: 'decrease',
      quantity: 5,
      reason: 'Damaged goods',
      notes: 'Water damage during storage',
      branchId: 'branch-1',
      createdBy: 'user-2',
      createdAt: '2024-01-14T14:20:00Z',
    },
    {
      id: '3',
      productId: 'product-3',
      type: 'correction',
      quantity: 10,
      reason: 'Stock count correction',
      notes: 'Physical count discrepancy',
      branchId: 'branch-1',
      createdBy: 'user-1',
      createdAt: '2024-01-13T09:15:00Z',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch adjustments from API
    setRefreshing(false);
  };

  const handleAddAdjustment = () => {
    // Navigate to add adjustment screen
    console.log('Add new adjustment');
  };

  const handleTypeFilter = (type: string | null) => {
    setTypeFilter(type);
    setTypeMenuVisible(false);
  };

  const filteredAdjustments = adjustments.filter(adjustment => {
    const matchesSearch = adjustment.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adjustment.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || adjustment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getAdjustmentIcon = (type: string) => {
    switch (type) {
      case 'increase': return 'trending-up';
      case 'decrease': return 'trending-down';
      case 'correction': return 'tune';
      default: return 'help';
    }
  };

  const getAdjustmentColor = (type: string) => {
    switch (type) {
      case 'increase': return theme.colors.success;
      case 'decrease': return theme.colors.error;
      case 'correction': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const renderAdjustment = ({ item }: { item: StockAdjustment }) => (
    <Card style={[styles.adjustmentCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.adjustmentHeader}>
          <View style={styles.adjustmentInfo}>
            <View style={styles.adjustmentTitle}>
              <MaterialIcons 
                name={getAdjustmentIcon(item.type) as any} 
                size={20} 
                color={getAdjustmentColor(item.type)} 
              />
              <Text style={[styles.adjustmentReason, { color: theme.colors.text }]}>
                {item.reason}
              </Text>
            </View>
            <Text style={[styles.adjustmentDate, { color: theme.colors.textSecondary }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Chip
            style={[
              styles.quantityChip,
              { backgroundColor: getAdjustmentColor(item.type) }
            ]}
            textStyle={{ color: 'white' }}
          >
            {item.type === 'increase' ? '+' : item.type === 'decrease' ? '-' : '±'}{item.quantity}
          </Chip>
        </View>

        {item.notes && (
          <Text style={[styles.adjustmentNotes, { color: theme.colors.textSecondary }]}>
            {item.notes}
          </Text>
        )}

        <View style={styles.adjustmentFooter}>
          <Text style={[styles.productInfo, { color: theme.colors.textSecondary }]}>
            Product ID: {item.productId}
          </Text>
          <Text style={[styles.createdBy, { color: theme.colors.textSecondary }]}>
            By: {item.createdBy}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const adjustmentTypes = [
    { label: 'All Types', value: null },
    { label: 'Increase', value: 'increase' },
    { label: 'Decrease', value: 'decrease' },
    { label: 'Correction', value: 'correction' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search adjustments..."
          onChangeText={setSearchQuery}
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
          {adjustmentTypes.map(type => (
            <Menu.Item
              key={type.label}
              onPress={() => handleTypeFilter(type.value)}
              title={type.label}
            />
          ))}
        </Menu>
      </View>

      {/* Adjustments List */}
      <FlatList
        data={filteredAdjustments}
        renderItem={renderAdjustment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="tune" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No adjustments found' : 'No stock adjustments yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Try adjusting your search' : 'Stock adjustments will appear here'}
            </Text>
          </View>
        }
      />

      {/* Add Adjustment FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddAdjustment}
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
  adjustmentCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  adjustmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  adjustmentInfo: {
    flex: 1,
    marginRight: 8,
  },
  adjustmentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adjustmentReason: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  adjustmentDate: {
    fontSize: 12,
  },
  quantityChip: {
    borderRadius: 16,
  },
  adjustmentNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  adjustmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    fontSize: 12,
  },
  createdBy: {
    fontSize: 12,
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

export default StockAdjustmentsScreen;
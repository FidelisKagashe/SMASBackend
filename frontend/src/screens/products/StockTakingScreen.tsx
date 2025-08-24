import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  Searchbar,
  Chip,
  FAB,
  IconButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts } from '../../store/slices/productsSlice';
import { Product } from '../../types';

interface StockCountItem extends Product {
  countedStock: number;
  difference: number;
  isAdjusted: boolean;
}

const StockTakingScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const { products } = useAppSelector(state => state.products);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockCounts, setStockCounts] = useState<StockCountItem[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      const initialCounts = products.map(product => ({
        ...product,
        countedStock: product.stock,
        difference: 0,
        isAdjusted: false,
      }));
      setStockCounts(initialCounts);
    }
  }, [products]);

  const handleStockCountChange = (productId: string, countedStock: number) => {
    setStockCounts(prev => prev.map(item => {
      if (item.id === productId) {
        const difference = countedStock - item.stock;
        return {
          ...item,
          countedStock,
          difference,
          isAdjusted: difference !== 0,
        };
      }
      return item;
    }));
  };

  const handleCompleteStockTaking = () => {
    const adjustedItems = stockCounts.filter(item => item.isAdjusted);
    
    if (adjustedItems.length === 0) {
      Alert.alert('No Changes', 'No stock adjustments were made.');
      return;
    }

    Alert.alert(
      'Complete Stock Taking',
      `${adjustedItems.length} products will be adjusted. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            // Here you would typically send the adjustments to the API
            console.log('Stock adjustments:', adjustedItems);
            setIsCompleted(true);
            Alert.alert('Success', 'Stock taking completed successfully!');
          },
        },
      ]
    );
  };

  const filteredStockCounts = stockCounts.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStockItem = ({ item }: { item: StockCountItem }) => (
    <Card style={[styles.stockCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.stockHeader}>
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.productCategory, { color: theme.colors.textSecondary }]}>
              {item.category}
            </Text>
          </View>
          {item.isAdjusted && (
            <Chip
              style={[
                styles.adjustmentChip,
                { backgroundColor: item.difference > 0 ? theme.colors.success : theme.colors.error }
              ]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.difference > 0 ? '+' : ''}{item.difference}
            </Chip>
          )}
        </View>

        <View style={styles.stockCounting}>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockLabel, { color: theme.colors.textSecondary }]}>
              System Stock
            </Text>
            <Text style={[styles.stockValue, { color: theme.colors.text }]}>
              {item.stock}
            </Text>
          </View>

          <View style={styles.countInput}>
            <TextInput
              label="Counted Stock"
              value={item.countedStock.toString()}
              onChangeText={(text) => {
                const count = parseInt(text) || 0;
                handleStockCountChange(item.id, count);
              }}
              keyboardType="numeric"
              mode="outlined"
              style={styles.textInput}
              disabled={isCompleted}
            />
          </View>

          <View style={styles.stockInfo}>
            <Text style={[styles.stockLabel, { color: theme.colors.textSecondary }]}>
              Difference
            </Text>
            <Text style={[
              styles.stockValue,
              {
                color: item.difference === 0 ? theme.colors.text :
                       item.difference > 0 ? theme.colors.success : theme.colors.error
              }
            ]}>
              {item.difference > 0 ? '+' : ''}{item.difference}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const adjustedCount = stockCounts.filter(item => item.isAdjusted).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Stats */}
      <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stockCounts.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total Products
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {adjustedCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Adjustments
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {((stockCounts.length - adjustedCount) / stockCounts.length * 100).toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Accurate
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Stock List */}
      <FlatList
        data={filteredStockCounts}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No products found
            </Text>
          </View>
        }
      />

      {/* Complete FAB */}
      {!isCompleted && adjustedCount > 0 && (
        <FAB
          icon="check"
          label={`Complete (${adjustedCount})`}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleCompleteStockTaking}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 0,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  stockCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  adjustmentChip: {
    height: 24,
    borderRadius: 12,
  },
  stockCounting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stockInfo: {
    alignItems: 'center',
    minWidth: 60,
  },
  stockLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  stockValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  countInput: {
    flex: 1,
  },
  textInput: {
    height: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default StockTakingScreen;
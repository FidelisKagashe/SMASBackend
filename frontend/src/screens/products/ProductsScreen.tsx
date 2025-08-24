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
  IconButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchProducts, setSearchQuery, setSelectedCategory, setSortBy, setSortOrder } from '../../store/slices/productsSlice';
import { ProductsStackParamList } from '../../navigation/MainNavigator';
import { Product } from '../../types';

type ProductsScreenNavigationProp = StackNavigationProp<ProductsStackParamList, 'ProductsList'>;

interface Props {
  navigation: ProductsScreenNavigationProp;
}

const ProductsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const { 
    products, 
    isLoading, 
    searchQuery, 
    selectedCategory, 
    sortBy, 
    sortOrder 
  } = useAppSelector(state => state.products);

  const [refreshing, setRefreshing] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProducts());
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct', {});
  };

  const handleSort = (field: 'name' | 'price' | 'stock' | 'date') => {
    if (sortBy === field) {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortOrder('asc'));
    }
    setSortMenuVisible(false);
  };

  const handleCategoryFilter = (category: string | null) => {
    dispatch(setSelectedCategory(category));
    setCategoryMenuVisible(false);
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'stock':
        comparison = a.stock - b.stock;
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t('products.outOfStock'), color: theme.colors.error };
    if (stock < 10) return { label: t('products.lowStock'), color: theme.colors.warning };
    return { label: t('products.inStock'), color: theme.colors.success };
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item.stock);
    
    return (
      <Card 
        style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleProductPress(item.id)}
      >
        <Card.Content>
          <View style={styles.productHeader}>
            <Text style={[styles.productName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Chip
              style={[styles.stockChip, { backgroundColor: stockStatus.color }]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.stock}
            </Chip>
          </View>
          
          <Text style={[styles.productDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
          
          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
              {formatCurrency(item.price)}
            </Text>
            <Text style={[styles.productCategory, { color: theme.colors.textSecondary }]}>
              {item.category}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('products.searchProducts')}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filtersContainer}>
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setCategoryMenuVisible(true)}
                icon="filter-variant"
                style={styles.filterButton}
              >
                {selectedCategory || t('common.all')}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => handleCategoryFilter(null)}
              title={t('common.all')}
            />
            {categories.map(category => (
              <Menu.Item
                key={category}
                onPress={() => handleCategoryFilter(category)}
                title={category}
              />
            ))}
          </Menu>

          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                style={styles.filterButton}
              >
                {t(`products.sortBy${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`)}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => handleSort('name')}
              title={t('products.sortByName')}
            />
            <Menu.Item
              onPress={() => handleSort('price')}
              title={t('products.sortByPrice')}
            />
            <Menu.Item
              onPress={() => handleSort('stock')}
              title={t('products.sortByStock')}
            />
            <Menu.Item
              onPress={() => handleSort('date')}
              title={t('products.sortByDate')}
            />
          </Menu>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={sortedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No products found' : 'No products yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
            </Text>
          </View>
        }
      />

      {/* Add Product FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddProduct}
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
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  productCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  stockChip: {
    height: 24,
    borderRadius: 12,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productCategory: {
    fontSize: 12,
    textTransform: 'uppercase',
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

export default ProductsScreen;
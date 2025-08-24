import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  FAB,
  IconButton,
  Menu,
  Button,
  Chip,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { ProductsStackParamList } from '../../navigation/MainNavigator';
import { Category } from '../../types';

type CategoriesScreenNavigationProp = StackNavigationProp<ProductsStackParamList, 'Categories'>;

interface Props {
  navigation: CategoriesScreenNavigationProp;
}

const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Clothing',
      description: 'Apparel and fashion items',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '3',
      name: 'Food & Beverages',
      description: 'Food items and drinks',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch categories from API
    setRefreshing(false);
  };

  const handleAddCategory = () => {
    navigation.navigate('AddEditCategory', {});
  };

  const handleEditCategory = (categoryId: string) => {
    navigation.navigate('AddEditCategory', { categoryId });
    setMenuVisible(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
            setMenuVisible(null);
          },
        },
      ]
    );
  };

  const handleToggleStatus = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
    setMenuVisible(null);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <Card style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          <View style={styles.categoryActions}>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: item.isActive ? theme.colors.success : theme.colors.error }
              ]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Chip>
            <Menu
              visible={menuVisible === item.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => setMenuVisible(item.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => handleEditCategory(item.id)}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => handleToggleStatus(item.id)}
                title={item.isActive ? 'Deactivate' : 'Activate'}
                leadingIcon={item.isActive ? 'eye-off' : 'eye'}
              />
              <Menu.Item
                onPress={() => handleDeleteCategory(item.id)}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </View>

        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              12
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Products
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              $2,450
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Value
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search categories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="folder" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first category to get started'}
            </Text>
          </View>
        }
      />

      {/* Add Category FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddCategory}
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
    elevation: 0,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  categoryCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    height: 24,
    borderRadius: 12,
  },
  categoryStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
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

export default CategoriesScreen;
import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Menu, Button } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

interface SearchableListProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  searchPlaceholder: string;
  searchFields: (keyof T)[];
  filters?: {
    label: string;
    value: string | null;
    field: keyof T;
    options: { label: string; value: string | null }[];
  }[];
  onRefresh?: () => void;
  refreshing?: boolean;
  ListEmptyComponent?: React.ComponentType<any>;
}

function SearchableList<T>({
  data,
  renderItem,
  keyExtractor,
  searchPlaceholder,
  searchFields,
  filters = [],
  onRefresh,
  refreshing = false,
  ListEmptyComponent,
}: SearchableListProps<T>) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({});
  const [menuVisibility, setMenuVisibility] = useState<Record<string, boolean>>({});

  const filteredData = data.filter(item => {
    // Search filter
    const matchesSearch = searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });

    // Additional filters
    const matchesFilters = filters.every(filter => {
      const activeValue = activeFilters[filter.label];
      if (!activeValue) return true;
      return item[filter.field] === activeValue;
    });

    return matchesSearch && matchesFilters;
  });

  const handleFilterChange = (filterLabel: string, value: string | null) => {
    setActiveFilters(prev => ({ ...prev, [filterLabel]: value }));
    setMenuVisibility(prev => ({ ...prev, [filterLabel]: false }));
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={searchPlaceholder}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        {/* Filters */}
        {filters.length > 0 && (
          <View style={styles.filtersContainer}>
            {filters.map(filter => (
              <Menu
                key={filter.label}
                visible={menuVisibility[filter.label] || false}
                onDismiss={() => setMenuVisibility(prev => ({ ...prev, [filter.label]: false }))}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisibility(prev => ({ ...prev, [filter.label]: true }))}
                    icon="filter-variant"
                    style={styles.filterButton}
                  >
                    {activeFilters[filter.label] || filter.label}
                  </Button>
                }
              >
                {filter.options.map(option => (
                  <Menu.Item
                    key={option.label}
                    onPress={() => handleFilterChange(filter.label, option.value)}
                    title={option.label}
                  />
                ))}
              </Menu>
            ))}
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

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
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});

export default SearchableList;
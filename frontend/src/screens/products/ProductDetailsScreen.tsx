import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  IconButton,
  Menu,
  Divider,
  List,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { fetchProductById, deleteProduct } from '../../store/slices/productsSlice';
import { ProductsStackParamList } from '../../navigation/MainNavigator';

type ProductDetailsScreenNavigationProp = StackNavigationProp<ProductsStackParamList, 'ProductDetails'>;
type ProductDetailsScreenRouteProp = RouteProp<ProductsStackParamList, 'ProductDetails'>;

interface Props {
  navigation: ProductDetailsScreenNavigationProp;
  route: ProductDetailsScreenRouteProp;
}

const ProductDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { selectedProduct, isLoading } = useAppSelector(state => state.products);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const { productId } = route.params;

  useEffect(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  const handleEdit = () => {
    navigation.navigate('AddEditProduct', { productId });
    setMenuVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteProduct(productId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error as string);
            }
          },
        },
      ]
    );
    setMenuVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: theme.colors.error };
    if (stock <= minStock) return { label: 'Low Stock', color: theme.colors.warning };
    return { label: 'In Stock', color: theme.colors.success };
  };

  if (!selectedProduct) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading product details...</Text>
        </View>
      </View>
    );
  }

  const stockStatus = getStockStatus(selectedProduct.stock, selectedProduct.minStock);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Product Image */}
        {selectedProduct.image && (
          <Card style={[styles.imageCard, { backgroundColor: theme.colors.surface }]}>
            <Image source={{ uri: selectedProduct.image }} style={styles.productImage} />
          </Card>
        )}

        {/* Basic Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title 
            title={selectedProduct.name}
            subtitle={selectedProduct.description}
            right={() => (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
                <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
              </Menu>
            )}
          />
          <Card.Content>
            <View style={styles.statusContainer}>
              <Chip
                style={[styles.statusChip, { backgroundColor: stockStatus.color }]}
                textStyle={{ color: 'white' }}
              >
                {stockStatus.label}
              </Chip>
              <Chip
                style={[styles.statusChip, { backgroundColor: selectedProduct.isActive ? theme.colors.success : theme.colors.error }]}
                textStyle={{ color: 'white' }}
              >
                {selectedProduct.isActive ? 'Active' : 'Inactive'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Pricing Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Pricing Information" />
          <Card.Content>
            <View style={styles.priceContainer}>
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                  Cost Price
                </Text>
                <Text style={[styles.priceValue, { color: theme.colors.text }]}>
                  {formatCurrency(selectedProduct.costPrice)}
                </Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                  Selling Price
                </Text>
                <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
                  {formatCurrency(selectedProduct.price)}
                </Text>
              </View>
            </View>
            <View style={styles.marginContainer}>
              <Text style={[styles.marginLabel, { color: theme.colors.textSecondary }]}>
                Profit Margin
              </Text>
              <Text style={[styles.marginValue, { color: theme.colors.success }]}>
                {formatCurrency(selectedProduct.price - selectedProduct.costPrice)} 
                ({(((selectedProduct.price - selectedProduct.costPrice) / selectedProduct.price) * 100).toFixed(1)}%)
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Stock Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Stock Information" />
          <Card.Content>
            <List.Item
              title="Current Stock"
              description={`${selectedProduct.stock} ${selectedProduct.unit}`}
              left={props => <List.Icon {...props} icon="package-variant" />}
              right={() => (
                <Text style={[styles.stockValue, { color: stockStatus.color }]}>
                  {selectedProduct.stock}
                </Text>
              )}
            />
            <List.Item
              title="Minimum Stock"
              description="Reorder level"
              left={props => <List.Icon {...props} icon="alert" />}
              right={() => (
                <Text style={[styles.stockValue, { color: theme.colors.warning }]}>
                  {selectedProduct.minStock}
                </Text>
              )}
            />
            {selectedProduct.maxStock && (
              <List.Item
                title="Maximum Stock"
                description="Maximum capacity"
                left={props => <List.Icon {...props} icon="package-up" />}
                right={() => (
                  <Text style={[styles.stockValue, { color: theme.colors.info }]}>
                    {selectedProduct.maxStock}
                  </Text>
                )}
              />
            )}
          </Card.Content>
        </Card>

        {/* Product Details */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Product Details" />
          <Card.Content>
            <List.Item
              title="SKU"
              description={selectedProduct.sku || 'Not set'}
              left={props => <List.Icon {...props} icon="barcode" />}
            />
            <List.Item
              title="Category"
              description={selectedProduct.category}
              left={props => <List.Icon {...props} icon="folder" />}
            />
            <List.Item
              title="Unit"
              description={selectedProduct.unit}
              left={props => <List.Icon {...props} icon="scale" />}
            />
            {selectedProduct.weight && (
              <List.Item
                title="Weight"
                description={`${selectedProduct.weight} kg`}
                left={props => <List.Icon {...props} icon="weight" />}
              />
            )}
            {selectedProduct.dimensions && (
              <List.Item
                title="Dimensions"
                description={selectedProduct.dimensions}
                left={props => <List.Icon {...props} icon="ruler" />}
              />
            )}
            {selectedProduct.supplier && (
              <List.Item
                title="Supplier"
                description={selectedProduct.supplier}
                left={props => <List.Icon {...props} icon="truck" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Timestamps */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Record Information" />
          <Card.Content>
            <List.Item
              title="Created"
              description={new Date(selectedProduct.createdAt).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar-plus" />}
            />
            <List.Item
              title="Last Updated"
              description={new Date(selectedProduct.updatedAt).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar-edit" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handleEdit}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit Product
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('StockAdjustments')}
          style={styles.actionButton}
          icon="tune"
        >
          Adjust Stock
        </Button>
      </View>
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
  imageCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusChip: {
    borderRadius: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  marginContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  marginLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  marginValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
  },
});

export default ProductDetailsScreen;
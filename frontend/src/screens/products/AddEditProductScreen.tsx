import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Switch,
  Menu,
  Chip,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { createProduct, updateProduct, fetchProductById } from '../../store/slices/productsSlice';
import { ProductsStackParamList } from '../../navigation/MainNavigator';
import { Product } from '../../types';

type AddEditProductScreenNavigationProp = StackNavigationProp<ProductsStackParamList, 'AddEditProduct'>;
type AddEditProductScreenRouteProp = RouteProp<ProductsStackParamList, 'AddEditProduct'>;

interface Props {
  navigation: AddEditProductScreenNavigationProp;
  route: AddEditProductScreenRouteProp;
}

const AddEditProductScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { selectedProduct, isLoading } = useAppSelector(state => state.products);
  const { user } = useAppSelector(state => state.auth);
  
  const { productId } = route.params || {};
  const isEditing = !!productId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    maxStock: '',
    category: '',
    unit: 'pcs',
    weight: '',
    dimensions: '',
    supplier: '',
    isActive: true,
  });

  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  const categories = ['Electronics', 'Clothing', 'Food & Beverages', 'Books', 'Home & Garden'];
  const units = ['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'box', 'pack'];

  useEffect(() => {
    if (isEditing && productId) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, isEditing, productId]);

  useEffect(() => {
    if (isEditing && selectedProduct) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        sku: selectedProduct.sku,
        barcode: selectedProduct.barcode || '',
        price: selectedProduct.price.toString(),
        costPrice: selectedProduct.costPrice.toString(),
        stock: selectedProduct.stock.toString(),
        minStock: selectedProduct.minStock.toString(),
        maxStock: selectedProduct.maxStock?.toString() || '',
        category: selectedProduct.category,
        unit: selectedProduct.unit,
        weight: selectedProduct.weight?.toString() || '',
        dimensions: selectedProduct.dimensions || '',
        supplier: selectedProduct.supplier || '',
        isActive: selectedProduct.isActive,
      });
    }
  }, [isEditing, selectedProduct]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Valid selling price is required');
      return false;
    }
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      Alert.alert('Error', 'Valid cost price is required');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'Valid stock quantity is required');
      return false;
    }
    if (!formData.minStock || parseInt(formData.minStock) < 0) {
      Alert.alert('Error', 'Valid minimum stock is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Category is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      sku: formData.sku.trim(),
      barcode: formData.barcode.trim() || undefined,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
      category: formData.category,
      categoryId: 'category-1', // This would come from category selection
      unit: formData.unit,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      dimensions: formData.dimensions.trim() || undefined,
      supplier: formData.supplier.trim() || undefined,
      supplierId: undefined, // This would come from supplier selection
      branchId: user?.branchId || 'default-branch',
      isActive: formData.isActive,
    };

    try {
      if (isEditing && productId) {
        await dispatch(updateProduct({ id: productId, data: productData })).unwrap();
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await dispatch(createProduct(productData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>)).unwrap();
        Alert.alert('Success', 'Product created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Basic Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Basic Information" />
          <Card.Content>
            <TextInput
              label="Product Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.rowContainer}>
              <TextInput
                label="SKU"
                value={formData.sku}
                onChangeText={(value) => handleInputChange('sku', value)}
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
              />
              
              <TextInput
                label="Barcode"
                value={formData.barcode}
                onChangeText={(value) => handleInputChange('barcode', value)}
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Pricing */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Pricing" />
          <Card.Content>
            <View style={styles.rowContainer}>
              <TextInput
                label="Cost Price *"
                value={formData.costPrice}
                onChangeText={(value) => handleInputChange('costPrice', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
              
              <TextInput
                label="Selling Price *"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
            </View>

            {formData.price && formData.costPrice && (
              <View style={styles.marginInfo}>
                <Text style={[styles.marginText, { color: theme.colors.success }]}>
                  Profit: {((parseFloat(formData.price) - parseFloat(formData.costPrice)) || 0).toFixed(2)} 
                  ({(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100 || 0).toFixed(1)}%)
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Inventory */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Inventory" />
          <Card.Content>
            <View style={styles.rowContainer}>
              <TextInput
                label="Current Stock *"
                value={formData.stock}
                onChangeText={(value) => handleInputChange('stock', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
              
              <Menu
                visible={unitMenuVisible}
                onDismiss={() => setUnitMenuVisible(false)}
                anchor={
                  <TextInput
                    label="Unit *"
                    value={formData.unit}
                    mode="outlined"
                    style={[styles.input, styles.halfWidth]}
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" onPress={() => setUnitMenuVisible(true)} />}
                  />
                }
              >
                {units.map(unit => (
                  <Menu.Item
                    key={unit}
                    onPress={() => {
                      handleInputChange('unit', unit);
                      setUnitMenuVisible(false);
                    }}
                    title={unit}
                  />
                ))}
              </Menu>
            </View>

            <View style={styles.rowContainer}>
              <TextInput
                label="Minimum Stock *"
                value={formData.minStock}
                onChangeText={(value) => handleInputChange('minStock', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
              
              <TextInput
                label="Maximum Stock"
                value={formData.maxStock}
                onChangeText={(value) => handleInputChange('maxStock', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Category & Classification */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Classification" />
          <Card.Content>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <TextInput
                  label="Category *"
                  value={formData.category}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={<TextInput.Icon icon="chevron-down" onPress={() => setCategoryMenuVisible(true)} />}
                />
              }
            >
              {categories.map(category => (
                <Menu.Item
                  key={category}
                  onPress={() => {
                    handleInputChange('category', category);
                    setCategoryMenuVisible(false);
                  }}
                  title={category}
                />
              ))}
            </Menu>

            <TextInput
              label="Supplier"
              value={formData.supplier}
              onChangeText={(value) => handleInputChange('supplier', value)}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Physical Properties */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Physical Properties" />
          <Card.Content>
            <View style={styles.rowContainer}>
              <TextInput
                label="Weight (kg)"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
              
              <TextInput
                label="Dimensions"
                value={formData.dimensions}
                onChangeText={(value) => handleInputChange('dimensions', value)}
                mode="outlined"
                placeholder="L x W x H"
                style={[styles.input, styles.halfWidth]}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Status */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Status" />
          <Card.Content>
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                Active Product
              </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
              />
            </View>
            <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
              Inactive products won't appear in sales or reports
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
          contentStyle={styles.buttonContent}
        >
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionCard: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  marginInfo: {
    alignItems: 'center',
    paddingTop: 8,
  },
  marginText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});

export default AddEditProductScreen;
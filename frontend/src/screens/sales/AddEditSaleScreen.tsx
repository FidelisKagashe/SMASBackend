import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Menu,
  Chip,
  IconButton,
  Searchbar,
  List,
  Divider,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useTheme } from '../../hooks/useTheme';
import { createSale, updateSale, fetchSaleById } from '../../store/slices/salesSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchCustomers } from '../../store/slices/customersSlice';
import { SalesStackParamList } from '../../navigation/MainNavigator';
import { Sale, SaleItem, Product, Customer } from '../../types';

type AddEditSaleScreenNavigationProp = StackNavigationProp<SalesStackParamList, 'AddEditSale'>;
type AddEditSaleScreenRouteProp = RouteProp<SalesStackParamList, 'AddEditSale'>;

interface Props {
  navigation: AddEditSaleScreenNavigationProp;
  route: AddEditSaleScreenRouteProp;
}

const AddEditSaleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  
  const { selectedSale, isLoading } = useAppSelector(state => state.sales);
  const { products } = useAppSelector(state => state.products);
  const { customers } = useAppSelector(state => state.customers);
  const { user } = useAppSelector(state => state.auth);
  
  const { saleId } = route.params || {};
  const isEditing = !!saleId;

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCustomers());
    
    if (isEditing && saleId) {
      dispatch(fetchSaleById(saleId));
    }
  }, [dispatch, isEditing, saleId]);

  useEffect(() => {
    if (isEditing && selectedSale) {
      setSaleItems(selectedSale.products);
      setSelectedCustomer(selectedSale.customer || null);
      setPaymentMethod(selectedSale.paymentMethod);
      setAmountPaid(selectedSale.amountPaid.toString());
      setNotes(selectedSale.notes || '');
    }
  }, [isEditing, selectedSale]);

  const addProductToSale = (product: Product) => {
    const existingItemIndex = saleItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setSaleItems(updatedItems);
    } else {
      // Add new product
      const newItem: SaleItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        product,
        quantity: 1,
        price: product.price,
        discount: 0,
        total: product.price,
      };
      setSaleItems([...saleItems, newItem]);
    }
    setShowProductSearch(false);
    setProductSearchQuery('');
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setSaleItems(saleItems.filter(item => item.id !== itemId));
      return;
    }
    
    setSaleItems(saleItems.map(item => {
      if (item.id === itemId) {
        const total = quantity * item.price - item.discount;
        return { ...item, quantity, total };
      }
      return item;
    }));
  };

  const updateItemPrice = (itemId: string, price: number) => {
    setSaleItems(saleItems.map(item => {
      if (item.id === itemId) {
        const total = item.quantity * price - item.discount;
        return { ...item, price, total };
      }
      return item;
    }));
  };

  const updateItemDiscount = (itemId: string, discount: number) => {
    setSaleItems(saleItems.map(item => {
      if (item.id === itemId) {
        const total = item.quantity * item.price - discount;
        return { ...item, discount, total };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalDiscount = saleItems.reduce((sum, item) => sum + item.discount, 0);
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax - totalDiscount;
    
    return { subtotal, tax, discount: totalDiscount, total };
  };

  const handleSave = async () => {
    if (saleItems.length === 0) {
      Alert.alert('Error', 'Please add at least one product');
      return;
    }

    const totals = calculateTotals();
    const paidAmount = parseFloat(amountPaid) || 0;
    
    if (paymentMethod !== 'credit' && paidAmount < totals.total) {
      Alert.alert('Error', 'Amount paid cannot be less than total for cash/card payments');
      return;
    }

    const saleData = {
      saleNumber: `SALE-${Date.now()}`,
      customerId: selectedCustomer?.id || '',
      customer: selectedCustomer,
      products: saleItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      paymentMethod,
      paymentStatus: paidAmount >= totals.total ? 'paid' as const : 
                    paidAmount > 0 ? 'partial' as const : 'unpaid' as const,
      amountPaid: paidAmount,
      change: Math.max(0, paidAmount - totals.total),
      status: 'completed' as const,
      type: 'sale' as const,
      notes: notes.trim() || undefined,
      branchId: user?.branchId || 'default-branch',
      createdBy: user?.id || 'default-user',
    };

    try {
      if (isEditing && saleId) {
        await dispatch(updateSale({ id: saleId, data: saleData })).unwrap();
        Alert.alert('Success', 'Sale updated successfully');
      } else {
        await dispatch(createSale(saleData as Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>)).unwrap();
        Alert.alert('Success', 'Sale created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error as string);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) &&
    product.isActive && product.stock > 0
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const totals = calculateTotals();
  const paidAmount = parseFloat(amountPaid) || 0;

  const renderSaleItem = ({ item }: { item: SaleItem }) => (
    <Card style={[styles.itemCard, { backgroundColor: theme.colors.background }]}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, { color: theme.colors.text }]}>
            {item.product?.name}
          </Text>
          <IconButton
            icon="close"
            size={20}
            onPress={() => removeItem(item.id)}
          />
        </View>
        
        <View style={styles.itemControls}>
          <View style={styles.quantityControl}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
            />
            <Text style={[styles.quantity, { color: theme.colors.text }]}>
              {item.quantity}
            </Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
            />
          </View>
          
          <TextInput
            label="Price"
            value={item.price.toString()}
            onChangeText={(value) => updateItemPrice(item.id, parseFloat(value) || 0)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.priceInput}
            dense
          />
          
          <Text style={[styles.itemTotal, { color: theme.colors.primary }]}>
            ${item.total.toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Customer Selection */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Customer" />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => setShowCustomerSearch(true)}
              icon="account-plus"
              style={styles.customerButton}
            >
              {selectedCustomer ? selectedCustomer.name : 'Select Customer (Optional)'}
            </Button>
            
            {selectedCustomer && (
              <View style={styles.selectedCustomer}>
                <Text style={[styles.customerName, { color: theme.colors.text }]}>
                  {selectedCustomer.name}
                </Text>
                <Text style={[styles.customerDetails, { color: theme.colors.textSecondary }]}>
                  {selectedCustomer.phone} • {selectedCustomer.email}
                </Text>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setSelectedCustomer(null)}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Products */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title 
            title="Products" 
            right={() => (
              <Button
                mode="outlined"
                onPress={() => setShowProductSearch(true)}
                icon="plus"
                compact
              >
                Add Product
              </Button>
            )}
          />
          <Card.Content>
            {saleItems.length > 0 ? (
              <FlatList
                data={saleItems}
                renderItem={renderSaleItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyProducts}>
                <MaterialIcons name="shopping-cart" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No products added
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowProductSearch(true)}
                  icon="plus"
                  style={styles.addFirstProduct}
                >
                  Add First Product
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Payment Summary */}
        {saleItems.length > 0 && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Payment Summary" />
            <Card.Content>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Subtotal
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  ${totals.subtotal.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Tax (18%)
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  ${totals.tax.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Discount
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                  -${totals.discount.toFixed(2)}
                </Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                  ${totals.total.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Payment Method */}
        {saleItems.length > 0 && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Payment" />
            <Card.Content>
              <Menu
                visible={paymentMenuVisible}
                onDismiss={() => setPaymentMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setPaymentMenuVisible(true)}
                    icon="credit-card"
                    style={styles.paymentButton}
                  >
                    {paymentMethod.toUpperCase()}
                  </Button>
                }
              >
                <Menu.Item onPress={() => { setPaymentMethod('cash'); setPaymentMenuVisible(false); }} title="Cash" />
                <Menu.Item onPress={() => { setPaymentMethod('card'); setPaymentMenuVisible(false); }} title="Card" />
                <Menu.Item onPress={() => { setPaymentMethod('mobile'); setPaymentMenuVisible(false); }} title="Mobile Money" />
                <Menu.Item onPress={() => { setPaymentMethod('credit'); setPaymentMenuVisible(false); }} title="Credit" />
              </Menu>

              <TextInput
                label="Amount Paid"
                value={amountPaid}
                onChangeText={setAmountPaid}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />

              {paidAmount > totals.total && (
                <View style={styles.changeInfo}>
                  <Text style={[styles.changeLabel, { color: theme.colors.success }]}>
                    Change: ${(paidAmount - totals.total).toFixed(2)}
                  </Text>
                </View>
              )}

              <TextInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
              />
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Product Search Modal */}
      {showProductSearch && (
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Product
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowProductSearch(false)}
            />
          </View>
          
          <Searchbar
            placeholder="Search products..."
            onChangeText={setProductSearchQuery}
            value={productSearchQuery}
            style={styles.modalSearchbar}
          />
          
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`$${item.price} • Stock: ${item.stock}`}
                left={props => <List.Icon {...props} icon="package-variant" />}
                onPress={() => addProductToSale(item)}
              />
            )}
            style={styles.modalList}
          />
        </View>
      )}

      {/* Customer Search Modal */}
      {showCustomerSearch && (
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Customer
            </Text>
            <IconButton
              icon="close"
              onPress={() => setShowCustomerSearch(false)}
            />
          </View>
          
          <Searchbar
            placeholder="Search customers..."
            onChangeText={setCustomerSearchQuery}
            value={customerSearchQuery}
            style={styles.modalSearchbar}
          />
          
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${item.phone} • ${item.email}`}
                left={props => <List.Icon {...props} icon="account" />}
                onPress={() => {
                  setSelectedCustomer(item);
                  setShowCustomerSearch(false);
                  setCustomerSearchQuery('');
                }}
              />
            )}
            style={styles.modalList}
          />
        </View>
      )}

      {/* Save Button */}
      {saleItems.length > 0 && (
        <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
          >
            {isEditing ? 'Update Sale' : 'Complete Sale'} (${totals.total.toFixed(2)})
          </Button>
        </View>
      )}
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
  customerButton: {
    marginBottom: 8,
  },
  selectedCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  customerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  customerDetails: {
    flex: 2,
    fontSize: 12,
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  addFirstProduct: {
    marginTop: 8,
  },
  itemCard: {
    marginBottom: 8,
    elevation: 1,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  priceInput: {
    width: 80,
    height: 40,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentButton: {
    marginBottom: 16,
  },
  changeInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  changeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSearchbar: {
    margin: 16,
    elevation: 0,
  },
  modalList: {
    flex: 1,
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

export default AddEditSaleScreen;
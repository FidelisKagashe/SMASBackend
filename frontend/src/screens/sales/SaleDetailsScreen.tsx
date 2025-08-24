import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
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
import { fetchSaleById, deleteSale } from '../../store/slices/salesSlice';
import { SalesStackParamList } from '../../navigation/MainNavigator';

type SaleDetailsScreenNavigationProp = StackNavigationProp<SalesStackParamList, 'SaleDetails'>;
type SaleDetailsScreenRouteProp = RouteProp<SalesStackParamList, 'SaleDetails'>;

interface Props {
  navigation: SaleDetailsScreenNavigationProp;
  route: SaleDetailsScreenRouteProp;
}

const SaleDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { selectedSale, isLoading } = useAppSelector(state => state.sales);
  
  const [menuVisible, setMenuVisible] = useState(false);
  const { saleId } = route.params;

  useEffect(() => {
    dispatch(fetchSaleById(saleId));
  }, [dispatch, saleId]);

  const handleEdit = () => {
    navigation.navigate('AddEditSale', { saleId });
    setMenuVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Sale',
      'Are you sure you want to delete this sale?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteSale(saleId)).unwrap();
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

  const handlePrintReceipt = () => {
    navigation.navigate('PrintReceipt', { saleId });
    setMenuVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return theme.colors.success;
      case 'partial': return theme.colors.warning;
      case 'unpaid': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  if (!selectedSale) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading sale details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Sale Header */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title 
            title={`Sale #${selectedSale.saleNumber}`}
            subtitle={new Date(selectedSale.createdAt).toLocaleDateString()}
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
                <Menu.Item onPress={handlePrintReceipt} title="Print Receipt" leadingIcon="printer" />
                <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />
              </Menu>
            )}
          />
          <Card.Content>
            <View style={styles.statusContainer}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(selectedSale.status) }]}
                textStyle={{ color: 'white' }}
              >
                {selectedSale.status}
              </Chip>
              <Chip
                style={[styles.statusChip, { backgroundColor: getPaymentStatusColor(selectedSale.paymentStatus) }]}
                textStyle={{ color: 'white' }}
              >
                {selectedSale.paymentStatus}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Information */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Customer Information" />
          <Card.Content>
            <List.Item
              title={selectedSale.customer?.name || 'Walk-in Customer'}
              description={selectedSale.customer?.email || 'No email'}
              left={props => <List.Icon {...props} icon="account" />}
            />
            {selectedSale.customer?.phone && (
              <List.Item
                title="Phone"
                description={selectedSale.customer.phone}
                left={props => <List.Icon {...props} icon="phone" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Products */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Products" />
          <Card.Content>
            {selectedSale.products.map((item, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.colors.text }]}>
                    {item.product?.name || `Product ${item.productId}`}
                  </Text>
                  <Text style={[styles.productDetails, { color: theme.colors.textSecondary }]}>
                    {item.quantity} x {formatCurrency(item.price)}
                  </Text>
                  {item.discount > 0 && (
                    <Text style={[styles.productDiscount, { color: theme.colors.warning }]}>
                      Discount: {formatCurrency(item.discount)}
                    </Text>
                  )}
                </View>
                <Text style={[styles.productTotal, { color: theme.colors.primary }]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Payment Summary */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Payment Summary" />
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {formatCurrency(selectedSale.subtotal)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Tax
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {formatCurrency(selectedSale.tax)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Discount
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                -{formatCurrency(selectedSale.discount)}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                {formatCurrency(selectedSale.total)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Amount Paid
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {formatCurrency(selectedSale.amountPaid)}
              </Text>
            </View>

            {selectedSale.change > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Change
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                  {formatCurrency(selectedSale.change)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Payment Method */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Title title="Payment Information" />
          <Card.Content>
            <List.Item
              title="Payment Method"
              description={selectedSale.paymentMethod.toUpperCase()}
              left={props => <List.Icon {...props} icon="credit-card" />}
            />
            <List.Item
              title="Payment Status"
              description={selectedSale.paymentStatus.toUpperCase()}
              left={props => <List.Icon {...props} icon="cash" />}
              right={() => (
                <Chip
                  style={[styles.statusChip, { backgroundColor: getPaymentStatusColor(selectedSale.paymentStatus) }]}
                  textStyle={{ color: 'white', fontSize: 10 }}
                >
                  {selectedSale.paymentStatus}
                </Chip>
              )}
            />
          </Card.Content>
        </Card>

        {/* Additional Information */}
        {selectedSale.notes && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Notes" />
            <Card.Content>
              <Text style={[styles.notes, { color: theme.colors.text }]}>
                {selectedSale.notes}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={handlePrintReceipt}
          style={styles.actionButton}
          icon="printer"
        >
          Print Receipt
        </Button>
        <Button
          mode="contained"
          onPress={handleEdit}
          style={styles.actionButton}
          icon="pencil"
        >
          Edit Sale
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
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  productDiscount: {
    fontSize: 12,
    marginTop: 2,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: 'bold',
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
  notes: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
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

export default SaleDetailsScreen;
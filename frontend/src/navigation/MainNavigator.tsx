import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';

// Products
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import AddEditProductScreen from '../screens/products/AddEditProductScreen';
import StockTakingScreen from '../screens/products/StockTakingScreen';
import CategoriesScreen from '../screens/products/CategoriesScreen';
import AddEditCategoryScreen from '../screens/products/AddEditCategoryScreen';
import StockAdjustmentsScreen from '../screens/products/StockAdjustmentsScreen';

// Sales
import SalesScreen from '../screens/sales/SalesScreen';
import SaleDetailsScreen from '../screens/sales/SaleDetailsScreen';
import AddEditSaleScreen from '../screens/sales/AddEditSaleScreen';
import OrdersScreen from '../screens/sales/OrdersScreen';
import OrderDetailsScreen from '../screens/sales/OrderDetailsScreen';
import AddEditOrderScreen from '../screens/sales/AddEditOrderScreen';
import ProformaInvoicesScreen from '../screens/sales/ProformaInvoicesScreen';
import ProformaDetailsScreen from '../screens/sales/ProformaDetailsScreen';
import AddEditProformaScreen from '../screens/sales/AddEditProformaScreen';
import InvoicesScreen from '../screens/sales/InvoicesScreen';
import PrintReceiptScreen from '../screens/sales/PrintReceiptScreen';

// Customers
import CustomersScreen from '../screens/customers/CustomersScreen';
import CustomerDetailsScreen from '../screens/customers/CustomerDetailsScreen';
import AddEditCustomerScreen from '../screens/customers/AddEditCustomerScreen';

// Expenses
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import AddEditExpenseScreen from '../screens/expenses/AddEditExpenseScreen';
import ExpenseTypesScreen from '../screens/expenses/ExpenseTypesScreen';
import AddEditExpenseTypeScreen from '../screens/expenses/AddEditExpenseTypeScreen';

// Purchases
import PurchasesScreen from '../screens/purchases/PurchasesScreen';
import AddEditPurchaseScreen from '../screens/purchases/AddEditPurchaseScreen';
import SuppliersScreen from '../screens/purchases/SuppliersScreen';
import AddEditSupplierScreen from '../screens/purchases/AddEditSupplierScreen';
import BulkPurchaseScreen from '../screens/purchases/BulkPurchaseScreen';

// Other modules
import FreightsScreen from '../screens/freight/FreightsScreen';
import AddEditFreightScreen from '../screens/freight/AddEditFreightScreen';
import DevicesScreen from '../screens/devices/DevicesScreen';
import AddEditDeviceScreen from '../screens/devices/AddEditDeviceScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import AddEditServiceScreen from '../screens/services/AddEditServiceScreen';
import DebtsScreen from '../screens/debts/DebtsScreen';
import AddEditDebtScreen from '../screens/debts/AddEditDebtScreen';
import DebtHistoryScreen from '../screens/debts/DebtHistoryScreen';
import StoresScreen from '../screens/stores/StoresScreen';
import StoreDetailsScreen from '../screens/stores/StoreDetailsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import AddEditMessageScreen from '../screens/messages/AddEditMessageScreen';
import AccountsScreen from '../screens/transactions/AccountsScreen';
import AddEditAccountScreen from '../screens/transactions/AddEditAccountScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import AddEditTransactionScreen from '../screens/transactions/AddEditTransactionScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import AddEditPaymentScreen from '../screens/payments/AddEditPaymentScreen';
import StockRequestsScreen from '../screens/stock/StockRequestsScreen';
import AddEditStockRequestScreen from '../screens/stock/AddEditStockRequestScreen';

// Reports
import ReportsScreen from '../screens/reports/ReportsScreen';
import IncomeStatementScreen from '../screens/reports/IncomeStatementScreen';

// Admin
import RolesScreen from '../screens/admin/RolesScreen';
import AddEditRoleScreen from '../screens/admin/AddEditRoleScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import AddEditUserScreen from '../screens/admin/AddEditUserScreen';
import BranchesScreen from '../screens/admin/BranchesScreen';
import AddEditBranchScreen from '../screens/admin/AddEditBranchScreen';
import BranchDetailsScreen from '../screens/admin/BranchDetailsScreen';

// Settings
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  ProductsTab: undefined;
  SalesTab: undefined;
  BusinessTab: undefined;
  AdminTab: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetails: { productId: string };
  AddEditProduct: { productId?: string };
  StockTaking: undefined;
  Categories: undefined;
  AddEditCategory: { categoryId?: string };
  StockAdjustments: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetails: { saleId: string };
  AddEditSale: { saleId?: string };
  Orders: undefined;
  OrderDetails: { orderId: string };
  AddEditOrder: { orderId?: string };
  ProformaInvoices: undefined;
  ProformaDetails: { proformaId: string };
  AddEditProforma: { proformaId?: string };
  Invoices: undefined;
  PrintReceipt: { saleId: string };
};

export type BusinessStackParamList = {
  CustomersList: undefined;
  CustomerDetails: { customerId: string };
  AddEditCustomer: { customerId?: string };
  Expenses: undefined;
  AddEditExpense: { expenseId?: string };
  ExpenseTypes: undefined;
  AddEditExpenseType: { typeId?: string };
  Purchases: undefined;
  AddEditPurchase: { purchaseId?: string };
  Suppliers: undefined;
  AddEditSupplier: { supplierId?: string };
  BulkPurchase: undefined;
  Freights: undefined;
  AddEditFreight: { freightId?: string };
  Devices: undefined;
  AddEditDevice: { deviceId?: string };
  Services: undefined;
  AddEditService: { serviceId?: string };
  Debts: undefined;
  AddEditDebt: { debtId?: string };
  DebtHistory: { debtId: string };
  Stores: undefined;
  StoreDetails: { storeId: string };
  Messages: undefined;
  AddEditMessage: { messageId?: string };
  Accounts: undefined;
  AddEditAccount: { accountId?: string };
  Transactions: undefined;
  AddEditTransaction: { transactionId?: string };
  Payments: undefined;
  AddEditPayment: { paymentId?: string };
  StockRequests: undefined;
  AddEditStockRequest: { requestId?: string };
};

export type AdminStackParamList = {
  Roles: undefined;
  AddEditRole: { roleId?: string };
  Users: undefined;
  AddEditUser: { userId?: string };
  Branches: undefined;
  AddEditBranch: { branchId?: string };
  BranchDetails: { branchId: string };
};

export type SettingsStackParamList = {
  SettingsList: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type ReportsStackParamList = {
  ReportsList: undefined;
  IncomeStatement: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProductsStack = createStackNavigator<ProductsStackParamList>();
const SalesStack = createStackNavigator<SalesStackParamList>();
const BusinessStack = createStackNavigator<BusinessStackParamList>();
const AdminStack = createStackNavigator<AdminStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const ReportsStack = createStackNavigator<ReportsStackParamList>();

// Stack Navigators
function ProductsNavigator() {
  const { theme } = useTheme();
  
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <ProductsStack.Screen 
        name="ProductsList" 
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />
      <ProductsStack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen}
        options={{ title: 'Product Details' }}
      />
      <ProductsStack.Screen 
        name="AddEditProduct" 
        component={AddEditProductScreen}
        options={({ route }) => ({
          title: route.params?.productId ? 'Edit Product' : 'Add Product'
        })}
      />
      <ProductsStack.Screen 
        name="StockTaking" 
        component={StockTakingScreen}
        options={{ title: 'Stock Taking' }}
      />
      <ProductsStack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <ProductsStack.Screen 
        name="AddEditCategory" 
        component={AddEditCategoryScreen}
        options={({ route }) => ({
          title: route.params?.categoryId ? 'Edit Category' : 'Add Category'
        })}
      />
      <ProductsStack.Screen 
        name="StockAdjustments" 
        component={StockAdjustmentsScreen}
        options={{ title: 'Stock Adjustments' }}
      />
    </ProductsStack.Navigator>
  );
}

function SalesNavigator() {
  const { theme } = useTheme();
  
  return (
    <SalesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <SalesStack.Screen 
        name="SalesList" 
        component={SalesScreen}
        options={{ title: 'Sales' }}
      />
      <SalesStack.Screen 
        name="SaleDetails" 
        component={SaleDetailsScreen}
        options={{ title: 'Sale Details' }}
      />
      <SalesStack.Screen 
        name="AddEditSale" 
        component={AddEditSaleScreen}
        options={({ route }) => ({
          title: route.params?.saleId ? 'Edit Sale' : 'New Sale'
        })}
      />
      <SalesStack.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <SalesStack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
      <SalesStack.Screen 
        name="AddEditOrder" 
        component={AddEditOrderScreen}
        options={({ route }) => ({
          title: route.params?.orderId ? 'Edit Order' : 'New Order'
        })}
      />
      <SalesStack.Screen 
        name="ProformaInvoices" 
        component={ProformaInvoicesScreen}
        options={{ title: 'Proforma Invoices' }}
      />
      <SalesStack.Screen 
        name="ProformaDetails" 
        component={ProformaDetailsScreen}
        options={{ title: 'Proforma Details' }}
      />
      <SalesStack.Screen 
        name="AddEditProforma" 
        component={AddEditProformaScreen}
        options={({ route }) => ({
          title: route.params?.proformaId ? 'Edit Proforma' : 'New Proforma'
        })}
      />
      <SalesStack.Screen 
        name="Invoices" 
        component={InvoicesScreen}
        options={{ title: 'Invoices' }}
      />
      <SalesStack.Screen 
        name="PrintReceipt" 
        component={PrintReceiptScreen}
        options={{ title: 'Print Receipt' }}
      />
    </SalesStack.Navigator>
  );
}

function BusinessNavigator() {
  const { theme } = useTheme();
  
  return (
    <BusinessStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <BusinessStack.Screen 
        name="CustomersList" 
        component={CustomersScreen}
        options={{ title: 'Customers' }}
      />
      <BusinessStack.Screen 
        name="CustomerDetails" 
        component={CustomerDetailsScreen}
        options={{ title: 'Customer Details' }}
      />
      <BusinessStack.Screen 
        name="AddEditCustomer" 
        component={AddEditCustomerScreen}
        options={({ route }) => ({
          title: route.params?.customerId ? 'Edit Customer' : 'Add Customer'
        })}
      />
      <BusinessStack.Screen 
        name="Expenses" 
        component={ExpensesScreen}
        options={{ title: 'Expenses' }}
      />
      <BusinessStack.Screen 
        name="AddEditExpense" 
        component={AddEditExpenseScreen}
        options={({ route }) => ({
          title: route.params?.expenseId ? 'Edit Expense' : 'New Expense'
        })}
      />
      <BusinessStack.Screen 
        name="ExpenseTypes" 
        component={ExpenseTypesScreen}
        options={{ title: 'Expense Types' }}
      />
      <BusinessStack.Screen 
        name="AddEditExpenseType" 
        component={AddEditExpenseTypeScreen}
        options={({ route }) => ({
          title: route.params?.typeId ? 'Edit Expense Type' : 'New Expense Type'
        })}
      />
      <BusinessStack.Screen 
        name="Purchases" 
        component={PurchasesScreen}
        options={{ title: 'Purchases' }}
      />
      <BusinessStack.Screen 
        name="AddEditPurchase" 
        component={AddEditPurchaseScreen}
        options={({ route }) => ({
          title: route.params?.purchaseId ? 'Edit Purchase' : 'New Purchase'
        })}
      />
      <BusinessStack.Screen 
        name="Suppliers" 
        component={SuppliersScreen}
        options={{ title: 'Suppliers' }}
      />
      <BusinessStack.Screen 
        name="AddEditSupplier" 
        component={AddEditSupplierScreen}
        options={({ route }) => ({
          title: route.params?.supplierId ? 'Edit Supplier' : 'New Supplier'
        })}
      />
      <BusinessStack.Screen 
        name="BulkPurchase" 
        component={BulkPurchaseScreen}
        options={{ title: 'Bulk Purchase' }}
      />
      <BusinessStack.Screen 
        name="Freights" 
        component={FreightsScreen}
        options={{ title: 'Freights' }}
      />
      <BusinessStack.Screen 
        name="AddEditFreight" 
        component={AddEditFreightScreen}
        options={({ route }) => ({
          title: route.params?.freightId ? 'Edit Freight' : 'New Freight'
        })}
      />
      <BusinessStack.Screen 
        name="Devices" 
        component={DevicesScreen}
        options={{ title: 'Devices' }}
      />
      <BusinessStack.Screen 
        name="AddEditDevice" 
        component={AddEditDeviceScreen}
        options={({ route }) => ({
          title: route.params?.deviceId ? 'Edit Device' : 'New Device'
        })}
      />
      <BusinessStack.Screen 
        name="Services" 
        component={ServicesScreen}
        options={{ title: 'Services' }}
      />
      <BusinessStack.Screen 
        name="AddEditService" 
        component={AddEditServiceScreen}
        options={({ route }) => ({
          title: route.params?.serviceId ? 'Edit Service' : 'New Service'
        })}
      />
      <BusinessStack.Screen 
        name="Debts" 
        component={DebtsScreen}
        options={{ title: 'Debts' }}
      />
      <BusinessStack.Screen 
        name="AddEditDebt" 
        component={AddEditDebtScreen}
        options={({ route }) => ({
          title: route.params?.debtId ? 'Edit Debt' : 'New Debt'
        })}
      />
      <BusinessStack.Screen 
        name="DebtHistory" 
        component={DebtHistoryScreen}
        options={{ title: 'Debt History' }}
      />
      <BusinessStack.Screen 
        name="Stores" 
        component={StoresScreen}
        options={{ title: 'Stores' }}
      />
      <BusinessStack.Screen 
        name="StoreDetails" 
        component={StoreDetailsScreen}
        options={{ title: 'Store Details' }}
      />
      <BusinessStack.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <BusinessStack.Screen 
        name="AddEditMessage" 
        component={AddEditMessageScreen}
        options={({ route }) => ({
          title: route.params?.messageId ? 'Edit Message' : 'New Message'
        })}
      />
      <BusinessStack.Screen 
        name="Accounts" 
        component={AccountsScreen}
        options={{ title: 'Accounts' }}
      />
      <BusinessStack.Screen 
        name="AddEditAccount" 
        component={AddEditAccountScreen}
        options={({ route }) => ({
          title: route.params?.accountId ? 'Edit Account' : 'New Account'
        })}
      />
      <BusinessStack.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{ title: 'Transactions' }}
      />
      <BusinessStack.Screen 
        name="AddEditTransaction" 
        component={AddEditTransactionScreen}
        options={({ route }) => ({
          title: route.params?.transactionId ? 'Edit Transaction' : 'New Transaction'
        })}
      />
      <BusinessStack.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <BusinessStack.Screen 
        name="AddEditPayment" 
        component={AddEditPaymentScreen}
        options={({ route }) => ({
          title: route.params?.paymentId ? 'Edit Payment' : 'New Payment'
        })}
      />
      <BusinessStack.Screen 
        name="StockRequests" 
        component={StockRequestsScreen}
        options={{ title: 'Stock Requests' }}
      />
      <BusinessStack.Screen 
        name="AddEditStockRequest" 
        component={AddEditStockRequestScreen}
        options={({ route }) => ({
          title: route.params?.requestId ? 'Edit Request' : 'New Stock Request'
        })}
      />
    </BusinessStack.Navigator>
  );
}

function AdminNavigator() {
  const { theme } = useTheme();
  
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <AdminStack.Screen 
        name="Roles" 
        component={RolesScreen}
        options={{ title: 'Roles' }}
      />
      <AdminStack.Screen 
        name="AddEditRole" 
        component={AddEditRoleScreen}
        options={({ route }) => ({
          title: route.params?.roleId ? 'Edit Role' : 'New Role'
        })}
      />
      <AdminStack.Screen 
        name="Users" 
        component={UsersScreen}
        options={{ title: 'Users' }}
      />
      <AdminStack.Screen 
        name="AddEditUser" 
        component={AddEditUserScreen}
        options={({ route }) => ({
          title: route.params?.userId ? 'Edit User' : 'New User'
        })}
      />
      <AdminStack.Screen 
        name="Branches" 
        component={BranchesScreen}
        options={{ title: 'Branches' }}
      />
      <AdminStack.Screen 
        name="AddEditBranch" 
        component={AddEditBranchScreen}
        options={({ route }) => ({
          title: route.params?.branchId ? 'Edit Branch' : 'New Branch'
        })}
      />
      <AdminStack.Screen 
        name="BranchDetails" 
        component={BranchDetailsScreen}
        options={{ title: 'Branch Details' }}
      />
    </AdminStack.Navigator>
  );
}

function ReportsNavigator() {
  const { theme } = useTheme();
  
  return (
    <ReportsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <ReportsStack.Screen 
        name="ReportsList" 
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <ReportsStack.Screen 
        name="IncomeStatement" 
        component={IncomeStatementScreen}
        options={{ title: 'Income Statement' }}
      />
    </ReportsStack.Navigator>
  );
}

function SettingsNavigator() {
  const { theme } = useTheme();
  
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <SettingsStack.Screen 
        name="SettingsList" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <SettingsStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <SettingsStack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
    </SettingsStack.Navigator>
  );
}

const MainNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAppSelector(state => state.auth);
  
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.SHOP_OWNER;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'ProductsTab':
              iconName = 'inventory';
              break;
            case 'SalesTab':
              iconName = 'point-of-sale';
              break;
            case 'BusinessTab':
              iconName = 'business';
              break;
            case 'AdminTab':
              iconName = 'admin-panel-settings';
              break;
            case 'Reports':
              iconName = 'analytics';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: t('navigation.dashboard') }}
      />
      <Tab.Screen 
        name="ProductsTab" 
        component={ProductsNavigator}
        options={{ tabBarLabel: t('navigation.products') }}
      />
      <Tab.Screen 
        name="SalesTab" 
        component={SalesNavigator}
        options={{ tabBarLabel: t('navigation.sales') }}
      />
      <Tab.Screen 
        name="BusinessTab" 
        component={BusinessNavigator}
        options={{ tabBarLabel: 'Business' }}
      />
      {(isAdmin || isManager) && (
        <Tab.Screen 
          name="AdminTab" 
          component={AdminNavigator}
          options={{ tabBarLabel: 'Admin' }}
        />
      )}
      <Tab.Screen 
        name="Reports" 
        component={ReportsNavigator}
        options={{ tabBarLabel: t('navigation.reports') }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsNavigator}
        options={{ tabBarLabel: t('navigation.settings') }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
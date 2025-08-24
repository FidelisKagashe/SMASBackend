import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import AddEditProductScreen from '../screens/products/AddEditProductScreen';
import SalesScreen from '../screens/sales/SalesScreen';
import SaleDetailsScreen from '../screens/sales/SaleDetailsScreen';
import AddEditSaleScreen from '../screens/sales/AddEditSaleScreen';
import CustomersScreen from '../screens/customers/CustomersScreen';
import CustomerDetailsScreen from '../screens/customers/CustomerDetailsScreen';
import AddEditCustomerScreen from '../screens/customers/AddEditCustomerScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  ProductsTab: undefined;
  SalesTab: undefined;
  CustomersTab: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetails: { productId: string };
  AddEditProduct: { productId?: string };
};

export type SalesStackParamList = {
  SalesList: undefined;
  SaleDetails: { saleId: string };
  AddEditSale: { saleId?: string };
};

export type CustomersStackParamList = {
  CustomersList: undefined;
  CustomerDetails: { customerId: string };
  AddEditCustomer: { customerId?: string };
};

export type SettingsStackParamList = {
  SettingsList: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProductsStack = createStackNavigator<ProductsStackParamList>();
const SalesStack = createStackNavigator<SalesStackParamList>();
const CustomersStack = createStackNavigator<CustomersStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

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
    </SalesStack.Navigator>
  );
}

function CustomersNavigator() {
  const { theme } = useTheme();
  
  return (
    <CustomersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
      }}
    >
      <CustomersStack.Screen 
        name="CustomersList" 
        component={CustomersScreen}
        options={{ title: 'Customers' }}
      />
      <CustomersStack.Screen 
        name="CustomerDetails" 
        component={CustomerDetailsScreen}
        options={{ title: 'Customer Details' }}
      />
      <CustomersStack.Screen 
        name="AddEditCustomer" 
        component={AddEditCustomerScreen}
        options={({ route }) => ({
          title: route.params?.customerId ? 'Edit Customer' : 'Add Customer'
        })}
      />
    </CustomersStack.Navigator>
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
    </SettingsStack.Navigator>
  );
}

const MainNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

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
            case 'CustomersTab':
              iconName = 'people';
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
        name="CustomersTab" 
        component={CustomersNavigator}
        options={{ tabBarLabel: t('navigation.customers') }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
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
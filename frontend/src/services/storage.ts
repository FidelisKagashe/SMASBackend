import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { STORAGE_KEYS } from '../constants/api';
import { Product, Sale, Customer, SyncStatus } from '../types';

class StorageService {
  private db: SQLite.WebSQLDatabase | null = null;

  constructor() {
    this.initializeDatabase();
  }

  // Initialize SQLite database for offline storage
  private async initializeDatabase() {
    try {
      this.db = SQLite.openDatabase('smasapp.db');
      
      this.db.transaction((tx) => {
        // Products table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            category TEXT,
            image TEXT,
            created_at TEXT,
            updated_at TEXT,
            synced INTEGER DEFAULT 0
          );
        `);

        // Sales table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            customer_id TEXT,
            total REAL NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT,
            synced INTEGER DEFAULT 0
          );
        `);

        // Sale items table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS sale_items (
            id TEXT PRIMARY KEY,
            sale_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales (id)
          );
        `);

        // Customers table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            created_at TEXT,
            updated_at TEXT,
            synced INTEGER DEFAULT 0
          );
        `);

        // Sync queue table
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            method TEXT NOT NULL,
            url TEXT NOT NULL,
            data TEXT,
            timestamp TEXT NOT NULL,
            retries INTEGER DEFAULT 0
          );
        `);
      });
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  // Generic AsyncStorage methods
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to store item ${key}:`, error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      throw error;
    }
  }

  async setObject(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to store object ${key}:`, error);
      throw error;
    }
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get object ${key}:`, error);
      return null;
    }
  }

  // SQLite methods for offline data
  async saveProducts(products: Product[]): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        products.forEach((product) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO products 
             (id, name, description, price, stock, category, image, created_at, updated_at, synced) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              product.id,
              product.name,
              product.description,
              product.price,
              product.stock,
              product.category,
              product.image || '',
              product.createdAt,
              product.updatedAt,
            ]
          );
        });
      }, reject, resolve);
    });
  }

  async getProducts(): Promise<Product[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM products ORDER BY name',
          [],
          (_, { rows }) => {
            const products: Product[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              products.push({
                id: row.id,
                name: row.name,
                description: row.description,
                price: row.price,
                stock: row.stock,
                category: row.category,
                image: row.image,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
              });
            }
            resolve(products);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async saveSales(sales: Sale[]): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        sales.forEach((sale) => {
          // Save sale
          tx.executeSql(
            `INSERT OR REPLACE INTO sales 
             (id, customer_id, total, status, created_at, updated_at, synced) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [
              sale.id,
              sale.customerId,
              sale.total,
              sale.status,
              sale.createdAt,
              sale.updatedAt,
            ]
          );

          // Save sale items
          sale.products.forEach((item, index) => {
            tx.executeSql(
              `INSERT OR REPLACE INTO sale_items 
               (id, sale_id, product_id, quantity, price, total) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                `${sale.id}_${index}`,
                sale.id,
                item.productId,
                item.quantity,
                item.price,
                item.total,
              ]
            );
          });
        });
      }, reject, resolve);
    });
  }

  async getSales(): Promise<Sale[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM sales ORDER BY created_at DESC',
          [],
          (_, { rows }) => {
            const salesPromises: Promise<Sale>[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              const salePromise = new Promise<Sale>((resolveSale, rejectSale) => {
                tx.executeSql(
                  'SELECT * FROM sale_items WHERE sale_id = ?',
                  [row.id],
                  (_, { rows: itemRows }) => {
                    const products = [];
                    for (let j = 0; j < itemRows.length; j++) {
                      const itemRow = itemRows.item(j);
                      products.push({
                        productId: itemRow.product_id,
                        quantity: itemRow.quantity,
                        price: itemRow.price,
                        total: itemRow.total,
                      });
                    }
                    
                    resolveSale({
                      id: row.id,
                      customerId: row.customer_id,
                      products,
                      total: row.total,
                      status: row.status,
                      createdAt: row.created_at,
                      updatedAt: row.updated_at,
                    });
                  },
                  (_, error) => {
                    rejectSale(error);
                    return false;
                  }
                );
              });
              
              salesPromises.push(salePromise);
            }
            
            Promise.all(salesPromises).then(resolve).catch(reject);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async saveCustomers(customers: Customer[]): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        customers.forEach((customer) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO customers 
             (id, name, email, phone, address, created_at, updated_at, synced) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              customer.id,
              customer.name,
              customer.email,
              customer.phone,
              customer.address,
              customer.createdAt,
              customer.updatedAt,
            ]
          );
        });
      }, reject, resolve);
    });
  }

  async getCustomers(): Promise<Customer[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      this.db!.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM customers ORDER BY name',
          [],
          (_, { rows }) => {
            const customers: Customer[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              customers.push({
                id: row.id,
                name: row.name,
                email: row.email,
                phone: row.phone,
                address: row.address,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
              });
            }
            resolve(customers);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Sync status management
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const lastSync = await this.getItem(STORAGE_KEYS.LAST_SYNC);
      const queueData = await this.getItem(STORAGE_KEYS.SYNC_QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];
      
      return {
        lastSync,
        pendingChanges: queue.length,
        isOnline: true, // This should be updated by network listener
        isSyncing: false,
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        lastSync: null,
        pendingChanges: 0,
        isOnline: false,
        isSyncing: false,
      };
    }
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    try {
      if (this.db) {
        this.db.transaction((tx) => {
          tx.executeSql('DELETE FROM products');
          tx.executeSql('DELETE FROM sales');
          tx.executeSql('DELETE FROM sale_items');
          tx.executeSql('DELETE FROM customers');
          tx.executeSql('DELETE FROM sync_queue');
        });
      }
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.OFFLINE_DATA,
        STORAGE_KEYS.SYNC_QUEUE,
        STORAGE_KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }
}

export const storageService = new StorageService();
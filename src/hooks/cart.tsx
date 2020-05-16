import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);
const KEY_ASYNC_STORAGE = '@GoMarketplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      AsyncStorage.clear();
      const itensStorage = await AsyncStorage.getItem(KEY_ASYNC_STORAGE);
      if (itensStorage) {
        setProducts(JSON.parse(itensStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    product => {
      const hasProd = products.find(prod => prod.id === product.id);
      let auxProducts;
      if (hasProd) {
        auxProducts = products.map(prod =>
          prod.id === product.id
            ? { ...prod, quantity: prod.quantity + 1 }
            : prod,
        );
      } else {
        auxProducts = [...products, { ...product, quantity: 1 }];
      }

      AsyncStorage.setItem(KEY_ASYNC_STORAGE, JSON.stringify(auxProducts));

      setProducts(auxProducts);
    },
    [products],
  );

  const increment = useCallback(
    id => {
      const auxProducts = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
      );
      AsyncStorage.setItem(KEY_ASYNC_STORAGE, JSON.stringify(auxProducts));
      setProducts(auxProducts);
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      const auxProducts = products.map(prod =>
        prod.id === id && prod.quantity > 1
          ? { ...prod, quantity: prod.quantity - 1 }
          : prod,
      );

      AsyncStorage.setItem(KEY_ASYNC_STORAGE, JSON.stringify(auxProducts));
      setProducts(auxProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

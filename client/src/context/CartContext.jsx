import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { STORE_PURCHASES_PAUSED, STORE_PURCHASES_PAUSED_MESSAGE } from "../constants/storefront";
import { getPrimaryProductImage } from "../utils/productVisuals";

const CartContext = createContext(null);
const cartStorageKey = "manoshop_cart";
const maxDigitalQuantity = 10;

const normalizeStoredItems = (items) =>
  Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        productType: item.productType || "physical",
        image: getPrimaryProductImage(item) || item.image || "",
      }))
    : [];

const getQuantityLimit = (item) =>
  item.productType === "digital"
    ? maxDigitalQuantity
    : Math.max(Number(item.stock) || 0, 0);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedItems = localStorage.getItem(cartStorageKey);
    return storedItems ? normalizeStoredItems(JSON.parse(storedItems)) : [];
  });

  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (STORE_PURCHASES_PAUSED) {
      toast.error(STORE_PURCHASES_PAUSED_MESSAGE);
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product === product._id);

      if (existingItem) {
        const updatedItems = currentItems.map((item) =>
          item.product === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, getQuantityLimit(item)),
              }
            : item
        );
        toast.success("Krepšelis atnaujintas.");
        return updatedItems;
      }

      toast.success("Prekė pridėta į krepšelį.");
      return [
        ...currentItems,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          image: getPrimaryProductImage(product) || "",
          stock: product.stock,
          category: product.category,
          productType: product.productType || "physical",
          quantity: Math.min(
            quantity,
            getQuantityLimit({
              productType: product.productType || "physical",
              stock: product.stock,
            }) || quantity
          ),
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product === productId
          ? {
              ...item,
              quantity: Math.min(quantity, getQuantityLimit(item) || quantity),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product !== productId)
    );
    toast.success("Prekė pašalinta iš krepšelio.");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    purchasesPaused: STORE_PURCHASES_PAUSED,
    purchasesPausedMessage: STORE_PURCHASES_PAUSED_MESSAGE,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart turi būti naudojamas CartProvider viduje.");
  }

  return context;
};

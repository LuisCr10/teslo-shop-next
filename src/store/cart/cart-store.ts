import type { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Función externa para calcular el resumen del carrito
const calculateSummaryInformation = (cart: CartProduct[]) => {
  const subTotal = cart.reduce(
    (subTotal, product) => product.quantity * product.price + subTotal,
    0
  );
  const tax = subTotal * 0.15;
  const total = subTotal + tax;
  const itemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  return { subTotal, tax, total, itemsInCart };
};

interface State {
  cart: CartProduct[];

  getTotalItems: () => number;
  getSummaryInformation: () => {
    subTotal: number;
    tax: number;
    total: number;
    itemsInCart: number;
  };

  addProductTocart: (product: CartProduct) => void;
  updateProductQuantity: (product: CartProduct, quantity: number) => void;
  removeProduct: (product: CartProduct) => void;

  clearCart: () => void;
}

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      cart: [],

      // Obtener el total de artículos en el carrito
      getTotalItems: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },

      // Obtener el resumen del carrito
      getSummaryInformation: () => {
        const { cart } = get();
        return calculateSummaryInformation(cart);
      },

      // Agregar producto al carrito
      addProductTocart: (product: CartProduct) => {
        const { cart } = get();

        const productInCart = cart.some(
          (item) => item.id === product.id && item.size === product.size
        );

        if (!productInCart) {
          set({ cart: [...cart, product] });
          return;
        }

        const updatedCartProducts = cart.map((item) => {
          if (item.id === product.id && item.size === product.size) {
            return { ...item, quantity: item.quantity + product.quantity };
          }
          return item;
        });

        set({ cart: updatedCartProducts });
      },

      // Actualizar la cantidad de un producto
      updateProductQuantity: (product: CartProduct, quantity: number) => {
        const { cart } = get();

        const updatedCartProducts = cart.map((item) => {
          if (item.id === product.id && item.size === product.size) {
            return { ...item, quantity: quantity };
          }
          return item;
        });

        set({ cart: updatedCartProducts });
      },

      // Eliminar un producto del carrito
      removeProduct: (product: CartProduct) => {
        const { cart } = get();
        const updatedCartProducts = cart.filter(
          (item) => item.id !== product.id || item.size !== product.size
        );

        set({ cart: updatedCartProducts });
      },

      // Limpiar el carrito
      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: "shopping-cart", // Nombre para el almacenamiento persistente
    }
  )
);

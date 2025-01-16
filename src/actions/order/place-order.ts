"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth.config";
import type { Address, Size } from "@/interfaces";

interface ProductToOrder {
  productId: string;
  quantity: number;
  size: Size;
}

export const placeOrder = async (
  productIds: ProductToOrder[],
  address: Address
) => {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      ok: false,
      message: "No hay sesión de usuario",
    };
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds.map((p) => p.productId) },
      },
    });

    const itemsInOrder = productIds.reduce((count, p) => count + p.quantity, 0);

    const { subTotal, tax, total } = productIds.reduce(
      (totals, item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Producto ${item.productId} no existe`);

        const subTotal = product.price * item.quantity;
        totals.subTotal += subTotal;
        totals.tax += subTotal * 0.15;
        totals.total += subTotal * 1.15;
        return totals;
      },
      { subTotal: 0, tax: 0, total: 0 }
    );

    const prismaTx = await prisma.$transaction(async (tx) => {
      const updatedProducts = await Promise.all(
        products.map((product) => {
          const productQuantity = productIds
            .filter((p) => p.productId === product.id)
            .reduce((acc, item) => item.quantity + acc, 0);

          if (productQuantity === 0) {
            throw new Error(`${product.id} no tiene cantidad definida`);
          }

          return tx.product.update({
            where: { id: product.id },
            data: {
              inStock: { decrement: productQuantity },
            },
          });
        })
      );

      updatedProducts.forEach((product) => {
        if (product.inStock < 0) {
          throw new Error(
            `${product.title} no tiene inventario suficiente (${product.inStock})`
          );
        }
      });

      const order = await tx.order.create({
        data: {
          userId,
          itemsInOrder,
          subTotal,
          tax,
          total,
          OrderItem: {
            createMany: {
              data: productIds.map((p) => ({
                quantity: p.quantity,
                size: p.size,
                productId: p.productId,
                price:
                  products.find((product) => product.id === p.productId)?.price ??
                  0,
              })),
            },
          },
        },
      });

      const { country, ...restAddress } = address;
      const orderAddress = await tx.orderAddress.create({
        data: {
          ...restAddress,
          countryId: country,
          orderId: order.id,
        },
      });

      return { updatedProducts, order, orderAddress };
    });

    return {
      ok: true,
      order: prismaTx.order,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      message: (error instanceof Error ? error.message : "Error inesperado"),
    };
  }
};

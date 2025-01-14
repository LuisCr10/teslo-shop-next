'use server'

import prisma from '@/lib/prisma'

// import { sleep } from '@/utils';

export const getStockBySlug = async (slug: string): Promise<number> => {
  try {
    const stock = await prisma.product.findFirst({
      where: { slug },
      select: { inStock: true },
    });

    return stock?.inStock ?? 0;
  } catch {
    return 0;
  }
};


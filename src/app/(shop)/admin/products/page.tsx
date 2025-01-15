"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPaginatedProductsWithImages } from "@/actions";
import { Pagination, ProductImage, Title } from "@/components";
import { currencyFormat } from "@/utils";
import Link from "next/link";

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<{ id: string; slug: string; title: string; price: number; gender: string; inStock: number; sizes: string[]; ProductImage: { url: string }[] }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);

    async function fetchProducts() {
      const { products, totalPages } = await getPaginatedProductsWithImages({ page });
      setProducts(products);
      setTotalPages(totalPages);
    }

    fetchProducts();
  }, [searchParams]);

  return (
    <>
      <Title title="Mantenimiento de productos" />

      <div className="flex justify-end mb-5">
        <Link href="/admin/product/new" className="btn-primary">
          Nuevo producto
        </Link>
      </div>

      <div className="mb-10">
        <table className="min-w-full">
          <thead className="bg-gray-200 border-b">
            <tr>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Imagen
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Titulo
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Precio
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Género
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Inventario
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Tallas
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/product/${product.slug}`}>
                    <ProductImage
                      src={product.ProductImage[0]?.url}
                      width={80}
                      height={80}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </Link>
                </td>
                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/product/${product.slug}`}
                    className="hover:underline"
                  >
                    {product.title}
                  </Link>
                </td>
                <td className="text-sm font-bold text-gray-900 px-6 py-4 whitespace-nowrap">
                  {currencyFormat(product.price)}
                </td>
                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  {product.gender}
                </td>
                <td className="text-sm text-gray-900 font-bold px-6 py-4 whitespace-nowrap">
                  {product.inStock}
                </td>
                <td className="text-sm text-gray-900 font-bold px-6 py-4 whitespace-nowrap">
                  {product.sizes.join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}

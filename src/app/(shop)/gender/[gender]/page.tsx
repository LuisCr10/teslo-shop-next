export const revalidate = 60 // 60 segundos

import { Pagination, ProductGrid, Title } from '@/components'

import { Gender } from '@prisma/client'
import { getPaginatedProductsWithImages } from '@/actions'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ gender: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function GenderByPage({ params, searchParams }: Props) {
  // Desestructurar los params y searchParams
  const { gender } = await params
  const { page: pageParam } = await searchParams

  // Obtener el número de página, por defecto a 1
  const page = pageParam ? parseInt(pageParam) : 1

  // Obtener los productos con paginación e imágenes
  const { products, /* currentPage, */ totalPages } =
    await getPaginatedProductsWithImages({
      page,
      gender: gender as Gender
    })

  // Redireccionar si no hay productos
  if (products.length === 0) {
    redirect(`/gender/${gender}`)
  }

  // Etiquetas para los títulos
  const labels: Record<string, string> = {
    men: 'para hombres',
    women: 'para mujeres',
    kid: 'para niños',
    unisex: 'para todos'
  }

  return (
    <>
      <Title
        title={`Artículos de ${labels[gender]}`}
        subtitle='Todos los productos'
        className='mb-2'
      />
      <ProductGrid products={products} />
      <Pagination totalPages={totalPages} />
    </>
  )
}
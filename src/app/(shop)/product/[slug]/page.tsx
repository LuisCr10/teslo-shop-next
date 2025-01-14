export const revalidate = 604800 // 7 días

import type { Metadata } from 'next'
import {
  ProductMobileSlideshow,
  ProductSlideshow,
  StockLabel
} from '@/components'

import { AddToCart } from './ui/AddToCart'
import { getProductBySlug } from '@/actions'
import { notFound } from 'next/navigation'
import { titleFont } from '@/config/fonts'

// import { initialData } from '@/seed/seed'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  // read route params
  const { slug } = await params

  // fetch data
  const product = await getProductBySlug(slug)

  return {
    title: product?.title ?? 'Producto no encontrado',
    description: product?.description ?? '',
    openGraph: {
      title: product?.title ?? 'Producto no encontrado',
      description: product?.description ?? '',
      images: [`/products/${product?.images[1]}`]
    }
  }
}


export default async function ProductBySlugPage({ params }: Props) {
  const { slug } = await params
  // const product = initialData.products.find((product) => product.slug === slug)

  const product = await getProductBySlug(slug)
  if (!product) {
    notFound()
  }

  return (
    <div className='mt-5 mb-20 grid grid-cols-1 md:grid-cols-3 gap-3'>
      {/* Slideshow */}
      <div className='col-span-1 md:col-span-2 '>
        {/* Mobile Slideshow */}
        <ProductMobileSlideshow
          title={product.title}
          images={product.images}
          className='block md:hidden'
        />

        {/* Desktop Slideshow */}
        <ProductSlideshow
          title={product.title}
          images={product.images}
          className='hidden md:block'
        />
      </div>

      {/* Detalles */}
      <div className='col-span-1 px-5'>
        <h1 className={` ${titleFont.className} antialiased font-bold text-xl`}>
          {product.title}
        </h1>
        <StockLabel slug={product.slug} />
        <p className='text-lg mb-5'>${product.price}</p>
        <AddToCart product={product} />

        {/* Descripción */}
        <h3 className='font-bold text-sm'>Descripción</h3>
        <p className='font-light'>{product.description}</p>
      </div>
    </div>
  )
}
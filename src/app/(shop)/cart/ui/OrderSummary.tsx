'use client'

import { useEffect, useState } from 'react'

import { currencyFormat } from '@/utils'
import { useCartStore } from '@/store'
import { useRouter } from 'next/navigation'

export const OrderSummary = () => {
  const router = useRouter()

  const [loaded, setLoaded] = useState(false)
  useCartStore((state) => state.cart)
  const summaryInformation = useCartStore(
    (state) => state.getSummaryInformation
  )
  const { itemsInCart, subTotal, tax, total } = summaryInformation()

  useEffect(() => {
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (itemsInCart === 0 && loaded === true) {
      router.replace('/empty')
    }
  }, [itemsInCart, loaded, router])

  if (!loaded) return <p>Loading...</p>

  return (
    <div className='grid grid-cols-2'>
      <span>No. Productos</span>
      <span className='text-right'>
        {itemsInCart === 1 ? '1 artículo' : `${itemsInCart} artículos`}
      </span>

      <span>Subtotal</span>
      <span className='text-right'>{currencyFormat(subTotal)}</span>

      <span>Impuestos (15%)</span>
      <span className='text-right'>{currencyFormat(tax)}</span>

      <span className='mt-5 text-2xl'>Total:</span>
      <span className='mt-5 text-2xl text-right'>{currencyFormat(total)}</span>
    </div>
  )
}
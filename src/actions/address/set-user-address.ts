'use server'

import type { Address } from '@/interfaces'
import prisma from '@/lib/prisma'

export const setUserAddress = async (address: Address, userId: string) => {
  try {
    const newAddress = await createOrReplaceAddress(address, userId)

    return {
      ok: true,
      address: newAddress
    }
  } catch (error) {
    console.log(error)
    return {
      ok: false,
      message: 'No se pudo grabar la dirección'
    }
  }
}
const createOrReplaceAddress = async (address: Address, userId: string) => {
  try {
    console.log({ userId })

    // Buscar dirección existente
    const storedAddress = await prisma.userAddress.findUnique({
      where: { userId }
    })

    console.log({ storedAddress })

    // Preparar datos para guardar
    const addressToSave = {
      userId: userId || '',
      address: address.address ?? '',
      address2: address.address2 ?? '',
      countryId: address.country ?? '',
      city: address.city ?? '',
      firstName: address.firstName ?? '',
      lastName: address.lastName ?? '',
      phone: address.phone ?? '',
      postalCode: address.postalCode ?? ''
    }

    // Si no existe una dirección, la creamos
    if (!storedAddress) {
      console.log('no existe una dirección almacenada')
      const newAddress = await prisma.userAddress.create({
        data: addressToSave
      })
      console.log('newAddress', newAddress)
      return newAddress
    }

    // Si existe, la actualizamos
    const updatedAddress = await prisma.userAddress.update({
      where: { userId },
      data: addressToSave
    })
    console.log('updatedAddress', updatedAddress)
    return updatedAddress
  } catch (error) {
    console.error(error)
    throw new Error('No se pudo grabar la dirección')
  }
}
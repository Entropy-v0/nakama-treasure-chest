import { supabase, isSupabaseConfigured } from './client'
import { compressImage } from '../../utils/imageCompressor'

const BUCKET_NAME = 'covers'

/**
 * Servicio de almacenamiento en Supabase Storage para carátulas y portadas multimedia.
 */
export const storageService = {
  /**
   * Sube una imagen a Supabase Storage con compresión automática a WebP y retorna su URL pública.
   * Si Supabase no está configurado (modo mock/desarrollo local), convierte el archivo
   * a un Data URL Base64 para permitir pruebas offline.
   */
  async uploadCover(file: File, userId?: string): Promise<string> {
    // 1. Optimizar imagen en el cliente (reduce el peso ~85%-95% a WebP)
    const optimizedFile = await compressImage(file, {
      maxWidth: 800,
      maxHeight: 1200,
      quality: 0.82,
      mimeType: 'image/webp',
    })

    if (!isSupabaseConfigured) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = err => reject(err)
        reader.readAsDataURL(optimizedFile)
      })
    }

    // Nombre sanitizado en WebP
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const cleanFileName = `${Date.now()}-${randomSuffix}.webp`
    const folder = userId || 'shared'
    const filePath = `${folder}/${cleanFileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, optimizedFile, {
        cacheControl: '31536000', // Caché inmutable por 1 año
        contentType: 'image/webp',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Error al subir la portada a Storage: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    if (!data?.publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la portada.')
    }

    return data.publicUrl
  },

  /**
   * Elimina una carátula por su URL pública de Supabase Storage.
   */
  async deleteCover(publicUrl: string): Promise<void> {
    if (!isSupabaseConfigured || !publicUrl) return

    try {
      const urlParts = publicUrl.split(`/${BUCKET_NAME}/`)
      if (urlParts.length < 2) return
      const filePath = decodeURIComponent(urlParts[1])

      await supabase.storage.from(BUCKET_NAME).remove([filePath])
    } catch (err) {
      console.warn('[storageService] Error eliminando portada anterior:', err)
    }
  },
}


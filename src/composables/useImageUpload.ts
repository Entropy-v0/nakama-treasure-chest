import { ref, computed, onScopeDispose } from 'vue'
import { useAlert } from './useAlert'
import { compressImage, formatBytes } from '../utils/imageCompressor'

export interface UseImageUploadOptions {
  maxSizeBytes?: number
  allowedMimeTypes?: string[]
}

/**
 * useImageUpload — Composable para gestión de selección y previsualización de imágenes locales.
 *
 * Responsabilidad:
 * - Valida tipo MIME y peso máximo antes de procesar el archivo.
 * - Comprime y optimiza a WebP automáticamente en el navegador usando Canvas.
 * - Genera ObjectURL para previsualización instantánea en cliente.
 * - Limpia memoria revocando ObjectURLs tanto al cambiar archivo como al desmontar el componente.
 */
export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    maxSizeBytes = 15 * 1024 * 1024, // Permite hasta 15MB ya que el compresor la reducirá ~90%
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  } = options

  const { showAlert } = useAlert()

  const selectedFile = ref<File | null>(null)
  const previewUrl = ref<string>('')
  const fileSizeText = ref<string>('')
  const isOptimizing = ref<boolean>(false)

  const selectedFileName = computed(() => {
    if (!selectedFile.value) return ''
    return fileSizeText.value ? `${selectedFile.value.name} (${fileSizeText.value})` : selectedFile.value.name
  })
  const hasSelectedImage = computed(() => Boolean(selectedFile.value))

  const clearFile = () => {
    selectedFile.value = null
    fileSizeText.value = ''
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  }

  const handleFileChange = async (event: Event): Promise<boolean> => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return false

    // Validar tipo de archivo
    if (!allowedMimeTypes.includes(file.type) && !file.type.startsWith('image/')) {
      await showAlert({
        type: 'warning',
        title: 'Formato no compatible',
        message: 'Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP).',
      })
      target.value = ''
      return false
    }

    // Validar tamaño máximo
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024))
      await showAlert({
        type: 'warning',
        title: 'Archivo muy pesado',
        message: `La imagen seleccionada supera el límite de ${maxMb} MB.`,
      })
      target.value = ''
      return false
    }

    isOptimizing.value = true
    try {
      // Optimización automática e instantánea en el cliente (a WebP ~85% más liviano)
      const optimized = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 1200,
        quality: 0.82,
        mimeType: 'image/webp',
      })

      selectedFile.value = optimized
      fileSizeText.value = formatBytes(optimized.size)

      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      previewUrl.value = URL.createObjectURL(optimized)
      return true
    } catch (err) {
      console.warn('[useImageUpload] Error en compresión rápida, usando original:', err)
      selectedFile.value = file
      fileSizeText.value = formatBytes(file.size)

      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      previewUrl.value = URL.createObjectURL(file)
      return true
    } finally {
      isOptimizing.value = false
    }
  }

  // Liberar memoria si el scope del composable se destruye
  onScopeDispose(() => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
  })

  return {
    selectedFile,
    previewUrl,
    selectedFileName,
    fileSizeText,
    isOptimizing,
    hasSelectedImage,
    handleFileChange,
    clearFile,
  }
}


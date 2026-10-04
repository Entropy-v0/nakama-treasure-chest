import { ref, onScopeDispose } from 'vue'

/**
 * Composable para centralizar la copia de texto al portapapeles.
 * Proporciona estado reactivo `copied` con temporizador automático
 * y limpieza al desmontar el componente (evita memory leaks).
 */
export function useClipboard(timeout = 1800) {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  const copy = async (text: string | null | undefined): Promise<boolean> => {
    if (!text) return false
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback para entornos donde navigator.clipboard no esté disponible
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      copied.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
      }, timeout)
      return true
    } catch (err) {
      console.warn('[useClipboard] No se pudo copiar al portapapeles:', err)
      return false
    }
  }

  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    copied,
    copy,
  }
}

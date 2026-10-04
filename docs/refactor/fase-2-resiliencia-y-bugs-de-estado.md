# FASE 2: Resiliencia y Erradicación de Bugs de Estado

> **Prioridad:** Alta (Estabilidad y Corrección Funcional)  
> **Objetivo:** Resolver los bugs críticos identificados en la auditoría respecto a la mutación de props, bloqueos en inicialización de sesión y fuga de estado entre cuentas.

---

## 1. Problemas que resuelve esta fase

1. **Mutación directa de Props (Hallazgo C4 de la auditoría):**  
   En `ItemDetailsModal.vue`, se modifica directamente el objeto recibido por props (`props.item.progreso = next` y `Object.assign(props.item, updates)`). Esto rompe el flujo unidireccional de datos de Vue y provocará errores de ejecución cuando los componentes se tipen en estricto.
2. **Carrera en `authStore.initialize()` y deadlock en callback (Hallazgo C5 de la auditoría):**  
   Si `initialize()` es invocado simultáneamente por el router guard y por `App.vue`, se ejecutan dos peticiones concurrentes y se pueden suscribir listeners dobles. Además, dentro del callback `onAuthStateChange` se hace `await fetchProfile()`, lo cual puede provocar bloqueos internos con supabase-js v2.
3. **Fuga de estado al cerrar sesión (Hallazgo C6 de la auditoría):**  
   Al llamar a `signOut()`, el store `crew` no se limpia, manteniendo invitaciones y datos de la tripulación anterior en memoria.
4. **Semántica rota en `AlertModal.vue` y `useAlert.js` (Hallazgo A9 de la auditoría):**  
   El botón "Cancelar" aparece si `isConfirm === true` O si `type === 'warning'`. Como los errores se emiten con `type: 'warning'`, las alertas de error muestran un botón "Cancelar" innecesario. Además, `ItemDetailsModal.handleDelete` utilizaba `showAlert` en lugar de `showConfirm`.

---

## 2. Acciones y Pasos de Implementación

### Paso 2.1: Eliminar la mutación de Props en `ItemDetailsModal.vue`
* En `ItemList.vue`, almacenar el ID del ítem seleccionado (`selectedItemId = ref<number | null>(null)`) y computar `selectedItem = computed(() => items.find(i => i.id === selectedItemId.value))`.
* En `ItemDetailsModal.vue`, cuando el usuario altere el progreso o edite campos, llamar a `updateItem(props.item.id, ...)`. Al actualizarse el store global, la prop computada en el padre transmitirá automáticamente el nuevo valor sin tocar directamente `props.item`.

### Paso 2.2: Blindar `authStore.initialize()` contra carreras
Guardar la promesa en vuelo (`initPromise`) para que múltiples llamadas concurrentes compartan la misma ejecución:
```ts
let initPromise: Promise<void> | null = null

const initialize = async () => {
  if (isInitialized.value) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    isLoading.value = true
    try {
      const { session: currentSession, user: currentUser } = await authService.getSession()
      session.value = currentSession
      user.value = currentUser
      if (currentUser?.id) {
        await fetchProfile(currentUser.id)
      }
      // Listener
      if (!authSubscription) {
        authSubscription = authService.onAuthStateChange((event, newSession) => {
          session.value = newSession
          user.value = newSession?.user ?? null
          // Diferir la llamada fuera del ciclo del callback de Supabase
          if (newSession?.user?.id) {
            setTimeout(() => { fetchProfile(newSession.user.id) }, 0)
          } else {
            profile.value = null
          }
        })
      }
    } finally {
      isLoading.value = false
      isInitialized.value = true
      initPromise = null
    }
  })()

  return initPromise
}
```

### Paso 2.3: Reset Reactivo de `useCrewStore` al cambiar de usuario
En `src/stores/crew.ts`, agregar una función `reset()` y un `watch`:
```ts
const reset = () => {
  crew.value = null
  members.value = []
  pendingInvites.value = []
  sentInvites.value = []
  error.value = null
}

// Limpiar inmediatamente si el usuario cierra sesión o cambia de cuenta
watch(() => authStore.user?.id, (newId, oldId) => {
  if (newId !== oldId) {
    reset()
  }
})
```

### Paso 2.4: Corregir y tipar `useAlert.ts` y `AlertModal.vue`
* Migrar `useAlert.js` a `useAlert.ts`.
* Separar estrictamente `showAlert` (aviso con solo botón "Aceptar") de `showConfirm` (pregunta con "Aceptar" y "Cancelar").
* En `AlertModal.vue`, mostrar el botón de cancelar **únicamente cuando `state.isConfirm === true`**.
* En `ItemDetailsModal.vue`, cambiar `handleDelete` para utilizar `showConfirm` explícitamente:
```ts
const confirmed = await showConfirm({
  title: 'Eliminar de la colección',
  message: `¿Deseas eliminar "${props.item.titulo}" permanentemente?`,
  confirmText: 'Eliminar',
  cancelText: 'Cancelar'
})
if (confirmed) {
  await deleteItem(props.item.id)
  emit('close')
}
```

---

## 3. Criterios de Aceptación y Verificación

1. Modificar el progreso o datos de un ítem en el modal de detalles: no debe haber warnings en la consola de Vue sobre mutación de props (`Avoid mutating a prop directly...`).
2. Abrir diálogos de alerta de error: no debe mostrarse el botón "Cancelar", solo "Aceptar".
3. Abrir confirmación de eliminación: deben mostrarse ambos botones ("Aceptar" y "Cancelar"). Al cancelar, no se debe eliminar la obra.
4. Cerrar sesión y loguearse con otro usuario (o cambiar de cuenta mock): el contador de invitaciones y la tripulación del usuario anterior deben estar totalmente vacíos.

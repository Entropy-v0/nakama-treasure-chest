# FASE 0: Desbloqueo de Compilación y Mocks Locales Coherentes

> **Prioridad:** Inmediata (Fase previa habilitadora)  
> **Objetivo:** Asegurar que la aplicación compile al 100% y que el modo mock local replique exactamente la lógica de negocio de Supabase (especialmente roles de capitán e invitaciones de tripulación).

---

## 1. Problemas que resuelve esta fase

1. **Build roto por componente de Calendario vacío (Hallazgo C1 de la auditoría):**  
   `src/components/Calendar.vue` estaba en 0 bytes, lo que impedía que Vite compilará en producción.
2. **Modo Mock con IDs desincronizados (Hallazgo C9 de la auditoría):**  
   En `auth.service.ts` el usuario mock tiene ID `mock-user-nakama-1`, pero en `crew.service.ts` se creaba la tripulación con `created_by: 'mock-user'`. Esto provocaba que `isCaptain` siempre fuera `false` en local, impidiendo probar las funciones de capitán (renombrar barco, invitar nakamas, disolver tripulación).
3. **Filtro de invitaciones recibidas en modo Mock:**  
   En modo mock, `getPendingInvites()` no filtraba por correo electrónico y devolvía las invitaciones que el propio usuario acababa de enviar.

---

## 2. Acciones y Pasos de Implementación

### Paso 0.1: Restaurar `src/components/Calendar.vue`
* Componente con `<script setup>` y `<template>` funcional, que incluya el encabezado temático de Nakama y un estado "En Desarrollo" para evitar cualquier fallo de Rolldown / Vite.
* En `src/router/index.ts`, garantizar la ruta canónica `/calendar` y redirección para `/calender`.

### Paso 0.2: Crear el Módulo Centralizado `src/mocks/mockUser.ts`
Crear una única fuente de verdad para el usuario simulado:
```ts
import type { User } from '@supabase/supabase-js'

export const MOCK_USER_ID = 'mock-user-nakama-1'
export const MOCK_USER_EMAIL = 'nakama@local.dev'

export function getMockUser(): User {
  return {
    id: MOCK_USER_ID,
    aud: 'authenticated',
    email: MOCK_USER_EMAIL,
    user_metadata: {
      username: 'Capitán Nakama',
      genero: 'masculino',
      avatar_url: null,
    },
    app_metadata: {},
    created_at: new Date().toISOString(),
  } as User
}
```

### Paso 0.3: Sincronizar `crew.service.ts` en Modo Mock
* En `createCrew()`, asignar `created_by: MOCK_USER_ID` y `user_id: MOCK_USER_ID`.
* En `getPendingInvites()`, filtrar invitaciones donde `invitee_email.toLowerCase() === MOCK_USER_EMAIL` y `inviter_id !== MOCK_USER_ID`.

---

## 3. Criterios de Aceptación y Verificación

1. Ejecutar `pnpm run build` y verificar que el comando finalice con código de salida 0.
2. Iniciar `pnpm run dev` con `VITE_USE_MOCK=true`.
3. Iniciar sesión en local:
   * Debe aparecer la bienvenida: *"¡Bienvenido, Capitán! Capitán Nakama"*.
   * Crear una tripulación: debe reconocer al usuario como **Capitán** inmediatamente.
   * Deben mostrarse los botones de "Editar nombre", "Invitar nakama" y "Disolver tripulación".

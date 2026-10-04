# FASE 1: Herramientas de Verificación y Tipado Estricto Base

> **Prioridad:** Alta (Infraestructura de Desarrollo)  
> **Objetivo:** Instalar el compilador de TypeScript y herramientas de linting para que las reglas estrictas de código se comprueben en tiempo de compilación y no en producción.

---

## 1. Problemas que resuelve esta fase

1. **TypeScript "decorativo" (Hallazgo C2 de la auditoría):**  
   El archivo `tsconfig.json` tiene `"strict": true`, pero Vite solo despoja los tipos; no hay ningún proceso que verifique errores de tipos. Errores como enviar campos eliminados (`categoria`, `etiquetas`) pasan desapercibidos.
2. **Falta de scripts de validación en `package.json`:**  
   No existen comandos `type-check` ni `lint`.
3. **Contrato de base de datos incompleto (Hallazgo C3 de la auditoría):**  
   `src/types/database.ts` no contiene las definiciones de `crews`, `crew_members` ni `crew_invites`, lo que obliga al servicio de tripulación a usar múltiples `any`.
4. **Variables de entorno sin tipar en `vite-env.d.ts`:**  
   Falta registrar `VITE_USE_MOCK`.

---

## 2. Acciones y Pasos de Implementación

### Paso 1.1: Instalar dependencias de desarrollo
```bash
pnpm add -D typescript vue-tsc eslint eslint-plugin-vue @vue/eslint-config-typescript prettier
```

### Paso 1.2: Configurar scripts en `package.json`
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "type-check": "vue-tsc --noEmit -p tsconfig.json",
  "lint": "eslint src/ --ext .vue,.js,.ts",
  "format": "prettier --write src/"
}
```

### Paso 1.3: Ajustar `tsconfig.json` para Modo Estricto Moderno
Añadir las banderas recomendadas por el estándar Vue 3 + Vite:
```jsonc
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "allowJs": true,
    "types": ["vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"]
}
```

### Paso 1.4: Actualizar `src/vite-env.d.ts`
Declarar las variables de entorno reconocidas:
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Paso 1.5: Completar los tipos de `src/types/database.ts`
Añadir a la interfaz `Database['public']['Tables']`:
* `crews` (Row, Insert, Update)
* `crew_members` (Row, Insert, Update)
* `crew_invites` (Row, Insert, Update)
* En `profiles`, añadir la columna `genero: 'masculino' | 'femenino'`.

---

## 3. Criterios de Aceptación y Verificación

1. Ejecutar `pnpm run type-check`.
2. Todos los archivos TypeScript bajo `src/types/`, `src/services/` y `src/stores/` deben compilar sin errores de tipo.
3. Ejecutar `pnpm run build` y comprobar que no haya regresiones.

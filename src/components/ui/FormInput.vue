<script setup lang="ts">
/**
 * FormInput.vue — UI Primitive
 * Input de formulario estandarizado con etiqueta, indicador de requerido,
 * mensajes de ayuda (hint), validación/error y slots para íconos.
 */
import { computed } from 'vue'

interface Props {
  modelValue?: string | number | null
  id?: string
  name?: string
  type?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  minlength?: string | number
  maxlength?: string | number
  error?: string
  hint?: string
  size?: 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  id: '',
  name: '',
  type: 'text',
  label: '',
  placeholder: '',
  required: false,
  disabled: false,
  min: undefined,
  max: undefined,
  step: undefined,
  minlength: undefined,
  maxlength: undefined,
  error: '',
  hint: '',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number'
    ? (target.value === '' ? '' : Number(target.value))
    : target.value
  emit('update:modelValue', value)
  emit('input', event)
}

const inputSizeClasses = computed(() => {
  return props.size === 'lg'
    ? 'px-4 py-3.5 text-[15px] rounded-[10px]'
    : 'px-3.5 py-[11px] text-sm rounded-lg'
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <!-- Etiqueta superior y metadata -->
    <div v-if="label || $slots['label-extra']" class="flex items-center justify-between">
      <label
        v-if="label"
        :for="id"
        class="text-[13px] font-bold uppercase tracking-[0.8px] text-text-secondary"
      >
        {{ label }}
        <span v-if="required" class="text-green">*</span>
        <span v-if="hint" class="ml-1 text-xs font-normal tracking-normal text-text-muted">
          {{ hint }}
        </span>
      </label>
      <slot name="label-extra" />
    </div>

    <!-- Contenedor del Input con Slots para íconos -->
    <div class="relative flex items-center">
      <!-- Slot Leading (Ícono izquierdo) -->
      <div v-if="$slots.leading" class="pointer-events-none absolute left-3.5 flex items-center text-text-muted">
        <slot name="leading" />
      </div>

      <input
        :id="id"
        :name="name || id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
        :minlength="minlength"
        :maxlength="maxlength"
        class="w-full border bg-bg-input text-text-primary placeholder:text-text-muted/50 transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          inputSizeClasses,
          $slots.leading ? 'pl-10' : '',
          $slots.trailing ? 'pr-10' : '',
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
            : 'border-[var(--border-color)] focus:border-green-light focus:ring-1 focus:ring-green/20',
        ]"
        @input="handleInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />

      <!-- Slot Trailing (Ícono derecho / Loading) -->
      <div v-if="$slots.trailing" class="absolute right-3.5 flex items-center">
        <slot name="trailing" />
      </div>
    </div>

    <!-- Mensaje de error -->
    <p v-if="error" class="text-xs font-medium text-red-400">
      {{ error }}
    </p>
  </div>
</template>


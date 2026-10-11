<script setup lang="ts">
/**
 * FormTextarea.vue — UI Primitive
 * Área de texto multilinea estandarizada con soporte para validación,
 * contador opcional de caracteres y estilo del sistema de diseño Nakama.
 */
interface Props {
  modelValue?: string
  id?: string
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  minlength?: number
  maxlength?: number
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  id: '',
  name: '',
  label: '',
  placeholder: '',
  required: false,
  disabled: false,
  rows: 4,
  minlength: undefined,
  maxlength: undefined,
  error: '',
  hint: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
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

    <!-- Contenedor del textarea -->
    <textarea
      :id="id"
      :name="name || id"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :minlength="minlength"
      :maxlength="maxlength"
      class="w-full resize-y rounded-lg border bg-bg-input p-3.5 font-body text-sm text-text-primary placeholder:text-text-muted/50 transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      :class="[
        error
          ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
          : 'border-[var(--border-color)] focus:border-green-light focus:ring-1 focus:ring-green/20',
      ]"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />

    <!-- Mensaje de error -->
    <p v-if="error" class="text-xs font-medium text-red-400">
      {{ error }}
    </p>
  </div>
</template>


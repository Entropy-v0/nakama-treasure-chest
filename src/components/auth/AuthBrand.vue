<script setup lang="ts">
/**
 * AuthBrand — Dumb Component
 * Logotipo y frase emblemática para las pantallas de autenticación.
 */
import katanaLogo from '../../assets/katana_logo.png'
</script>

<template>
  <div class="mb-10 flex items-center gap-3.5 max-md:mb-8">
    <img
      :src="katanaLogo"
      alt="Nakama Logo"
      class="size-[52px] shrink-0 object-contain [filter:brightness(0)_invert(1)]"
    />
    <div class="flex flex-col">
      <h1 class="font-heading text-[2rem] font-bold leading-none tracking-[-0.5px] text-text-primary">
        Nakama
      </h1>
      <p class="mt-1 text-[13px] text-text-muted">
        “Las heridas en la espalda… son la vergüenza de un espadachín.”
      </p>
    </div>
  </div>
</template>

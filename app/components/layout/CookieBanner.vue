<script setup lang="ts">
import type { Consent } from '~/composables/useConsent'

const { choice, open, accept, decline, save, apply } = useConsent()

// Collapsed on open, so the two main buttons come first.
const settings = ref(false)

const custom = reactive<Consent>({ analytics: false, ads: false })

// Reopened from the footer, the switches show what currently applies.
watch(open, (visible) => {
  if (!visible) return
  settings.value = false
  custom.analytics = choice.value?.analytics ?? false
  custom.ads = choice.value?.ads ?? false
})

onMounted(apply)
</script>

<template>
  <!-- Client only: the cookie decides, and the server cannot see it. -->
  <ClientOnly>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-y-4 opacity-0"
    >
      <section
        v-if="open"
        role="dialog"
        aria-labelledby="cookie-titel"
        aria-describedby="cookie-tekst"
        class="print-hide fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border-b-4 border-b-butter-400 bg-ceramic-500 p-5 text-white shadow-xl sm:p-6"
      >
        <p
          id="cookie-titel"
          class="font-display text-lg font-extrabold leading-tight"
        >
          Mogen we cookies gebruiken?
        </p>
        <p
          id="cookie-tekst"
          class="mt-2 text-sm text-ceramic-100"
        >
          Met Google Analytics zien we welke recepten gelezen worden, en met
          Google AdSense betalen advertenties de site. Allebei alleen als je het
          goed vindt, en je kunt het altijd terugdraaien.
          <NuxtLink
            to="/privacy"
            class="underline decoration-white/40 underline-offset-4 hover:decoration-white"
          >Lees hoe we met je gegevens omgaan</NuxtLink>.
        </p>

        <!-- Equal weight on purpose: refusing must be as easy as accepting. -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <UButton
            label="Weigeren"
            color="neutral"
            variant="outline"
            size="lg"
            block
            class="bg-transparent text-white ring-white/50 hover:bg-white/10"
            @click="decline"
          />
          <UButton
            label="Accepteren"
            color="neutral"
            size="lg"
            block
            class="bg-butter-300 text-butter-950 hover:bg-butter-200"
            @click="accept"
          />
        </div>

        <div class="mt-3 text-center">
          <UButton
            :label="settings ? 'Verberg instellingen' : 'Zelf instellen'"
            :aria-expanded="settings"
            aria-controls="cookie-settings"
            color="neutral"
            variant="link"
            size="sm"
            class="text-ceramic-100 underline decoration-white/40 underline-offset-4 hover:text-white"
            @click="settings = !settings"
          />
        </div>

        <div
          v-if="settings"
          id="cookie-settings"
          class="mt-2 space-y-4 border-t border-white/20 pt-4"
        >
          <USwitch
            v-model="custom.analytics"
            color="neutral"
            label="Statistieken"
            description="Google Analytics: hoeveel mensen er komen en welke recepten ze lezen."
            :ui="{ label: 'text-white', description: 'text-ceramic-100' }"
          />
          <USwitch
            v-model="custom.ads"
            color="neutral"
            label="Advertenties"
            description="Google AdSense mag advertenties afstemmen op wat je eerder bekeek. Zonder dit blijven de advertenties staan, maar zijn ze niet persoonlijk."
            :ui="{ label: 'text-white', description: 'text-ceramic-100' }"
          />

          <UButton
            label="Bewaren"
            color="neutral"
            variant="outline"
            size="lg"
            block
            class="bg-transparent text-white ring-white/50 hover:bg-white/10"
            @click="save(custom)"
          />
        </div>
      </section>
    </Transition>
  </ClientOnly>
</template>

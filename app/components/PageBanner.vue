<script setup lang="ts">
withDefaults(defineProps<{
  /** Kruimelpad hoort boven de banier, op de paginakleur. */
  breadcrumb?: { label: string, to?: string }[]
  /** Smaller op overzichten, breder waar een lange titel staat. */
  breed?: boolean
}>(), { breadcrumb: undefined, breed: false })
</script>

<template>
  <div>
    <UContainer
      v-if="breadcrumb"
      class="pt-6"
    >
      <UBreadcrumb
        :items="breadcrumb"
        class="print-hide mx-auto max-w-4xl"
      />
    </UContainer>

    <!--
      De banier van de huisstijl: vermiljoen vlak met een schulprand eronder.
      Eén component, zodat elke pagina hem op dezelfde hoogte en met dezelfde
      marges draagt.

      De basiskleur is bijna-zwart en niet wit: wit op vermiljoen haalt 3,57 en
      dat is te weinig voor gewone tekst. Koppen krijgen los `text-white` - voor
      grote tekst volstaat 3 en daar wint wit het visueel.
    -->
    <section
      class="affiche-band schulp relative bg-vermiljoen-500 pb-16 text-vermiljoen-950"
      :class="breadcrumb ? 'mt-6' : ''"
    >
      <UContainer class="pt-10 lg:pt-14">
        <div
          class="mx-auto text-center"
          :class="breed ? 'max-w-4xl' : 'max-w-2xl'"
        >
          <slot />
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const site = useSiteConfig()
const { footer } = useAppConfig()

// Static site, so no form: every route here is a channel that already exists.
const KANALEN = [
  {
    titel: 'Vraag over een recept',
    tekst: 'Iets onduidelijk in een bereiding, of klopt een hoeveelheid niet? Laat het weten, dan passen we het recept aan.',
    icoon: 'i-lucide-chef-hat',
    tint: 'butter'
  },
  {
    titel: 'Bestellen en bezorgen',
    tekst: 'Vragen over een bestelling, verzending of een product lopen via de webshop.',
    icoon: 'i-lucide-shopping-basket',
    tint: 'ceramic',
    knop: { label: 'Naar Spesa da Antonio', to: 'https://www.spesadaantonio.nl', extern: true }
  },
  {
    titel: 'Een gerecht voorstellen',
    tekst: 'Mis je een klassieker in het archief? Stuur je voorstel, met de regio erbij als je die kent.',
    icoon: 'i-lucide-lightbulb',
    tint: 'peach'
  }
]

const TINTEN: Record<string, string> = {
  butter: 'bg-butter-100 text-butter-900 dark:bg-butter-950 dark:text-butter-200',
  ceramic: 'bg-ceramic-100 text-ceramic-900 dark:bg-ceramic-950 dark:text-ceramic-200',
  peach: 'bg-peach-100 text-peach-900 dark:bg-peach-950 dark:text-peach-200'
}

const title = 'Contact'
const description = `Vragen over een recept, een bestelling of een gerecht dat je mist bij ${site.name}.`

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
defineOgImage('Default', { title, description })

useSchemaOrg([
  defineBreadcrumb({ itemListElement: [{ name: 'Home', item: '/' }, { name: 'Contact' }] })
])
</script>

<template>
  <div>
    <PageBanner :breadcrumb="[{ label: 'Home', to: '/' }, { label: 'Contact' }]">
      <h1 class="text-4xl text-white sm:text-5xl">
        {{ title }}
      </h1>
      <p class="mt-4 text-lg">
        {{ description }}
      </p>
    </PageBanner>

    <UContainer class="py-10 lg:py-14">
      <div class="mx-auto max-w-4xl">
        <div class="grid gap-8 sm:grid-cols-3">
          <article
            v-for="kanaal in KANALEN"
            :key="kanaal.titel"
            class="flex flex-col rounded-2xl border border-default border-b-4 border-b-primary bg-default p-6"
          >
            <span
              class="flex size-11 items-center justify-center rounded-xl"
              :class="TINTEN[kanaal.tint]"
            >
              <UIcon
                :name="kanaal.icoon"
                class="size-5"
              />
            </span>

            <h2 class="mt-4 text-xl">
              {{ kanaal.titel }}
            </h2>
            <p class="mt-2 flex-1 text-sm text-muted">
              {{ kanaal.tekst }}
            </p>

            <UButton
              v-if="kanaal.knop"
              :to="kanaal.knop.to"
              :target="kanaal.knop.extern ? '_blank' : undefined"
              :rel="kanaal.knop.extern ? 'noopener' : undefined"
              color="secondary"
              size="sm"
              class="mt-4 self-start"
              :trailing-icon="kanaal.knop.extern ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-right'"
              :label="kanaal.knop.label"
            />
            <UButton
              v-else-if="footer.bedrijf.email"
              :to="`mailto:${footer.bedrijf.email}`"
              color="secondary"
              size="sm"
              class="mt-4 self-start"
              icon="i-lucide-mail"
              label="Stuur een mail"
            />
          </article>
        </div>

        <!-- Direct details in the second colour, so the page closes on the same
             block the footer opens with. -->
        <section
          class="mt-12 rounded-2xl bg-ceramic-500 p-8 text-white"
          aria-labelledby="gegevens"
        >
          <h2
            id="gegevens"
            class="text-2xl sm:text-3xl"
          >
            Rechtstreeks
          </h2>

          <dl class="mt-6 grid gap-8 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
            <div v-if="footer.bedrijf.email">
              <dt class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
                E-mail
              </dt>
              <dd class="mt-2 text-sm">
                <NuxtLink
                  :to="`mailto:${footer.bedrijf.email}`"
                  class="break-all underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                >{{ footer.bedrijf.email }}</NuxtLink>
              </dd>
            </div>

            <div v-if="footer.social.length">
              <dt class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
                Volgen
              </dt>
              <dd class="mt-2 flex flex-wrap gap-1">
                <UButton
                  v-for="kanaal in footer.social"
                  :key="kanaal.label"
                  :to="kanaal.to"
                  target="_blank"
                  rel="noopener"
                  :icon="kanaal.icon"
                  :aria-label="kanaal.label"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  class="text-white hover:bg-white/10"
                />
              </dd>
            </div>

            <div v-if="footer.bedrijf.naam">
              <dt class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
                Bedrijf
              </dt>
              <dd class="mt-2 text-sm">
                {{ footer.bedrijf.naam }}
                <template v-if="footer.bedrijf.kvk">
                  <br>KvK {{ footer.bedrijf.kvk }}
                </template>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </UContainer>
  </div>
</template>

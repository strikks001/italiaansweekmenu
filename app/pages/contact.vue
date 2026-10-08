<script setup lang="ts">
const site = useSiteConfig()
const { footer } = useAppConfig()

// Static site, so no form: every route here is a channel that already exists.
const CHANNELS = [
  {
    title: 'Vraag over een recept',
    text: 'Iets onduidelijk in een bereiding, of klopt een hoeveelheid niet? Laat het weten, dan passen we het recept aan.',
    icon: 'i-lucide-chef-hat',
    tint: 'butter'
  },
  {
    title: 'Bestellen en bezorgen',
    text: 'Vragen over een bestelling, verzending of een product lopen via de webshop.',
    icon: 'i-lucide-shopping-basket',
    tint: 'ceramic',
    button: { label: 'Naar Spesa da Antonio', to: 'https://spesadaantonio.nl', external: true }
  },
  {
    title: 'Een gerecht voorstellen',
    text: 'Mis je een klassieker in het archief? Stuur je voorstel, met de regio erbij als je die kent.',
    icon: 'i-lucide-lightbulb',
    tint: 'peach'
  }
]

const TINTS: Record<string, string> = {
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
        <div
          class="grid gap-8 sm:grid-cols-3"
        >
          <article
            v-for="channel in CHANNELS"
            :key="channel.title"
            class="flex flex-col rounded-2xl border border-default border-b-4 border-b-primary bg-default p-6"
          >
            <span
              class="flex size-11 items-center justify-center rounded-xl"
              :class="TINTS[channel.tint]"
            >
              <UIcon
                :name="channel.icon"
                class="size-5"
              />
            </span>

            <h2 class="mt-4 text-xl">
              {{ channel.title }}
            </h2>
            <p class="mt-2 flex-1 text-sm text-muted">
              {{ channel.text }}
            </p>

            <UButton
              v-if="channel.button"
              :to="channel.button.to"
              :target="channel.button.external ? '_blank' : undefined"
              :rel="channel.button.external ? 'noopener' : undefined"
              color="secondary"
              size="sm"
              class="mt-4 self-start"
              :trailing-icon="channel.button.external ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-right'"
              :label="channel.button.label"
            />
            <UButton
              v-else-if="footer.company.email"
              :to="`mailto:${footer.company.email}`"
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
            <div v-if="footer.company.email">
              <dt class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
                E-mail
              </dt>
              <dd class="mt-2 text-sm">
                <NuxtLink
                  :to="`mailto:${footer.company.email}`"
                  class="break-all underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                >{{ footer.company.email }}</NuxtLink>
              </dd>
            </div>

            <div v-if="footer.social.length">
              <dt class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
                Volgen
              </dt>
              <dd class="mt-2 flex flex-wrap gap-1">
                <UButton
                  v-for="channel in footer.social"
                  :key="channel.label"
                  :to="channel.to"
                  target="_blank"
                  rel="noopener"
                  :icon="channel.icon"
                  :aria-label="channel.label"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  class="text-white hover:bg-white/10"
                />
              </dd>
            </div>

            <div v-if="footer.company.name">
              <dt class="font-display text-xs font-bold uppercase tracking-widest text-ceramic-200">
                Bedrijf
              </dt>
              <dd class="mt-2 text-sm">
                {{ footer.company.name }}
                <template v-if="footer.company.kvk">
                  <br>KvK {{ footer.company.kvk }}
                </template>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </UContainer>
  </div>
</template>

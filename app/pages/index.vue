<script setup lang="ts">
const site = useSiteConfig()

const { data: latest } = await useAsyncData('home:latest', () =>
  queryCollection('recepten')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .select('path', 'title', 'description', 'afbeelding', 'afbeeldingAlt', 'gang', 'voorbereidingstijd', 'bereidingstijd')
    .limit(7)
    .all()
)

// The newest recipe carries the poster; the rest sit in the grid below.
const featured = computed(() => latest.value?.[0])
const others = computed(() => latest.value?.slice(1) ?? [])

// The archive already knows how to search; this is just the way in.
const query = ref('')

function search() {
  navigateTo({ path: '/recepten', query: query.value ? { q: query.value } : {} })
}

const title = 'Italiaanse recepten, stap voor stap uitgelegd'
const description = site.description

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
// The title already names the site; the default template would append it again.
useHead({ titleTemplate: '%s' })
defineOgImage('Default', { title: 'Italiaansweekmenu', description })
</script>

<template>
  <div>
    <!-- Poster: one vermilion field with the newest recipe as the draw. -->
    <!-- bg-vermilion-500 rather than bg-primary: Nuxt UI drops to shade 400
         in dark mode, and this field must keep one brand colour in both. -->
    <!-- The wrapper carries the jump link: the band itself clips its overflow
         for the tilted card, which would cut the button in half. -->
    <div class="relative">
      <section class="scallop relative overflow-hidden bg-vermilion-500 pb-24 text-vermilion-950">
        <UContainer
          class="relative"
          :class="featured ? 'py-12 lg:py-20' : 'pt-12 pb-2 lg:pt-20 lg:pb-4'"
        >
          <div class="mx-auto max-w-4xl">
            <h1 class="poster-question text-white">
              Wat eten we vandaag?
            </h1>
            <p class="mt-3 max-w-2xl text-lg">
              Italiaanse recepten zoals ze in Italië gemaakt worden. Elke stap
              legt uit wat je doet, waaraan je ziet dat het goed gaat en waarom
              het ertoe doet.
            </p>

            <!-- One panel: photo and text belong together, so they share a
               frame. Loose elements on a colour field read as loose. -->
            <NuxtLink
              v-if="featured"
              :to="featured.path"
              class="tilt-resting group mt-8 grid overflow-hidden rounded-2xl border-b-4 border-b-ceramic-500 bg-default text-default sm:grid-cols-[minmax(0,16rem)_1fr]"
            >
              <NuxtImg
                :src="featured.afbeelding"
                :alt="featured.afbeeldingAlt"
                width="640"
                height="640"
                sizes="100vw sm:256px"
                format="webp"
                preload
                class="aspect-[4/3] size-full object-cover sm:aspect-auto"
              />

              <div class="flex flex-col justify-center gap-3 p-6 sm:p-8">
                <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <PillBadge>Nieuwste recept</PillBadge>
                  <PillBadge>{{ gangLabel(featured.gang) }}</PillBadge>
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-clock"
                      class="size-3"
                    />
                    {{ readableDuration(featured.voorbereidingstijd + featured.bereidingstijd) }}
                  </span>
                </div>

                <h2 class="poster-dish">
                  {{ featured.title }}
                </h2>

                <p class="text-muted">
                  {{ featured.description }}
                </p>

                <span class="mt-1 flex items-center gap-1.5 text-sm font-semibold text-secondary">
                  Naar het recept
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4 transition group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </NuxtLink>
          </div>
        </UContainer>
      </section>

      <JumpLink
        v-if="others.length"
        to="#recepten"
        label="Naar de andere recepten"
        text="Bekijk meer recepten"
        edge
      />
    </div>

    <PageSection
      v-if="others.length"
      id="recepten"
      class="scroll-mt-24 pt-10 pb-12 lg:pb-16"
      eyebrow="Recent toegevoegd"
      title="Meer om te koken"
      lead="Kies een gerecht en open het recept."
      heading-size="lg"
      spacing="none"
    >
      <template #actions>
        <UButton
          to="/recepten"
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-arrow-right"
        >
          Alle recepten
        </UButton>
      </template>

      <CardGrid class="mt-6">
        <MediaCard
          v-for="(item, index) in others"
          :key="item.path"
          :to="item.path"
          :image="item.afbeelding"
          :alt="item.afbeeldingAlt"
          :title="item.title"
          :description="item.description"
          :priority="index === 0"
        >
          <template #meta>
            <PillBadge>{{ gangLabel(item.gang) }}</PillBadge>
            <span>{{ readableDuration(item.voorbereidingstijd + item.bereidingstijd) }}</span>
          </template>
        </MediaCard>
      </CardGrid>
    </PageSection>

    <PageSection
      title="Zoek je iets anders?"
      lead="Doorzoek alle recepten op gerecht, gang of ingrediënt."
      heading-size="lg"
      tone="butter"
      lead-class="text-butter-900 dark:text-butter-200"
      spacing="band"
      width="prose"
      center
    >
      <form
        class="flex flex-col gap-2 sm:flex-row"
        @submit.prevent="search"
      >
        <UInput
          v-model="query"
          type="search"
          placeholder="Bijvoorbeeld: pasta, risotto, dolce"
          icon="i-lucide-search"
          size="lg"
          class="flex-1"
        />
        <!-- Ceramic, not vermilion: white scores 11.94 on blue, 3.57 on red. -->
        <UButton
          type="submit"
          label="Zoeken"
          color="secondary"
          size="lg"
        />
      </form>
    </PageSection>

    <CtaSection
      title="De juiste ingrediënten maken het verschil"
      text="Pasta, tomaten, olijfolie en kaas van dezelfde merken als in een Italiaanse
            supermarkt, thuisbezorgd in heel Nederland door Spesa da Antonio."
    >
      <UButton
        to="https://spesadaantonio.nl"
        target="_blank"
        rel="noopener"
        color="secondary"
        size="lg"
        trailing-icon="i-lucide-arrow-up-right"
      >
        Naar Spesa da Antonio
      </UButton>
    </CtaSection>
  </div>
</template>

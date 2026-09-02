<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  /** Absolute URL of the page being shared. */
  url: string
  /** Absolute image URL, used by Pinterest. */
  image?: string
  /** 'banner' sits on a colour field and needs solid white buttons. */
  tone?: 'default' | 'banner'
}>(), { image: undefined, tone: 'default' })

const knopStijl = computed(() => props.tone === 'banner'
  ? 'bg-white text-vermilion-950 hover:bg-butter-200'
  : '')

const encodedUrl = computed(() => encodeURIComponent(props.url))
const encodedTitle = computed(() => encodeURIComponent(props.title))

const links = computed(() => [
  {
    label: 'Deel op WhatsApp',
    icon: 'i-simple-icons-whatsapp',
    href: `https://wa.me/?text=${encodedTitle.value}%20${encodedUrl.value}`
  },
  {
    label: 'Pin op Pinterest',
    icon: 'i-simple-icons-pinterest',
    href: `https://pinterest.com/pin/create/button/?url=${encodedUrl.value}`
      + `&description=${encodedTitle.value}`
      + (props.image ? `&media=${encodeURIComponent(props.image)}` : '')
  },
  {
    label: 'Deel op Facebook',
    icon: 'i-simple-icons-facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`
  }
])

const copied = ref(false)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Clipboard blocked: the share links still work.
  }
}

// Phones get the OS share sheet, which reaches apps we cannot link to.
const canShareNatively = ref(false)
onMounted(() => {
  canShareNatively.value = typeof navigator !== 'undefined' && 'share' in navigator
})

async function shareNatively() {
  try {
    await navigator.share({ title: props.title, url: props.url })
  } catch {
    // User cancelled.
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-sm">Delen</span>

    <UButton
      v-if="canShareNatively"
      icon="i-lucide-share-2"
      color="neutral"
      :variant="tone === 'banner' ? 'solid' : 'outline'"
      size="sm"
      aria-label="Deel dit recept"
      class="sm:hidden"
      :class="knopStijl"
      @click="shareNatively"
    />

    <UButton
      v-for="link in links"
      :key="link.label"
      :to="link.href"
      target="_blank"
      rel="noopener"
      :icon="link.icon"
      :aria-label="link.label"
      color="neutral"
      :variant="tone === 'banner' ? 'solid' : 'outline'"
      size="sm"
      :class="knopStijl"
    />

    <UButton
      :icon="copied ? 'i-lucide-check' : 'i-lucide-link'"
      color="neutral"
      :variant="tone === 'banner' ? 'solid' : 'outline'"
      size="sm"
      :class="copied ? 'bg-ceramic-500 text-white' : knopStijl"
      :aria-label="copied ? 'Link gekopieerd' : 'Kopieer link'"
      @click="copyLink"
    />
  </div>
</template>

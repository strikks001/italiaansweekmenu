/** The two things the banner asks about, each switchable on its own. */
export type Consent = {
  analytics: boolean
  ads: boolean
}

/** Before the ads question the cookie held a bare 'ja' or 'nee'. */
type Stored = Consent | 'ja' | 'nee' | null

const NONE: Consent = { analytics: false, ads: false }
const ALL: Consent = { analytics: true, ads: true }

function parse(value: Stored): Consent | null {
  if (!value) return null
  // 'ja' answered the only question there was, so it never covered ads.
  if (value === 'ja') return { analytics: true, ads: false }
  if (value === 'nee') return NONE
  if (typeof value !== 'object') return null

  return { analytics: value.analytics === true, ads: value.ads === true }
}

/**
 * Cookie consent, separately for analytics and ads. Analytics only loads once
 * granted; AdSense is always on the page but hears through Consent Mode what
 * it may do - see the head scripts in nuxt.config.
 */
export function useConsent() {
  const cookie = useCookie<Stored>('cookietoestemming', {
    maxAge: 60 * 60 * 24 * 180,
    sameSite: 'lax',
    default: () => null
  })

  const choice = computed(() => parse(cookie.value))

  // Banner visibility is shared, so the footer can reopen it.
  const open = useState('consent:open', () => false)

  const { gtag, initialize, disableAnalytics, enableAnalytics } = useGtag()
  const id = useRuntimeConfig().public.gtag.id

  /** Tell Google. Refusals go too: consent can be withdrawn later. */
  function sync(consent: Consent) {
    // Google has no separate switch for these three; they answer one question.
    const ads = consent.ads ? 'granted' : 'denied'

    gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads
    })

    if (!id) return

    if (consent.analytics) {
      enableAnalytics()
      initialize()
    } else {
      disableAnalytics()
    }
  }

  function save(consent: Consent) {
    cookie.value = { ...consent }
    open.value = false
    sync(consent)
  }

  function accept() {
    save(ALL)
  }

  function decline() {
    save(NONE)
  }

  function reopen() {
    open.value = true
  }

  /** Run once on the client: apply an earlier choice or ask. */
  function apply() {
    if (choice.value) sync(choice.value)
    else open.value = true
  }

  return { choice, open, accept, decline, save, reopen, apply }
}

type Choice = 'ja' | 'nee'

/**
 * Cookie consent for analytics. The choice lives in a cookie for half a
 * year; GA4 is only initialised after an explicit "ja".
 */
export function useConsent() {
  const choice = useCookie<Choice | null>('cookietoestemming', {
    maxAge: 60 * 60 * 24 * 180,
    sameSite: 'lax',
    default: () => null
  })

  // Banner visibility is shared, so the footer can reopen it.
  const open = useState('consent:open', () => false)

  const { gtag, initialize } = useGtag()
  const id = useRuntimeConfig().public.gtag.id

  function start() {
    if (!id) return
    gtag('consent', 'update', { analytics_storage: 'granted' })
    initialize()
  }

  function accept() {
    choice.value = 'ja'
    open.value = false
    start()
  }

  function decline() {
    choice.value = 'nee'
    open.value = false
  }

  function reopen() {
    open.value = true
  }

  /** Run once on the client: apply an earlier choice or ask. */
  function apply() {
    if (choice.value === 'ja') start()
    else if (choice.value !== 'nee') open.value = true
  }

  return { choice, open, accept, decline, reopen, apply }
}

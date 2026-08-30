/**
 * Today's date as "YYYY-MM-DD", kept current while the page is open.
 *
 * On a statically generated site the date is baked in at build time, so we
 * correct after hydration. We also re-check when the tab regains focus: a
 * recipe page can sit open on a kitchen counter across midnight, and it should
 * not keep showing yesterday's menu.
 */
export function useToday() {
  const today = ref(todayISO())

  function refresh() {
    const now = todayISO()
    if (now !== today.value) today.value = now
  }

  onMounted(() => {
    refresh()
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', refresh)
    window.removeEventListener('focus', refresh)
  })

  return today
}

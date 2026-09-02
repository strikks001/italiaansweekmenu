import { queryCollection } from '@nuxt/content/nitro'
import { menuVisibleOn, todayISO } from '~/utils/week'

/**
 * Sitemap entries with a date. The routes the prerenderer finds carry no
 * lastmod; these do, so a crawler can see which pages actually changed.
 * Registered as a sitemap source in nuxt.config.
 */
export default defineSitemapEventHandler(async (event) => {
  const [recipes, menus, pages] = await Promise.all([
    queryCollection(event, 'recepten')
      .where('concept', '=', false)
      .select('path', 'gepubliceerd', 'gewijzigd')
      .all(),
    queryCollection(event, 'weekmenus')
      .where('concept', '=', false)
      .select('path', 'jaar', 'week', 'gepubliceerd', 'gewijzigd')
      .all(),
    queryCollection(event, 'paginas')
      .select('path', 'gewijzigd')
      .all()
  ])

  const stamp = (item: { gewijzigd?: Date, gepubliceerd: Date }) =>
    new Date(item.gewijzigd ?? item.gepubliceerd).toISOString()

  return [
    ...recipes.map(r => ({ loc: r.path, lastmod: stamp(r) })),
    // A week that is not open yet has no page, so it has no entry either.
    ...menus
      .filter(m => menuVisibleOn(m.jaar, m.week, todayISO()))
      .map(m => ({ loc: m.path, lastmod: stamp(m) })),
    // Loose pages only carry `gewijzigd`; without one they keep no date.
    ...pages
      .filter(p => p.gewijzigd)
      .map(p => ({ loc: p.path, lastmod: new Date(p.gewijzigd!).toISOString() }))
  ]
})

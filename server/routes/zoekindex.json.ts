import { queryCollection } from '@nuxt/content/nitro'
import { menuVisibleOn, todayISO } from '~/utils/week'

/** The search index, fetched on demand so it stays out of every page payload.
 *  Prerendered; the route is listed in nuxt.config. */
export default defineEventHandler(async (event) => {
  const [recipes, menus] = await Promise.all([
    queryCollection(event, 'recepten')
      .where('concept', '=', false)
      .order('gepubliceerd', 'DESC')
      .select('path', 'title', 'description', 'gang', 'zoekwoorden')
      .all(),
    queryCollection(event, 'weekmenus')
      .where('concept', '=', false)
      .order('gepubliceerd', 'DESC')
      .select('path', 'title', 'description', 'jaar', 'week', 'thema')
      .all()
  ])

  return {
    recepten: recipes.map(r => ({
      path: r.path,
      title: r.title,
      description: r.description,
      gang: r.gang,
      termen: [r.zoekwoorden?.primair, ...(r.zoekwoorden?.secundair ?? [])]
        .filter(Boolean).join(' ')
    })),
    // A week that is not open yet has no page, so a hit would lead nowhere.
    weekmenus: menus
      .filter(m => menuVisibleOn(m.jaar, m.week, todayISO()))
      .map(m => ({
        path: m.path,
        title: m.title,
        description: m.description,
        jaar: m.jaar,
        week: m.week,
        thema: m.thema
      }))
  }
})

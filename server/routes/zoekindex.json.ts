import { queryCollection } from '@nuxt/content/nitro'
import { menuVisibleOn, todayISO } from '~/utils/week'

/**
 * Everything the search dialog needs, and nothing else. A separate route so
 * the index is fetched once on demand, instead of riding along in the payload
 * of every page. Prerendered by `nuxt generate`; the route is in nuxt.config.
 */
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
      // Search terms people actually type, folded into one matchable string.
      termen: [r.zoekwoorden?.primair, ...(r.zoekwoorden?.secundair ?? [])]
        .filter(Boolean).join(' ')
    })),
    // Filtered on the build date: a week that is not open yet has no page
    // either, so a hit would lead nowhere. The dialog checks again with the
    // visitor's own date, in case this file is a day behind.
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

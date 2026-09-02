import { queryCollection } from '@nuxt/content/nitro'

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
    // Not filtered on visibility here: that depends on the day of the week,
    // and this file is written at build time. The dialog applies the rule.
    weekmenus: menus.map(m => ({
      path: m.path,
      title: m.title,
      description: m.description,
      jaar: m.jaar,
      week: m.week,
      thema: m.thema
    }))
  }
})

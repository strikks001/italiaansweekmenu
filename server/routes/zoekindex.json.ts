import { queryCollection } from '@nuxt/content/nitro'

/** The search index, fetched on demand so it stays out of every page payload.
 *  Prerendered; the route is listed in nuxt.config. */
export default defineEventHandler(async (event) => {
  const recipes = await queryCollection(event, 'recepten')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .select('path', 'title', 'description', 'gang', 'zoekwoorden')
    .all()

  return {
    recepten: recipes.map(r => ({
      path: r.path,
      title: r.title,
      description: r.description,
      gang: r.gang,
      termen: [r.zoekwoorden?.primair, ...(r.zoekwoorden?.secundair ?? [])]
        .filter(Boolean).join(' ')
    }))
  }
})

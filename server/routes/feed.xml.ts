import { queryCollection } from '@nuxt/content/nitro'

/**
 * RSS voor lezers die de weekmenu's willen volgen zonder de site te bezoeken.
 * Prerendered bij `nuxt generate`; de route staat in nuxt.config.
 */
export default defineEventHandler(async (event) => {
  // In nitro heet hij getSiteConfig; useSiteConfig bestaat alleen in de app.
  const site = getSiteConfig(event)

  const recipes = await queryCollection(event, 'recepten')
    .where('concept', '=', false)
    .order('gepubliceerd', 'DESC')
    .select('path', 'title', 'description', 'gepubliceerd')
    .limit(20)
    .all()

  const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const items = recipes.map(r => `    <item>
      <title>${escape(r.title)}</title>
      <link>${site.url}${r.path}</link>
      <guid isPermaLink="true">${site.url}${r.path}</guid>
      <description>${escape(r.description)}</description>
      <pubDate>${new Date(r.gepubliceerd).toUTCString()}</pubDate>
    </item>`).join('\n')

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')

  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
    <language>nl-NL</language>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
})

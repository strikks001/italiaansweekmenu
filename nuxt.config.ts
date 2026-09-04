// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content', // markdown -> SQLite -> typeveilige queries
    '@nuxt/image', // automatische image-optimalisatie (webp/avif, responsive srcset)
    '@nuxt/ui', // componentbibliotheek bovenop Tailwind 4
    '@nuxt/eslint',
    '@nuxtjs/seo', // bundel: sitemap, robots, schema.org, og-image, link-checker

    // Studio is de visuele editor voor content/, en draait alleen lokaal.
    // Meebouwen in productie zou 28 MB aan editor-assets deployen die daar
    // toch niet werken - dat is meer dan de rest van de site bij elkaar.
    ...(process.env.NODE_ENV === 'development' ? ['nuxt-studio'] : [])
  ],

  // Folders group the components; they must not end up in the tag name.
  // Without this, components/card/MediaCard.vue becomes <CardMediaCard>.
  components: [{ path: '~/components', pathPrefix: false }],

  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [{ name: 'theme-color', content: '#ff3b14' }]
    }
  },

  css: ['~/assets/css/main.css', '~/assets/css/transitions.css', '~/assets/css/print.css'],

  // Eén bron van waarheid voor de site-identiteit. @nuxtjs/seo leest dit uit
  // voor de sitemap, canonical URLs, robots.txt en Open Graph-tags.
  site: {
    url: 'https://www.italiaansweekmenu.nl',
    name: 'Italiaans Weekmenu',
    description: 'Elke week een nieuw Italiaans weekmenu met authentieke recepten, boodschappenlijst en de juiste Italiaanse producten.',
    defaultLocale: 'nl'
  },

  routeRules: {
    // Neither belongs in the sitemap: one is an error page, the other an
    // internal reference for whoever maintains the design.
    '/404': { robots: false },
    '/styleguide': { robots: false }
  },

  compatibilityDate: '2026-06-30',

  // Alle pagina's vooraf renderen naar statische HTML. crawlLinks volgt elke
  // <NuxtLink> vanaf de startpagina, zodat ook recepten meegenomen worden.
  nitro: {
    // Vastgezet, want Nitro kijkt naar omgevingsvariabelen. Op de Cloudflare-
    // builder koos hij daardoor `cloudflare-module`: Nuxt Content schakelde over
    // op een D1-database die niet bestaat, de `assets` uit wrangler.jsonc werden
    // genegeerd, en er kwam een `.wrangler/deploy/config.json` die wrangler naar
    // een server-entry `index.mjs` stuurde die `nuxt generate` nooit maakt.
    // Daar liep de deploy op stuk. Deze site is statisch; dat hoort niet van de
    // build-omgeving af te hangen.
    preset: 'static',

    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml', '/feed.xml', '/zoekindex.json'],
      failOnError: false
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // The prerendered routes give the sitemap its URLs but no dates; this source
  // adds lastmod for everything that comes out of content/.
  sitemap: {
    sources: ['/api/__sitemap__/urls']
  },

  // Studio bewerkt content/ visueel en draait alleen lokaal; productie zou SSR
  // vereisen. Daarom staat de config hier ook achter dezelfde voorwaarde als de
  // module: buiten dev kent het configtype `studio` niet en breekt de typecheck.
  // `repository` is verplicht, ook al gebruikt Studio het pas in productie.
  ...(process.env.NODE_ENV === 'development'
    ? {
        studio: {
          route: '/_studio',
          repository: {
            provider: 'github',
            owner: 'strikks001',
            repo: 'italiaansweekmenu',
            branch: 'main'
          }
        }
      }
    : {})
})

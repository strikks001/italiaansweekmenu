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

  devtools: { enabled: true },

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
    // 404-pagina hoeft niet in de sitemap
    '/404': { robots: false }
  },

  compatibilityDate: '2026-06-30',

  // Alle pagina's vooraf renderen naar statische HTML. crawlLinks volgt elke
  // <NuxtLink> vanaf de startpagina, zodat ook recepten meegenomen worden.
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml'],
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

  // Nuxt Studio is sinds versie 1 een gratis open-source module die je zelf
  // host, niet meer het betaalde platform op nuxt.studio.
  //
  // We gebruiken hem alleen lokaal: `pnpm dev` toont linksonder een bewerkknop
  // waarmee je content/ visueel bewerkt op de echte bestanden. Committen en
  // pushen doe je daarna zelf.
  //
  // `repository` is verplicht - zonder owner en repo weigert de module te
  // bouwen. Hij wordt pas echt gebruikt zodra Studio in productie draait, en
  // dat vereist server-routes voor OAuth en dus `nuxt build` in plaats van
  // `nuxt generate`. Zie de README voor die omschakeling.
  //
  // Dezelfde voorwaarde als bij de module hierboven: buiten dev bestaat het
  // veld `studio` niet in het configtype, en dan breekt `pnpm typecheck` erop.
  //
  // De AI-assistent is uit en blijft dat zolang AI_GATEWAY_API_KEY leeg is.
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

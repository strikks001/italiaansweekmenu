// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content', // markdown -> SQLite -> typeveilige queries
    '@nuxt/image', // automatische image-optimalisatie (webp/avif, responsive srcset)
    '@nuxt/ui', // componentbibliotheek bovenop Tailwind 4
    '@nuxt/eslint',
    '@nuxtjs/seo', // bundel: sitemap, robots, schema.org, og-image, link-checker
    'nuxt-gtag', // GA4, loads only after consent (see useConsent)

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
      meta: [{ name: 'theme-color', content: '#ff3b14' }],
      script: [
        // Consent Mode must be set before any Google script loads, and AdSense
        // below loads while Nuxt is still booting - hence inline, not nuxt-gtag.
        // Everything starts denied; useConsent sends the update that
        // wait_for_update gives half a second to arrive.
        //
        // The number is not a style choice: unhead sorts the head by capo
        // rules, which rank an async script (30) above an inline one (50), and
        // the 'critical' alias only shifts that by 8. Only a numeric priority
        // skips the ranking, so this has to stay below AdSense's 30.
        {
          tagPriority: 20,
          innerHTML: 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};'
            + 'gtag(\'consent\',\'default\',{ad_storage:\'denied\',ad_user_data:\'denied\','
            + 'ad_personalization:\'denied\',analytics_storage:\'denied\',wait_for_update:500});'
        },

        // AdSense belongs on every page; without ads consent it serves only
        // non-personalised ads.
        {
          async: true,
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7646327831760066',
          crossorigin: 'anonymous'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css', '~/assets/css/transitions.css', '~/assets/css/print.css'],

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

  nitro: {
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

  // GA4 property of Spesa da Antonio. NUXT_PUBLIC_GTAG_ID overrides it;
  // empty means off. Nothing loads until useConsent() calls initialize().
  // The consent default lives in app.head, not here: this module runs at Nuxt
  // boot, by which time AdSense has already loaded.
  gtag: {
    id: 'G-YSLKG6BLSW',
    initMode: 'manual'
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

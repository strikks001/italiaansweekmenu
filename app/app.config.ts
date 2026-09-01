export default defineAppConfig({
  /*
   * Footer details. PLACEHOLDERS - replace before launch. The URLs point at
   * example.com on purpose: a reserved domain cannot impersonate a real
   * account. Empty entries render nothing.
   */
  footer: {
    social: [
      { label: 'Instagram', icon: 'i-simple-icons-instagram', to: 'https://example.com/instagram' },
      { label: 'Facebook', icon: 'i-simple-icons-facebook', to: 'https://example.com/facebook' },
      { label: 'Pinterest', icon: 'i-simple-icons-pinterest', to: 'https://example.com/pinterest' }
    ] as { label: string, icon: string, to: string }[],
    bedrijf: {
      naam: 'Lorem Ipsum B.V.',
      email: 'lorem@example.com',
      kvk: '12345678'
    }
  },

  // Palettes live in app/assets/css/main.css; here they get their role.
  ui: {
    colors: {
      primary: 'vermilion',
      secondary: 'ceramic',
      neutral: 'stone'
    }
  }
})

export default defineAppConfig({
  /*
   * Footer details. Empty entries render nothing, so the footer stays tidy
   * until real values exist - no placeholder links to nowhere.
   */
  footer: {
    social: [] as { label: string, icon: string, to: string }[],
    bedrijf: {
      naam: '',
      email: '',
      kvk: ''
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

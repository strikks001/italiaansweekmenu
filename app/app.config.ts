export default defineAppConfig({
  /* Footer details. Social stays empty until there are real accounts: an
     empty list renders nothing. */
  footer: {
    social: [] as { label: string, icon: string, to: string }[],
    bedrijf: {
      naam: 'Spesa da Antonio',
      email: 'italiaansweekmenu@spesadaantonio.nl',
      kvk: '96972378'
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

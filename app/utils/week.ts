export const WEEKDAYS = [
  'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'
] as const

export type Weekday = typeof WEEKDAYS[number]

export const SEASONS = ['winter', 'lente', 'zomer', 'herfst'] as const
export type Season = typeof SEASONS[number]

/**
 * Date of a weekday in an ISO week. ISO 8601: January 4th always falls in
 * week 1. UTC throughout so daylight saving cannot shift a day.
 */
export function dateInWeek(year: number, week: number, weekday: string): Date | null {
  const index = WEEKDAYS.indexOf(weekday as Weekday)
  if (index < 0) return null

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const offsetToMonday = (jan4.getUTCDay() + 6) % 7

  const date = new Date(jan4)
  date.setUTCDate(jan4.getUTCDate() - offsetToMonday + (week - 1) * 7 + index)
  return date
}

/** "31 aug" */
export function shortDate(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date)
}

/** "aug" */
export function shortMonth(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', { month: 'short', timeZone: 'UTC' }).format(date)
}

/** "31 aug - 6 sep 2026" */
export function weekPeriod(year: number, week: number): string {
  const monday = dateInWeek(year, week, 'maandag')
  const sunday = dateInWeek(year, week, 'zondag')
  if (!monday || !sunday) return ''
  return `${shortDate(monday)} - ${shortDate(sunday)} ${year}`
}

/** Position of a weekday for sorting. Unknown days sort last. */
export function weekdayIndex(weekday: string): number {
  const i = WEEKDAYS.indexOf(weekday as Weekday)
  return i < 0 ? WEEKDAYS.length : i
}

/** Today as "YYYY-MM-DD" in the visitor's timezone. */
export function todayISO(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-')
}

/** First and last day of an ISO week as "YYYY-MM-DD". */
export function weekRange(year: number, week: number): { start: string, end: string } {
  const monday = dateInWeek(year, week, 'maandag')
  const sunday = dateInWeek(year, week, 'zondag')
  return {
    start: monday ? monday.toISOString().slice(0, 10) : '',
    end: sunday ? sunday.toISOString().slice(0, 10) : ''
  }
}

/** Does the given "YYYY-MM-DD" fall inside this ISO week? */
export function weekContains(year: number, week: number, dateISO: string): boolean {
  const { start, end } = weekRange(year, week)
  return Boolean(start) && dateISO >= start && dateISO <= end
}

/**
 * Astronomical season of an ISO week, judged by its Thursday — the day that
 * decides which year (and here: which date) a week belongs to. Equinox and
 * solstice shift a day between years; these fixed boundaries are close enough
 * for seasonal cooking.
 */
export function seasonOfWeek(year: number, week: number): Season {
  const thursday = dateInWeek(year, week, 'donderdag')
  if (!thursday) return 'winter'

  const monthDay = (thursday.getUTCMonth() + 1) * 100 + thursday.getUTCDate()
  if (monthDay >= 320 && monthDay <= 620) return 'lente'
  if (monthDay >= 621 && monthDay <= 921) return 'zomer'
  if (monthDay >= 922 && monthDay <= 1220) return 'herfst'
  return 'winter'
}

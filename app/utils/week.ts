export const WEEKDAYS = [
  'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'
] as const

export type Weekday = typeof WEEKDAYS[number]

export const SEASONS = ['winter', 'lente', 'zomer', 'herfst'] as const
export type Season = typeof SEASONS[number]

/** ISO 8601: Jan 4 always falls in week 1. UTC, so DST cannot shift a day. */
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

/** Monday of the ISO week containing "YYYY-MM-DD". */
function mondayOf(dateISO: string): Date {
  const date = new Date(`${dateISO}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
  return date
}

/** Running week and archive always; the next week only from Friday. */
export function menuVisibleOn(year: number, week: number, todayISO: string): boolean {
  const { start } = weekRange(year, week)
  if (!start) return false

  const monday = mondayOf(todayISO)
  const thisWeek = monday.toISOString().slice(0, 10)
  if (start <= thisWeek) return true

  monday.setUTCDate(monday.getUTCDate() + 7)
  const nextWeek = monday.toISOString().slice(0, 10)

  // 0 = Monday, 4 = Friday.
  const weekday = (new Date(`${todayISO}T00:00:00Z`).getUTCDay() + 6) % 7
  return start === nextWeek && weekday >= 4
}

/**
 * Astronomical season, judged by the week's Thursday. Equinox and solstice
 * shift a day between years; fixed boundaries are close enough here.
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

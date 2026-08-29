import type { ReceptenCollectionItem, WeekmenusCollectionItem } from '@nuxt/content'
import { WEEKDAYS, dateInWeek, shortMonth } from './week'

/** Fields a recipe card or row renders, so overviews can use a lean .select(). */
export type RecipeSummary = Pick<
  ReceptenCollectionItem,
  'path' | 'title' | 'description' | 'afbeelding' | 'afbeeldingAlt'
  | 'gang' | 'voorbereidingstijd' | 'bereidingstijd'
>

/** Fields a week menu card or row renders. */
export type WeekMenuSummary = Pick<
  WeekmenusCollectionItem,
  'path' | 'title' | 'description' | 'afbeelding' | 'afbeeldingAlt'
  | 'jaar' | 'week' | 'thema'
>

export interface MenuCourse {
  path: string
  note?: string
  recipe?: ReceptenCollectionItem
  /** Prep plus cooking time in minutes. */
  minutes: number
}

export interface MenuDay {
  weekday: string
  /** 'maandag' -> 'ma' */
  short: string
  dayNumber: number | null
  month: string
  /** "YYYY-MM-DD", to compare on date rather than on weekday name. */
  dateISO: string
  courses: MenuCourse[]
}

/**
 * Turns week menu frontmatter into a full seven day week. Days without a dish
 * get an empty course list so the agenda always shows the whole week.
 * A day may hold several courses, e.g. an antipasto and a secondo.
 */
export function groupByDay(
  menu: WeekmenusCollectionItem,
  recipes: ReceptenCollectionItem[] | null | undefined
): MenuDay[] {
  const byDay = new Map<string, MenuDay>()

  for (const weekday of WEEKDAYS) {
    const date = dateInWeek(menu.jaar, menu.week, weekday)
    byDay.set(weekday, {
      weekday,
      short: weekday.slice(0, 2),
      dayNumber: date ? date.getUTCDate() : null,
      month: date ? shortMonth(date) : '',
      dateISO: date ? date.toISOString().slice(0, 10) : '',
      courses: []
    })
  }

  for (const item of menu.recepten) {
    const recipe = recipes?.find(r => r.path === item.pad)
    byDay.get(item.dag)?.courses.push({
      path: item.pad,
      note: item.toelichting,
      recipe,
      minutes: recipe ? recipe.voorbereidingstijd + recipe.bereidingstijd : 0
    })
  }

  return WEEKDAYS.map(weekday => byDay.get(weekday)!)
}

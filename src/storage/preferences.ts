/* Reads and provides defaults for saved workspace preferences. */
import type { Language } from '../i18n'
import type { AnswerStyle, AppPreferences, HomePage, Theme } from '../types'

export const defaultPreferences: AppPreferences = {
  homePage: 'dashboard',
  density: 'comfortable',
  reduceMotion: false,
  defaultAnswerStyle: 'balanced',
  defaultCourseCode: '',
  language: 'en',
  showNotifications: true,
  confirmCourseRemoval: true,
  theme: 'light',
}

export function readSavedPreferences(): { preferences: AppPreferences; status: string } {
  try {
    const savedPreferences = window.localStorage.getItem('memex-settings')
    if (!savedPreferences) return { preferences: defaultPreferences, status: '' }

    const parsed: unknown = JSON.parse(savedPreferences)
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid settings format.')

    const homePage: HomePage = 'homePage' in parsed && parsed.homePage === 'ask-axi'
      ? parsed.homePage
      : defaultPreferences.homePage
    const density: AppPreferences['density'] = 'density' in parsed && parsed.density === 'compact'
      ? 'compact'
      : 'comfortable'
    const reduceMotion = 'reduceMotion' in parsed && parsed.reduceMotion === true
    const defaultAnswerStyle: AnswerStyle = 'defaultAnswerStyle' in parsed && (
      parsed.defaultAnswerStyle === 'concise'
      || parsed.defaultAnswerStyle === 'step-by-step'
    ) ? parsed.defaultAnswerStyle : 'balanced'
    const defaultCourseCode = 'defaultCourseCode' in parsed && typeof parsed.defaultCourseCode === 'string'
      ? parsed.defaultCourseCode
      : ''
    const language: Language = 'language' in parsed && (
      parsed.language === 'fr' || parsed.language === 'ar'
    ) ? parsed.language : 'en'
    const showNotifications = !('showNotifications' in parsed) || parsed.showNotifications !== false
    const confirmCourseRemoval = !('confirmCourseRemoval' in parsed) || parsed.confirmCourseRemoval !== false
    const theme: Theme = 'theme' in parsed && (
      parsed.theme === 'ocean' || parsed.theme === 'forest' || parsed.theme === 'light'
    ) ? parsed.theme : 'ember'

    return {
      preferences: {
        homePage,
        density,
        reduceMotion,
        defaultAnswerStyle,
        defaultCourseCode,
        language,
        showNotifications,
        confirmCourseRemoval,
        theme,
      },
      status: '',
    }
  } catch {
    return {
      preferences: defaultPreferences,
      status: 'Your saved settings could not be loaded. Default settings are in use.',
    }
  }
}

/* Shared domain and workspace preference types. */
import type { Language } from './i18n'

export type Course = {
  code: string
  title: string
  instructor: string
  color: 'blue' | 'purple' | 'green'
}

export type StudyFile = {
  id: string
  file: File
  courseCode: string
  url: string
  uploadedAt: Date
}

export type CourseForm = {
  code: string
  title: string
  instructor: string
}

export type PageName = 'dashboard' | 'courses' | 'files' | 'profile' | 'ask-axi' | 'settings'
export type HomePage = Exclude<PageName, 'courses' | 'files' | 'profile' | 'settings'>
export type AnswerStyle = 'balanced' | 'concise' | 'step-by-step'
export type Theme = 'ember' | 'ocean' | 'forest' | 'light'
export type SettingsSection = 'account' | 'appearance' | 'accessibility' | 'notifications' | 'study' | 'data'

export type AppPreferences = {
  homePage: HomePage
  density: 'comfortable' | 'compact'
  reduceMotion: boolean
  defaultAnswerStyle: AnswerStyle
  defaultCourseCode: string
  language: Language
  showNotifications: boolean
  confirmCourseRemoval: boolean
  theme: Theme
}

export type SelectOption = { value: string; label: string; swatch?: string }

export type Profile = {
  bio: string
  photo: string
}

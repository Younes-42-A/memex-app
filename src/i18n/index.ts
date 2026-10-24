/* Exports the supported language type and translation dictionary. */
import ar from './ar'
import en from './en'
import fr from './fr'

export type Language = 'en' | 'fr' | 'ar'

export const interfaceText = {
  en,
  fr,
  ar,
} satisfies Record<Language, Record<string, string>>

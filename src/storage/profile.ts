/* Reads the saved profile and provides its default value. */
import type { Profile } from '../types'

export const defaultProfile: Profile = { bio: '', photo: '' }

export function readSavedProfile() {
  try {
    const savedProfile = window.localStorage.getItem('memex-profile')
    if (!savedProfile) return { profile: defaultProfile, status: '' }

    const parsed: unknown = JSON.parse(savedProfile)
    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'bio' in parsed
      && typeof parsed.bio === 'string'
      && 'photo' in parsed
      && typeof parsed.photo === 'string'
    ) {
      return { profile: { bio: parsed.bio, photo: parsed.photo }, status: '' }
    }
    return { profile: defaultProfile, status: 'Your saved profile could not be read. You can create a new one.' }
  } catch {
    return { profile: defaultProfile, status: 'Your saved profile could not be loaded. Changes may not be saved.' }
  }
}

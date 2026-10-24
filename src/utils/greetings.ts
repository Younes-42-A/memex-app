/* Builds localized greetings for the dashboard and Ask AXI. */
import { interfaceText, type Language } from '../i18n'
import type { Course, StudyFile } from '../types'

export function getGreeting(date: Date, language: Language) {
  const hour = date.getHours()
  const text = interfaceText[language]
  if (hour < 12) return text.goodMorning
  if (hour < 17) return text.goodAfternoon
  if (hour < 21) return text.goodEvening
  return text.goodNight
}

export function getAskGreeting(
  date: Date,
  courses: Course[],
  files: StudyFile[],
  selectedCourseCode: string | null,
  language: Language,
) {
  const selectedCourse = courses.find((course) => course.code === selectedCourseCode)
  if (selectedCourse) {
    if (language === 'fr') return `Que souhaitez-vous savoir sur ${selectedCourse.title} ?`
    if (language === 'ar') return `ما الذي تود معرفته عن ${selectedCourse.title}؟`
    return `What’s on your mind about ${selectedCourse.title}?`
  }
  if (courses.length === 0 && files.length === 0) {
    if (language === 'fr') return 'Que souhaitez-vous explorer aujourd’hui ?'
    if (language === 'ar') return 'ما الذي ترغب في استكشافه اليوم؟'
    return 'What would you like to explore today?'
  }
  if (files.length === 0) {
    if (language === 'fr') return 'Quel cours souhaitez-vous explorer ?'
    if (language === 'ar') return 'أي مقرر ترغب في استكشافه؟'
    return 'Which course would you like to explore?'
  }

  const hour = date.getHours()
  if (language === 'fr') {
    if (hour < 12) return 'Qu’étudiez-vous ce matin ?'
    if (hour < 17) return 'Sur quoi travaillez-vous aujourd’hui ?'
    if (hour < 21) return 'Que souhaitez-vous comprendre ce soir ?'
    return 'Que souhaitez-vous découvrir ce soir ?'
  }
  if (language === 'ar') {
    if (hour < 12) return 'ماذا تدرس هذا الصباح؟'
    if (hour < 17) return 'على ماذا تعمل اليوم؟'
    if (hour < 21) return 'ما الذي تود فهمه هذا المساء؟'
    return 'ما الذي يثير فضولك الليلة؟'
  }
  if (hour < 12) return 'What are you studying this morning?'
  if (hour < 17) return 'What are you working on today?'
  if (hour < 21) return 'What would you like to figure out this evening?'
  return 'What are you curious about tonight?'
}

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import memexLogo from '../logo.png'
import lightThemeLogo from './assets/logo-light.png'
import {
  deleteCourseAndUnassignFiles,
  deleteFile as deleteStoredFile,
  loadWorkspace,
  saveCourse,
  saveFiles,
} from './workspaceStorage'
import type { StoredFile } from './workspaceStorage'
import ChatSettingsModal, { type ChatSettings } from './ChatSettingsModal'
import ChatSidebarWithHistory, { type ChatSession } from './ChatSidebarWithHistory'

type Course = {
  code: string
  title: string
  instructor: string
  color: 'blue' | 'purple' | 'green'
}

type StudyFile = {
  id: string
  file: File
  courseCode: string
  url: string
  uploadedAt: Date
}

type CourseForm = {
  code: string
  title: string
  instructor: string
}

type PageName = 'dashboard' | 'courses' | 'files' | 'profile' | 'ask-axi' | 'settings'
type HomePage = Exclude<PageName, 'courses' | 'files' | 'profile' | 'settings'>
type AnswerStyle = 'balanced' | 'concise' | 'step-by-step'
type Language = 'en' | 'fr' | 'ar'
type Theme = 'ember' | 'ocean' | 'forest' | 'light'
type SettingsSection = 'account' | 'appearance' | 'accessibility' | 'notifications' | 'study' | 'data'
type AppPreferences = {
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

type SelectOption = { value: string; label: string; swatch?: string }

const interfaceText = {
  en: {
    overview: 'Overview', courses: 'My Courses', files: 'My Files', profile: 'My Profile',
    askAxi: 'Ask AXI', settings: 'Settings', workspace: 'Workspace', menu: 'MENU',
    settingsKicker: 'MAKE MEMEX YOURS', preferencesSaved: 'Settings saved on this device.',
    preferencesSaveFailed: 'Settings were updated, but could not be saved in this browser.',
    universityWorkspace: 'Your university workspace', student: 'University student',
    storage: 'Storage', totalStorage: '5 GB total', yourSpace: 'Your space, your files',
    organizeSpace: 'Add your courses and study files to keep everything organized in one place.',
    storageReport: 'Storage report', largestFiles: 'Largest files',     noFilesStored: 'No files stored yet', filesInSelectedCourse: 'Files in selected course', showAll: 'Show all',
    storageReportHelp: 'Files you add to any course will appear in this report.',
    usedOf: 'used of 5 GB', available: 'available', studySpace: 'Your study space',
    goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening', goodNight: 'Good night',
    buildSpace: 'Add your courses and files to build your study space.', summary: 'Study space summary',
    courseCount: 'Courses you added', studyFiles: 'Study files', filesAdded: 'Files you added',
    manageCourses: 'Manage courses', manageFiles: 'Manage files', workspacePages: 'Workspace pages',
    studyAssistant: 'YOUR STUDY ASSISTANT', askDescription: 'Write a question and choose the study material and answer style.',
    yourQuestion: 'Your question', askPlaceholder: 'Ask anything about your courses or files...',
    answerStyle: 'Answer style', course: 'Course', studyFile: 'Study file',
    askNotConnected: 'AXI is not connected yet. You can prepare your question and choices here.',
    learningSpace: 'YOUR LEARNING SPACE', uploads: 'YOUR UPLOADS',
    addCourse: 'Add course', saveCourse: 'Save course', loading: 'Loading...', cancel: 'Cancel',
    courseCode: 'Course code', courseName: 'Course name', instructor: 'Instructor', optional: 'Optional',
    noCourses: 'No courses yet', addCourseHelp: 'Add a course to organize your study files.',
    noFiles: 'No files yet', addFilesHelp: 'Choose files from your device to add them to this workspace.',
    chooseFiles: 'Choose study files', addFiles: 'Add files', workspaceStorage: 'Workspace storage',
    storageUsed: 'used', storageRemaining: 'free', filesInCourse: 'Files in selected course',
    save: 'Save', viewFiles: 'View files', remove: 'Remove', added: 'added',
    profileHelp: 'Profile information and photo',
    yourStory: 'YOUR SPACE, YOUR STORY', imageHelp: 'Image files up to 2 MB. Saved on this device.',
    tellAboutYourself: 'Tell people a little about yourself...', bio: 'Bio',
    changePhoto: 'Change photo', addPhoto: 'Add profile photo', removePhoto: 'Remove photo',
    footer: 'Your study space, organized', used: 'used', free: 'free',
    settingsIntro: 'Personalize your workspace and study assistant. Your preferences are saved on this device.',
    account: 'Account', appearance: 'Appearance', accessibility: 'Accessibility',
    notifications: 'Notifications', study: 'Study workspace', assistant: 'Ask AXI',
    data: 'Storage & data', language: 'Language', languageHelp: 'Choose the language used across Memex.',
    theme: 'Color theme', themeHelp: 'Choose a palette for the whole workspace.',
    emberTheme: 'Ember', oceanTheme: 'Ocean', forestTheme: 'Forest', lightTheme: 'Light',
    density: 'Workspace density', densityHelp: 'Adjust spacing across workspace cards and lists.',
    comfortable: 'Comfortable', compact: 'Compact', startPage: 'Start page',
    startPageHelp: 'Used when Memex opens without a page selected.',
    defaultStyle: 'Default answer style', defaultStyleHelp: 'You can still change this for each question.',
    defaultCourse: 'Default course', defaultCourseHelp: 'Preselect a course in Ask AXI.',
    balanced: 'Balanced answer', concise: 'Concise answer', stepByStep: 'Step-by-step',
    allCourses: 'All courses', allFiles: 'All files',
    reduceMotion: 'Reduce motion', reduceMotionHelp: 'Turn off most transitions and smooth scrolling.',
    inAppNotifications: 'In-app messages', inAppNotificationsHelp: 'Show confirmations and status messages.',
    confirmCourseRemoval: 'Confirm course removal', confirmCourseRemovalHelp: 'Ask before removing a course.',
    localAccount: 'Local account', localAccountHelp: 'This workspace is stored on this device; no online account is connected.',
    editProfile: 'Edit profile', resetSettings: 'Reset settings', resetSettingsHelp: 'Restore all preferences to their defaults.',
    reset: 'Reset', savedOnDevice: 'Preferences are saved on this device.',
  },
  fr: {
    overview: 'Accueil', courses: 'Mes cours', files: 'Mes fichiers', profile: 'Mon profil',
    askAxi: 'Demander à AXI', settings: 'Paramètres', workspace: 'Espace de travail', menu: 'MENU',
    settingsKicker: 'PERSONNALISEZ MEMEX', preferencesSaved: 'Paramètres enregistrés sur cet appareil.',
    preferencesSaveFailed: 'Les paramètres ont changé, mais n’ont pas pu être enregistrés.',
    universityWorkspace: 'Votre espace universitaire', student: 'Étudiant universitaire',
    storage: 'Stockage', totalStorage: '5 Go au total', yourSpace: 'Votre espace, vos fichiers',
    organizeSpace: 'Ajoutez vos cours et fichiers pour tout organiser au même endroit.',
    storageReport: 'Rapport de stockage', largestFiles: 'Fichiers volumineux',     noFilesStored: 'Aucun fichier enregistré', filesInSelectedCourse: 'Fichiers du cours sélectionné', showAll: 'Tout afficher',
    storageReportHelp: 'Les fichiers ajoutés à vos cours apparaîtront ici.',
    usedOf: 'utilisés sur 5 Go', available: 'disponible', studySpace: 'Votre espace d’étude',
    goodMorning: 'Bonjour', goodAfternoon: 'Bon après-midi', goodEvening: 'Bonsoir', goodNight: 'Bonne nuit',
    buildSpace: 'Ajoutez vos cours et fichiers pour créer votre espace d’étude.', summary: 'Résumé de votre espace',
    courseCount: 'Cours ajoutés', studyFiles: 'Fichiers d’étude', filesAdded: 'Fichiers ajoutés',
    manageCourses: 'Gérer les cours', manageFiles: 'Gérer les fichiers', workspacePages: 'Pages de l’espace',
    studyAssistant: 'VOTRE ASSISTANT D’ÉTUDE', askDescription: 'Posez une question et choisissez le support et le style de réponse.',
    yourQuestion: 'Votre question', askPlaceholder: 'Posez une question sur vos cours ou fichiers...',
    answerStyle: 'Style de réponse', course: 'Cours', studyFile: 'Fichier d’étude',
    askNotConnected: 'AXI n’est pas encore connecté. Vous pouvez préparer votre question ici.',
    learningSpace: 'VOTRE ESPACE D’APPRENTISSAGE', uploads: 'VOS FICHIERS',
    addCourse: 'Ajouter un cours', saveCourse: 'Enregistrer le cours', loading: 'Chargement...', cancel: 'Annuler',
    courseCode: 'Code du cours', courseName: 'Nom du cours', instructor: 'Enseignant', optional: 'Facultatif',
    noCourses: 'Aucun cours', addCourseHelp: 'Ajoutez un cours pour organiser vos fichiers.',
    noFiles: 'Aucun fichier', addFilesHelp: 'Choisissez des fichiers à ajouter à cet espace.',
    chooseFiles: 'Choisir des fichiers', addFiles: 'Ajouter des fichiers', workspaceStorage: 'Stockage de l’espace',
    storageUsed: 'utilisés', storageRemaining: 'libres', filesInCourse: 'Fichiers du cours sélectionné',
    save: 'Enregistrer', viewFiles: 'Voir les fichiers', remove: 'Supprimer', added: 'ajoutés',
    profileHelp: 'Informations et photo du profil',
    yourStory: 'VOTRE ESPACE, VOTRE HISTOIRE', imageHelp: 'Images jusqu’à 2 Mo. Enregistrées sur cet appareil.',
    tellAboutYourself: 'Parlez un peu de vous...', bio: 'Biographie',
    changePhoto: 'Changer la photo', addPhoto: 'Ajouter une photo', removePhoto: 'Supprimer la photo',
    footer: 'Votre espace d’étude, bien organisé', used: 'utilisés', free: 'libres',
    settingsIntro: 'Personnalisez votre espace et votre assistant. Vos préférences sont enregistrées sur cet appareil.',
    account: 'Compte', appearance: 'Apparence', accessibility: 'Accessibilité',
    notifications: 'Notifications', study: 'Espace d’étude', assistant: 'Demander à AXI',
    data: 'Stockage et données', language: 'Langue', languageHelp: 'Choisissez la langue utilisée dans Memex.',
    theme: 'Thème de couleur', themeHelp: 'Choisissez une palette pour tout l’espace.',
    emberTheme: 'Ambre', oceanTheme: 'Océan', forestTheme: 'Forêt', lightTheme: 'Clair',
    density: 'Densité de l’espace', densityHelp: 'Ajustez l’espacement des cartes et des listes.',
    comfortable: 'Confortable', compact: 'Compact', startPage: 'Page de démarrage',
    startPageHelp: 'Page affichée lorsque Memex s’ouvre sans page sélectionnée.',
    defaultStyle: 'Style de réponse par défaut', defaultStyleHelp: 'Vous pouvez le modifier pour chaque question.',
    defaultCourse: 'Cours par défaut', defaultCourseHelp: 'Sélectionnez un cours par défaut dans AXI.',
    balanced: 'Réponse équilibrée', concise: 'Réponse concise', stepByStep: 'Étape par étape',
    allCourses: 'Tous les cours', allFiles: 'Tous les fichiers',
    reduceMotion: 'Réduire les animations', reduceMotionHelp: 'Désactivez les transitions et le défilement fluide.',
    inAppNotifications: 'Messages dans l’application', inAppNotificationsHelp: 'Afficher les confirmations et les messages.',
    confirmCourseRemoval: 'Confirmer la suppression d’un cours', confirmCourseRemovalHelp: 'Demander confirmation avant suppression.',
    localAccount: 'Compte local', localAccountHelp: 'Cet espace est stocké sur cet appareil, sans compte en ligne.',
    editProfile: 'Modifier le profil', resetSettings: 'Réinitialiser les paramètres',
    resetSettingsHelp: 'Rétablir les préférences par défaut.', reset: 'Réinitialiser',
    savedOnDevice: 'Les préférences sont enregistrées sur cet appareil.',
  },
  ar: {
    overview: 'الرئيسية', courses: 'مقرراتي', files: 'ملفاتي', profile: 'ملفي الشخصي',
    askAxi: 'اسأل AXI', settings: 'الإعدادات', workspace: 'مساحة العمل', menu: 'القائمة',
    settingsKicker: 'خصص Memex حسب رغبتك', preferencesSaved: 'تم حفظ الإعدادات على هذا الجهاز.',
    preferencesSaveFailed: 'تم تحديث الإعدادات، لكن تعذر حفظها في هذا المتصفح.',
    universityWorkspace: 'مساحتك الجامعية', student: 'طالب جامعي',
    storage: 'التخزين', totalStorage: '5 جيجابايت إجمالاً', yourSpace: 'مساحتك، ملفاتك',
    organizeSpace: 'أضف مقرراتك وملفاتك الدراسية لتنظيمها في مكان واحد.',
    storageReport: 'تقرير التخزين', largestFiles: 'أكبر الملفات',     noFilesStored: 'لا توجد ملفات محفوظة', filesInSelectedCourse: 'ملفات المقرر المحدد', showAll: 'عرض الكل',
    storageReportHelp: 'ستظهر هنا الملفات التي تضيفها إلى مقرراتك.',
    usedOf: 'مستخدم من 5 جيجابايت', available: 'متاح', studySpace: 'مساحتك الدراسية',
    goodMorning: 'صباح الخير', goodAfternoon: 'طاب يومك', goodEvening: 'مساء الخير', goodNight: 'تصبح على خير',
    buildSpace: 'أضف مقرراتك وملفاتك لبناء مساحة دراستك.', summary: 'ملخص مساحة الدراسة',
    courseCount: 'المقررات التي أضفتها', studyFiles: 'ملفات الدراسة', filesAdded: 'الملفات التي أضفتها',
    manageCourses: 'إدارة المقررات', manageFiles: 'إدارة الملفات', workspacePages: 'صفحات مساحة العمل',
    studyAssistant: 'مساعد الدراسة', askDescription: 'اكتب سؤالك واختر المادة الدراسية ونمط الإجابة.',
    yourQuestion: 'سؤالك', askPlaceholder: 'اسأل عن مقرراتك أو ملفاتك...',
    answerStyle: 'نمط الإجابة', course: 'المقرر', studyFile: 'ملف الدراسة',
    askNotConnected: 'AXI غير متصل حالياً. يمكنك إعداد سؤالك وخياراتك هنا.',
    learningSpace: 'مساحة التعلّم', uploads: 'ملفاتك المرفوعة',
    addCourse: 'إضافة مقرر', saveCourse: 'حفظ المقرر', loading: 'جار التحميل...', cancel: 'إلغاء',
    courseCode: 'رمز المقرر', courseName: 'اسم المقرر', instructor: 'الأستاذ', optional: 'اختياري',
    noCourses: 'لا توجد مقررات بعد', addCourseHelp: 'أضف مقرراً لتنظيم ملفات الدراسة.',
    noFiles: 'لا توجد ملفات بعد', addFilesHelp: 'اختر ملفات من جهازك لإضافتها إلى مساحة العمل.',
    chooseFiles: 'اختيار ملفات الدراسة', addFiles: 'إضافة ملفات', workspaceStorage: 'تخزين مساحة العمل',
    storageUsed: 'مستخدم', storageRemaining: 'متاح', filesInCourse: 'ملفات المقرر المحدد',
    save: 'حفظ', viewFiles: 'عرض الملفات', remove: 'إزالة', added: 'مضافة',
    profileHelp: 'معلومات وصورة الملف الشخصي',
    yourStory: 'مساحتك، قصتك', imageHelp: 'صور حتى 2 ميغابايت. تُحفظ على هذا الجهاز.',
    tellAboutYourself: 'عرّف الآخرين بنفسك...', bio: 'نبذة',
    changePhoto: 'تغيير الصورة', addPhoto: 'إضافة صورة شخصية', removePhoto: 'إزالة الصورة',
    footer: 'مساحة دراستك، منظمة', used: 'مستخدم', free: 'متاح',
    settingsIntro: 'خصص مساحة عملك ومساعد الدراسة. تُحفظ تفضيلاتك على هذا الجهاز.',
    account: 'الحساب', appearance: 'المظهر', accessibility: 'إمكانية الوصول',
    notifications: 'الإشعارات', study: 'مساحة الدراسة', assistant: 'اسأل AXI',
    data: 'التخزين والبيانات', language: 'اللغة', languageHelp: 'اختر لغة واجهة Memex.',
    theme: 'سمة الألوان', themeHelp: 'اختر ألوان مساحة العمل بالكامل.',
    emberTheme: 'عنبر', oceanTheme: 'محيط', forestTheme: 'غابة', lightTheme: 'فاتح',
    density: 'كثافة عرض مساحة العمل', densityHelp: 'غيّر المسافات بين البطاقات والقوائم.',
    comfortable: 'مريح', compact: 'مضغوط', startPage: 'صفحة البداية',
    startPageHelp: 'الصفحة التي تظهر عند فتح Memex دون تحديد صفحة.',
    defaultStyle: 'نمط الإجابة الافتراضي', defaultStyleHelp: 'يمكنك تغييره لكل سؤال.',
    defaultCourse: 'المقرر الافتراضي', defaultCourseHelp: 'تحديد مقرر تلقائياً في اسأل AXI.',
    balanced: 'إجابة متوازنة', concise: 'إجابة مختصرة', stepByStep: 'خطوة بخطوة',
    allCourses: 'كل المقررات', allFiles: 'كل الملفات',
    reduceMotion: 'تقليل الحركة', reduceMotionHelp: 'إيقاف معظم الانتقالات والتمرير السلس.',
    inAppNotifications: 'رسائل داخل التطبيق', inAppNotificationsHelp: 'إظهار رسائل التأكيد والحالة.',
    confirmCourseRemoval: 'تأكيد إزالة المقرر', confirmCourseRemovalHelp: 'طلب التأكيد قبل إزالة مقرر.',
    localAccount: 'حساب محلي', localAccountHelp: 'مساحة العمل محفوظة على هذا الجهاز ولا يوجد حساب متصل.',
    editProfile: 'تعديل الملف الشخصي', resetSettings: 'إعادة ضبط الإعدادات',
    resetSettingsHelp: 'استعادة جميع التفضيلات الافتراضية.', reset: 'إعادة الضبط',
    savedOnDevice: 'تُحفظ التفضيلات على هذا الجهاز.',
  },
} satisfies Record<Language, Record<string, string>>

type Profile = {
  bio: string
  photo: string
}

const emptyCourseForm: CourseForm = { code: '', title: '', instructor: '' }
const courseColors: Course['color'][] = ['blue', 'purple', 'green']
const username = 'Younes'
const defaultProfile: Profile = { bio: '', photo: '' }
const storageLimit = 5 * 1024 ** 3
const defaultPreferences: AppPreferences = {
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

function toHomePage(value: string): HomePage {
  return value === 'ask-axi' ? value : 'dashboard'
}

function toAnswerStyle(value: string): AnswerStyle {
  return value === 'concise' || value === 'step-by-step' ? value : 'balanced'
}

function readSavedPreferences(): { preferences: AppPreferences; status: string } {
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

function readSavedProfile() {
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

function readSavedChatSessions(): ChatSession[] {
  const fallback: ChatSession[] = [
    { id: 'chat-today', title: 'Reviewing recursion examples', updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
    { id: 'chat-yesterday', title: 'Preparing for statistics quiz', updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString() },
    { id: 'chat-older', title: 'Big-O notation explained', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ]

  try {
    const stored = window.localStorage.getItem('memex-chat-history')
    if (!stored) return fallback
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) throw new Error('Saved chat history must be a list.')

    return parsed.filter((value): value is ChatSession => (
      typeof value === 'object'
      && value !== null
      && 'id' in value && typeof value.id === 'string'
      && 'title' in value && typeof value.title === 'string'
      && 'updatedAt' in value && typeof value.updatedAt === 'string'
    ))
  } catch {
    return fallback
  }
}

function getPageFromHash(defaultPage: HomePage = 'dashboard'): PageName {
  const page = window.location.hash.slice(1)
  return page === 'courses' || page === 'files' || page === 'profile' || page === 'ask-axi' || page === 'settings'
    ? page
    : defaultPage
}

function getGreeting(date: Date, language: Language) {
  const hour = date.getHours()
  const text = interfaceText[language]
  if (hour < 12) return text.goodMorning
  if (hour < 17) return text.goodAfternoon
  if (hour < 21) return text.goodEvening
  return text.goodNight
}

function getAskGreeting(
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

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

type AskOption = {
  value: string
  label: string
}

function AskSelect({
  label,
  value,
  options,
  icon,
  onChange,
}: {
  label: string
  value: string
  options: AskOption[]
  icon: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !selectRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="ask-select" ref={selectRef}>
      <button
        className="ask-select-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="ask-select-icon" aria-hidden="true">{icon}</span>
        <span className="ask-select-value">{selectedOption?.label ?? 'Choose'}</span>
        <span className={`ask-select-chevron${open ? ' open' : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="ask-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              className={`ask-select-option${option.value === value ? ' selected' : ''}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <span className="ask-select-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}

function SettingsSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !selectRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="settings-select-wrap" ref={selectRef}>
      <button
        className="settings-select-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="settings-select-current">
          {selectedOption?.swatch && <span className="theme-swatch" style={{ background: selectedOption.swatch }} aria-hidden="true" />}
          {selectedOption?.label ?? 'Choose'}
        </span>
        <span className={`settings-select-chevron${open ? ' open' : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="settings-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              className={`settings-select-option${option.value === value ? ' selected' : ''}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span className="settings-select-option-label">
                {option.swatch && <span className="theme-swatch" style={{ background: option.swatch }} aria-hidden="true" />}
                {option.label}
              </span>
              {option.value === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [files, setFiles] = useState<StudyFile[]>([])
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false)
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null)
  const [courseFormOpen, setCourseFormOpen] = useState(false)
  const [courseForm, setCourseForm] = useState(emptyCourseForm)
  const [savedProfile] = useState(readSavedProfile)
  const [savedSettings] = useState(readSavedPreferences)
  const [preferences, setPreferences] = useState(savedSettings.preferences)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('appearance')
  const [profile, setProfile] = useState(savedProfile.profile)
  const [activeSection, setActiveSection] = useState<PageName>(() => getPageFromHash(savedSettings.preferences.homePage))
  const [askPrompt, setAskPrompt] = useState('')
  const [chatAttachments, setChatAttachments] = useState<Array<{ id: string; file: File }>>([])
  const [chatAttachmentError, setChatAttachmentError] = useState('')
  const [answerStyle, setAnswerStyle] = useState<AnswerStyle>(savedSettings.preferences.defaultAnswerStyle)
  const [askCourseCode, setAskCourseCode] = useState(savedSettings.preferences.defaultCourseCode)
  const [askFileId, setAskFileId] = useState('')
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(readSavedChatSessions)
  const [activeChatId, setActiveChatId] = useState<string | null>(() => readSavedChatSessions()[0]?.id ?? null)
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false)
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    model: 'axi-study',
    responseStyle: 'balanced',
    detailLevel: 'standard',
    systemInstructions: '',
  })
  const [status, setStatus] = useState(savedProfile.status || savedSettings.status)
  const [now, setNow] = useState(() => new Date())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatImageInputRef = useRef<HTMLInputElement>(null)
  const chatFileInputRef = useRef<HTMLInputElement>(null)
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const fileUrls = useRef(new Set<string>())
  const pendingUploadBytes = useRef(0)
  const profileRef = useRef(profile)
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)
  const [storageReportOpen, setStorageReportOpen] = useState(false)
  const text = interfaceText[preferences.language]
  const activeChat = chatSessions.find((session) => session.id === activeChatId)

  function saveChatSessions(nextSessions: ChatSession[]) {
    setChatSessions(nextSessions)
    try {
      window.localStorage.setItem('memex-chat-history', JSON.stringify(nextSessions))
    } catch (error) {
      setStatus(`Chat history was updated, but could not be saved in this browser: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
    }
  }

  function startNewChat() {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New chat',
      updatedAt: new Date().toISOString(),
    }
    saveChatSessions([session, ...chatSessions])
    setActiveChatId(session.id)
    setAskPrompt('')
    setChatAttachments([])
    setChatAttachmentError('')
  }

  function handleChatAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const filesToAdd = Array.from(event.target.files ?? [])
    event.target.value = ''
    setChatAttachmentError('')
    if (filesToAdd.length === 0) return

    const oversizedFiles = filesToAdd.filter((file) => file.size > 20 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setChatAttachmentError(`${oversizedFiles.map((file) => file.name).join(', ')} exceed the 20 MB limit.`)
      return
    }

    const uniqueFiles = filesToAdd.filter((file) => !chatAttachments.some((attachment) => (
      attachment.file.name === file.name
      && attachment.file.size === file.size
      && attachment.file.lastModified === file.lastModified
    )))
    const remainingCount = Math.max(0, 10 - chatAttachments.length)
    const acceptedFiles = uniqueFiles.slice(0, remainingCount)
    let validationMessage = ''
    if (uniqueFiles.length > remainingCount) {
      validationMessage = 'You can attach up to 10 files to a chat.'
    }
    if (uniqueFiles.length < filesToAdd.length && !validationMessage) {
      validationMessage = 'Duplicate files were skipped.'
    }
    setChatAttachmentError(validationMessage)
    setChatAttachments((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({ id: crypto.randomUUID(), file })),
    ])
  }

  function deleteChat(session: ChatSession) {
    const remainingSessions = chatSessions.filter((item) => item.id !== session.id)
    saveChatSessions(remainingSessions)
    if (activeChatId === session.id) {
      setActiveChatId(remainingSessions[0]?.id ?? null)
      setAskPrompt('')
    }
  }

  function renameChat(session: ChatSession, title: string) {
    const nextTitle = title.trim()
    if (!nextTitle) return
    saveChatSessions(chatSessions.map((item) => (
      item.id === session.id ? { ...item, title: nextTitle } : item
    )))
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const updatePage = () => setActiveSection(getPageFromHash(preferences.homePage))
    window.addEventListener('hashchange', updatePage)
    return () => window.removeEventListener('hashchange', updatePage)
  }, [preferences.homePage])

  useEffect(() => {
    let cancelled = false
    loadWorkspace()
      .then((workspace) => {
        if (cancelled) return
        setCourses(workspace.courses)
        const restoredFiles = workspace.files.map((storedFile) => {
          const file = new File([storedFile.blob], storedFile.name, {
            type: storedFile.type,
            lastModified: storedFile.lastModified,
          })
          const url = URL.createObjectURL(file)
          fileUrls.current.add(url)
          return {
            id: storedFile.id,
            file,
            courseCode: storedFile.courseCode,
            url,
            uploadedAt: new Date(storedFile.uploadedAt),
          }
        })
        setFiles(restoredFiles)
        setWorkspaceLoaded(true)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setStatus(`Saved courses and files could not be loaded: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
        setWorkspaceLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profilePopoverOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
        setProfilePopoverOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfilePopoverOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profilePopoverOpen])

  useEffect(() => {
    if (!storageReportOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setStorageReportOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [storageReportOpen])

  function updateProfile(changes: Partial<Profile>) {
    const nextProfile = { ...profileRef.current, ...changes }
    profileRef.current = nextProfile
    setProfile(nextProfile)
    try {
      window.localStorage.setItem('memex-profile', JSON.stringify(nextProfile))
    } catch {
      setStatus('Your profile changed, but could not be saved in this browser.')
    }
  }

  function updatePreferences(changes: Partial<AppPreferences>) {
    const nextPreferences = { ...preferences, ...changes }
    setPreferences(nextPreferences)
    try {
      window.localStorage.setItem('memex-settings', JSON.stringify(nextPreferences))
      setStatus(interfaceText[nextPreferences.language].preferencesSaved)
    } catch {
      setStatus(interfaceText[nextPreferences.language].preferencesSaveFailed)
    }
  }

  useEffect(() => () => {
    fileUrls.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const visibleFiles = selectedCourseCode
    ? files.filter((file) => file.courseCode === selectedCourseCode)
    : files
  const askCourseSelection = courses.some((course) => course.code === askCourseCode) ? askCourseCode : ''
  const storageUsed = files.reduce((size, file) => size + file.file.size, 0)
  const storageRemaining = Math.max(0, storageLimit - storageUsed)
  const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100)
  const largestFiles = [...files].sort((left, right) => right.file.size - left.file.size)

  async function handleAddCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = courseForm.code.trim()
    const title = courseForm.title.trim()
    const instructor = courseForm.instructor.trim()

    if (courses.some((course) => course.code.toLowerCase() === code.toLowerCase())) {
      setStatus(`A course with code ${code} already exists.`)
      return
    }

    const course = { code, title, instructor, color: courseColors[courses.length % courseColors.length] }
    try {
      await saveCourse(course)
    } catch (error) {
      setStatus(`Course could not be saved: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
      return
    }

    setCourses((current) => [...current, course])
    setCourseForm(emptyCourseForm)
    setCourseFormOpen(false)
    setStatus(`${title} was added.`)
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? [])
    if (selectedFiles.length === 0) return

    const input = event.currentTarget
    const batchSize = selectedFiles.reduce((size, file) => size + file.size, 0)
    if (storageUsed + pendingUploadBytes.current + batchSize > storageLimit) {
      setStatus(`Not enough storage. You have ${formatSize(storageRemaining)} remaining out of 5 GB.`)
      input.value = ''
      return
    }

    pendingUploadBytes.current += batchSize
    try {
      const uploadedAt = new Date()
      const uploads = selectedFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        courseCode: selectedCourseCode ?? '',
        uploadedAt,
      }))
      const records: StoredFile[] = uploads.map(({ id, file, courseCode, uploadedAt: date }) => ({
        id,
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
        size: file.size,
        courseCode,
        uploadedAt: date.getTime(),
        blob: file,
      }))
      await saveFiles(records)
      const uploadedFiles = uploads.map(({ id, file, courseCode, uploadedAt: date }) => {
        const url = URL.createObjectURL(file)
        fileUrls.current.add(url)
        return { id, file, courseCode, url, uploadedAt: date }
      })
      setFiles((current) => [...uploadedFiles, ...current])
      setStatus(`${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'} saved. ${formatSize(storageLimit - storageUsed - batchSize)} of 5 GB remaining.`)
    } catch (error) {
      setStatus(`Files could not be saved: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
    } finally {
      pendingUploadBytes.current -= batchSize
      input.value = ''
    }
  }

  async function handleRemoveFile(file: StudyFile) {
    try {
      await deleteStoredFile(file.id)
    } catch (error) {
      setStatus(`File could not be removed from storage: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
      return
    }
    URL.revokeObjectURL(file.url)
    fileUrls.current.delete(file.url)
    setFiles((current) => current.filter((item) => item.id !== file.id))
    setStatus(`${file.file.name} was removed.`)
  }

  async function handleRemoveCourse(course: Course) {
    if (
      preferences.confirmCourseRemoval
      && !window.confirm(`Remove ${course.title}? Its files will stay in My Files.`)
    ) return

    try {
      await deleteCourseAndUnassignFiles(course.code)
    } catch (error) {
      setStatus(`Course could not be removed from storage: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
      return
    }
    setCourses((current) => current.filter((item) => item.code !== course.code))
    setFiles((current) => current.map((file) => (
      file.courseCode === course.code ? { ...file, courseCode: '' } : file
    )))
    if (selectedCourseCode === course.code) setSelectedCourseCode(null)
    setStatus(`${course.title} was removed. Its files are still available in My Files.`)
  }

  function handleProfilePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const photo = event.target.files?.[0]
    event.target.value = ''
    if (!photo) return
    if (!photo.type.startsWith('image/')) {
      setStatus('Choose an image file for your profile photo.')
      return
    }
    if (photo.size > 2 * 1024 * 1024) {
      setStatus('Profile photos must be 2 MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        setStatus('The selected profile photo could not be read.')
        return
      }
      const photoData = reader.result
      updateProfile({ photo: photoData })
      setStatus('Profile photo updated.')
    })
    reader.addEventListener('error', () => setStatus('The selected profile photo could not be read.'))
    reader.readAsDataURL(photo)
  }

  return (
    <div
      className="app-shell"
      id="dashboard"
      data-density={preferences.density}
      data-reduce-motion={preferences.reduceMotion}
      data-theme={preferences.theme}
      lang={preferences.language}
      dir={preferences.language === 'ar' ? 'rtl' : 'ltr'}
    >
      <aside className="sidebar" aria-label={text.menu}>
        <a className="brand" href="#dashboard" aria-label="Memex - Home">
          <span className="brand-mark" aria-hidden="true">
            <img src={preferences.theme === 'light' ? lightThemeLogo : memexLogo} alt="" />
          </span>
          <span>
            <small>{text.universityWorkspace}</small>
          </span>
        </a>

        <p className="nav-caption">{text.menu}</p>
        <nav className="main-nav">
          <a
            className={`nav-item${activeSection === 'dashboard' ? ' active' : ''}`}
            href="#dashboard"
            aria-current={activeSection === 'dashboard' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">⌂</span>
            {text.overview}
          </a>
          <button className="nav-item nav-item-disabled" type="button" disabled aria-disabled="true" title="Coming soon">
            <span className="nav-icon" aria-hidden="true">▤</span>
            Feed
            <span className="nav-coming-soon">Soon</span>
          </button>
          <a
            className={`nav-item${activeSection === 'profile' ? ' active' : ''}`}
            href="#profile"
            aria-current={activeSection === 'profile' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M2.25 12s3.55-6.25 9.75-6.25S21.75 12 21.75 12s-3.55 6.25-9.75 6.25S2.25 12 2.25 12Z" />
                <circle cx="12" cy="12" r="2.75" />
              </svg>
            </span>
            {text.profile}
          </a>
          <a
            className={`nav-item${activeSection === 'ask-axi' ? ' active' : ''}`}
            href="#ask-axi"
            aria-current={activeSection === 'ask-axi' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">✦</span>
            {text.askAxi}
          </a>
          <button className="nav-item nav-item-disabled" type="button" disabled aria-disabled="true" title="Coming soon">
            <span className="nav-icon" aria-hidden="true">↻</span>
            Review weaknesses
            <span className="nav-coming-soon">Soon</span>
          </button>
          <a
            className={`nav-item${activeSection === 'settings' ? ' active' : ''}`}
            href="#settings"
            aria-current={activeSection === 'settings' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">⚙</span>
            {text.settings}
          </a>
        </nav>

        <button
          className="sidebar-storage"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={storageReportOpen}
          onClick={() => setStorageReportOpen(true)}
        >
          <div className="sidebar-storage-heading">
            <strong>{text.storage}</strong>
            <span>{text.totalStorage}</span>
          </div>
          <div
            className="storage-progress"
            role="progressbar"
            aria-label="Total storage used"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(storagePercent)}
          >
            <span style={{ width: `${storagePercent}%` }} />
          </div>
          <p>{formatSize(storageUsed)} used <span>·</span> {formatSize(storageRemaining)} free</p>
        </button>

        <div className="sidebar-note">
          <span className="note-sparkle" aria-hidden="true">✦</span>
          <strong>{text.yourSpace}</strong>
          <p>{text.organizeSpace}</p>
        </div>

        <div className="sidebar-profile" ref={profileMenuRef}>
          <button
            className="sidebar-profile-trigger"
            type="button"
            aria-expanded={profilePopoverOpen}
            aria-haspopup="dialog"
            onClick={() => setProfilePopoverOpen((open) => !open)}
          >
            <span className="avatar" aria-hidden="true">
              {profile.photo ? <img src={profile.photo} alt="" /> : username.charAt(0)}
            </span>
            <span className="sidebar-profile-info">
              <strong>{username}</strong>
              <small>{text.student}</small>
            </span>
          </button>
          {profilePopoverOpen && (
            <section className="profile-popover" role="dialog" aria-label={`${username}'s profile preview`}>
              <div className="profile-popover-heading">
                <span className="avatar profile-popover-avatar" aria-hidden="true">
                  {profile.photo ? <img src={profile.photo} alt="" /> : username.charAt(0)}
                </span>
                <div>
                  <strong>{username}</strong>
                  <small>{text.student}</small>
                </div>
              </div>
              <p className="profile-popover-bio">{profile.bio || 'No bio yet.'}</p>
              <button
                className="profile-popover-link"
                type="button"
                onClick={() => {
                  setProfilePopoverOpen(false)
                  window.location.hash = 'profile'
                }}
              >
                View profile <span aria-hidden="true">→</span>
              </button>
            </section>
          )}
        </div>
      </aside>

      {storageReportOpen && (
        <div
          className="storage-report-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setStorageReportOpen(false)
          }}
        >
          <section
            className="storage-report"
            role="dialog"
            aria-modal="true"
            aria-labelledby="storage-report-title"
          >
            <header className="storage-report-header">
              <div>
                <p className="section-kicker">{text.storage}</p>
                <h2 id="storage-report-title">{text.storageReport}</h2>
              </div>
              <button
                className="storage-report-close"
                type="button"
                aria-label="Close storage report"
                onClick={() => setStorageReportOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="storage-report-summary">
              <div>
                <strong>{formatSize(storageUsed)}</strong>
                <span>{text.usedOf}</span>
              </div>
              <div>
                <strong>{formatSize(storageRemaining)}</strong>
                <span>{text.available}</span>
              </div>
            </div>
            <div
              className="storage-progress"
              role="progressbar"
              aria-label="Total storage used"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(storagePercent)}
            >
              <span style={{ width: `${storagePercent}%` }} />
            </div>
            <div className="storage-report-list-heading">
              <h3>{text.largestFiles}</h3>
              <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
            </div>
            {largestFiles.length > 0 ? (
              <div className="storage-report-list">
                {largestFiles.map((studyFile) => {
                  const course = courses.find((item) => item.code === studyFile.courseCode)
                  return (
                    <button
                      className="storage-file-row"
                      type="button"
                      key={studyFile.id}
                      onClick={() => {
                        setSelectedCourseCode(studyFile.courseCode || null)
                        setStorageReportOpen(false)
                        window.location.hash = 'files'
                      }}
                    >
                      <span className="storage-file-icon" aria-hidden="true">▤</span>
                      <span className="storage-file-details">
                        <strong>{studyFile.file.name}</strong>
                        <small>{course?.title ?? 'No course selected'}</small>
                      </span>
                      <span className="storage-file-size">{formatSize(studyFile.file.size)}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="storage-report-empty">
                <strong>{text.noFilesStored}</strong>
                <p>{text.storageReportHelp}</p>
              </div>
            )}
          </section>
        </div>
      )}

      <main className="main-content">
        <header className="topbar">
          <p>
            {activeSection === 'courses'
              ? text.courses
              : activeSection === 'files'
                ? text.files
                : activeSection === 'profile'
                  ? text.profile
                    : activeSection === 'ask-axi'
                      ? text.askAxi
                      : activeSection === 'settings'
                        ? text.settings
                        : text.overview}
          </p>
          <div className="topbar-actions">
            <span className="semester-pill">
              <span className="status-dot" aria-hidden="true" />
              {text.workspace}
            </span>
            <a
              className={`topbar-settings${activeSection === 'settings' ? ' active' : ''}`}
              href="#settings"
              aria-label="Open settings"
              aria-current={activeSection === 'settings' ? 'page' : undefined}
            >
              <span aria-hidden="true">⚙</span>
              <span>{text.settings}</span>
            </a>
          </div>
        </header>

        {activeSection === 'dashboard' && (
        <>
        <section className="welcome-section" aria-labelledby="welcome-title">
          <div>
            <p className="eyebrow">{now.toLocaleDateString(preferences.language, { dateStyle: 'full' })}</p>
            <h1 id="welcome-title">{getGreeting(now, preferences.language)}, {username} <span aria-hidden="true">✦</span></h1>
            <p className="welcome-copy">{text.buildSpace}</p>
          </div>
        </section>

        <section className="stats-grid" aria-label={text.summary}>
          <a className="stat-card stat-card-link" href="#courses" aria-label={`${text.courses}: ${courses.length}`}>
            <span className="stat-icon icon-blue" aria-hidden="true">▦</span>
            <div>
              <p>{text.courses}</p>
              <strong>{courses.length}</strong>
              <small>{text.courseCount}</small>
            </div>
          </a>
          <a className="stat-card stat-card-link" href="#files" aria-label={`${text.studyFiles}: ${visibleFiles.length}`}>
            <span className="stat-icon icon-orange" aria-hidden="true">▤</span>
            <div>
              <p>{text.studyFiles}</p>
              <strong>{visibleFiles.length}</strong>
              <small>{selectedCourseCode ? text.filesInSelectedCourse : text.filesAdded}</small>
            </div>
          </a>
          <article className="stat-card">
            <span className="stat-icon icon-green" aria-hidden="true">▣</span>
            <div className="storage-stat-content">
              <p>{text.storage}</p>
              <strong>{formatSize(storageUsed)}</strong>
              <small>{formatSize(storageRemaining)} available of 5 GB</small>
              <div
                className="storage-progress"
                role="progressbar"
                aria-label="Storage used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(storagePercent)}
              >
                <span style={{ width: `${storagePercent}%` }} />
              </div>
            </div>
          </article>
        </section>
        <section className="dashboard-shortcuts" aria-label={text.workspacePages}>
          <a className="shortcut-card" href="#courses">
            <span className="shortcut-icon" aria-hidden="true">▦</span>
            <span>
              <strong>{text.manageCourses}</strong>
              <small>{courses.length} {courses.length === 1 ? 'course' : 'courses'} in your workspace</small>
            </span>
            <span className="shortcut-arrow" aria-hidden="true">→</span>
          </a>
          <a className="shortcut-card" href="#files">
            <span className="shortcut-icon" aria-hidden="true">▤</span>
            <span>
              <strong>{text.manageFiles}</strong>
              <small>{files.length} {files.length === 1 ? 'file' : 'files'} in your workspace</small>
            </span>
            <span className="shortcut-arrow" aria-hidden="true">→</span>
          </a>
        </section>
        </>
        )}

        {activeSection === 'ask-axi' && (
          <section className="chat-workspace" aria-label={text.studyAssistant}>
            <ChatSidebarWithHistory
              sessions={chatSessions}
              activeSessionId={activeChatId}
              currentDate={now}
              onNewChat={startNewChat}
              onSelectChat={(session) => {
                setActiveChatId(session.id)
                setAskPrompt('')
                setChatAttachments([])
                setChatAttachmentError('')
              }}
              onDeleteChat={deleteChat}
              onRenameChat={renameChat}
            />
            <div className="chat-workspace-main">
              <div className="ask-heading chat-heading">
                <div>
                  <p className="section-kicker">{text.studyAssistant}</p>
                  <h1 id="ask-title">{activeChat?.title ?? getAskGreeting(now, courses, files, askCourseSelection, preferences.language)}</h1>
                  <p>{text.askDescription}</p>
                </div>
                <button className="chat-settings-trigger" type="button" onClick={() => setChatSettingsOpen(true)}>
                  <span aria-hidden="true">⚙</span> Chat settings
                </button>
              </div>

              <div className="ask-composer">
              <label className="visually-hidden" htmlFor="ask-prompt">{text.yourQuestion}</label>
              <textarea
                id="ask-prompt"
                value={askPrompt}
                onChange={(event) => setAskPrompt(event.target.value)}
                placeholder={text.askPlaceholder}
                rows={4}
              />
              {chatAttachments.length > 0 && (
                <div className="chat-attachment-list" aria-label="Chat attachments">
                  {chatAttachments.map(({ id, file }) => (
                    <span className="chat-attachment-chip" key={id} title={file.name}>
                      <span className="chat-attachment-icon" aria-hidden="true">
                        {file.type.startsWith('image/') ? '▧' : '▤'}
                      </span>
                      <span className="chat-attachment-name">{file.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setChatAttachments((current) => current.filter((attachment) => attachment.id !== id))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {chatAttachmentError && <p className="chat-attachment-error" role="alert">{chatAttachmentError}</p>}
              <div className="ask-composer-controls">
                <div className="ask-selectors">
                  <AskSelect
                    label={text.answerStyle}
                    value={answerStyle}
                    icon="✦"
                    options={[
                      { value: 'balanced', label: text.balanced },
                      { value: 'concise', label: text.concise },
                      { value: 'step-by-step', label: text.stepByStep },
                    ]}
                    onChange={(value) => setAnswerStyle(toAnswerStyle(value))}
                  />
                  <AskSelect
                    label={text.course}
                    value={askCourseSelection}
                    icon="▦"
                    options={[
                      { value: '', label: text.allCourses },
                      ...courses.map((course) => ({
                        value: course.code,
                        label: `${course.code} · ${course.title}`,
                      })),
                    ]}
                    onChange={(value) => {
                      setAskCourseCode(value)
                      if (askFileId && files.find((file) => file.id === askFileId)?.courseCode !== value) {
                        setAskFileId('')
                      }
                    }}
                  />
                  <AskSelect
                    label={text.studyFile}
                    value={askFileId}
                    icon="▤"
                    options={[
                      { value: '', label: text.allFiles },
                      ...files
                        .filter((file) => !askCourseSelection || file.courseCode === askCourseSelection)
                        .map((studyFile) => ({
                          value: studyFile.id,
                          label: studyFile.file.name,
                        })),
                    ]}
                    onChange={(value) => {
                      setAskFileId(value)
                      const selectedFile = files.find((file) => file.id === value)
                      if (selectedFile?.courseCode) setAskCourseCode(selectedFile.courseCode)
                    }}
                  />
                </div>
                <div className="ask-composer-actions">
                  <input
                    ref={chatImageInputRef}
                    className="visually-hidden"
                    type="file"
                    accept="image/*"
                    multiple
                    aria-label="Choose images to attach"
                    onChange={handleChatAttachmentChange}
                  />
                  <input
                    ref={chatFileInputRef}
                    className="visually-hidden"
                    type="file"
                    multiple
                    aria-label="Choose files to attach"
                    onChange={handleChatAttachmentChange}
                  />
                  <button className="chat-attach-button" type="button" aria-label="Add images" title="Add images" onClick={() => chatImageInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="3" />
                      <circle cx="8.5" cy="9" r="1.5" />
                      <path d="m4 17 5-5 3 3 2-2 6 6" />
                    </svg>
                  </button>
                  <button className="chat-attach-button" type="button" aria-label="Add files" title="Add files" onClick={() => chatFileInputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M13.5 6.5 8 12a3.5 3.5 0 0 0 5 5l6-6a5 5 0 0 0-7-7l-7 7a6.5 6.5 0 0 0 9 9l5-5" />
                    </svg>
                  </button>
                  <button className="ask-send-button" type="button" disabled aria-label="Send question">
                    <span aria-hidden="true">➤</span>
                  </button>
                </div>
              </div>
              </div>
              <p className="ask-note">{text.askNotConnected}</p>
            </div>
          </section>
        )}

        {activeSection === 'courses' && <section className="content-section" aria-labelledby="courses-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{text.learningSpace}</p>
              <h2 id="courses-title">{text.courses}</h2>
            </div>
            <button className="primary-button" type="button" disabled={!workspaceLoaded} onClick={() => setCourseFormOpen((open) => !open)}>
              {!workspaceLoaded ? text.loading : courseFormOpen ? text.cancel : text.addCourse}
            </button>
          </div>

          {courseFormOpen && (
            <form className="course-form" onSubmit={handleAddCourse}>
              <label>
                {text.courseCode}
                <input
                  required
                  value={courseForm.code}
                  onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })}
                  placeholder="e.g. CS 204"
                />
              </label>
              <label>
                {text.courseName}
                <input
                  required
                  value={courseForm.title}
                  onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })}
                  placeholder="e.g. Data Structures"
                />
              </label>
              <label>
                {text.instructor}
                <input
                  value={courseForm.instructor}
                  onChange={(event) => setCourseForm({ ...courseForm, instructor: event.target.value })}
                  placeholder={text.optional}
                />
              </label>
              <button className="primary-button" type="submit">{text.saveCourse}</button>
            </form>
          )}

          {!workspaceLoaded ? (
            <div className="empty-state"><strong>{text.loading}</strong></div>
          ) : courses.length > 0 ? (
            <div className="course-grid">
              {courses.map((course) => {
                const courseFileCount = files.filter((file) => file.courseCode === course.code).length
                return (
                  <article
                    className={`course-card ${course.color}${selectedCourseCode === course.code ? ' selected' : ''}`}
                    key={course.code}
                  >
                    <button
                      className="course-card-select"
                      type="button"
                      aria-pressed={selectedCourseCode === course.code}
                      aria-label={`${text.viewFiles}: ${course.title}`}
                      onClick={() => {
                        setSelectedCourseCode(course.code)
                        window.location.hash = 'files'
                      }}
                    >
                      <span className="course-card-top">
                        <span className="course-code">{course.code}</span>
                        <span className="course-symbol" aria-hidden="true">✳</span>
                      </span>
                      <span className="course-title">{course.title}</span>
                      <span className="instructor">{course.instructor || text.optional}</span>
                      <span className="course-card-bottom">
                        <span>{courseFileCount} {courseFileCount === 1 ? 'file' : 'files'}</span>
                        <span className="course-arrow" aria-hidden="true">→</span>
                      </span>
                    </button>
                    <button
                      className="remove-course-button"
                      type="button"
                      aria-label={`Remove ${course.title}`}
                      onClick={() => handleRemoveCourse(course)}
                    >
                      {text.remove}
                    </button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <strong>{text.noCourses}</strong>
              <p>{text.addCourseHelp}</p>
            </div>
          )}
        </section>}

        {activeSection === 'files' && <section className="content-section files-section" aria-labelledby="files-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{text.uploads}</p>
              <h2 id="files-title">{selectedCourseCode ? `${text.files} · ${selectedCourseCode}` : text.files}</h2>
            </div>
            <div className="file-actions">
              {selectedCourseCode && (
                <button className="text-button" type="button" onClick={() => setSelectedCourseCode(null)}>
                  {text.showAll}
                </button>
              )}
              <button className="primary-button" type="button" disabled={!workspaceLoaded || storageRemaining === 0} onClick={() => fileInputRef.current?.click()}>
                {text.addFiles}
              </button>
              <input
                ref={fileInputRef}
                className="visually-hidden"
                type="file"
                multiple
                aria-label="Choose study files"
                onChange={handleUpload}
              />
            </div>
          </div>

          <div className="storage-summary">
            <div className="storage-summary-label">
              <strong>{text.workspaceStorage}</strong>
              <span>{formatSize(storageUsed)} of {text.totalStorage} {text.storageUsed} · {formatSize(storageRemaining)} {text.storageRemaining}</span>
            </div>
            <div
              className="storage-progress"
              role="progressbar"
              aria-label="Workspace storage used"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(storagePercent)}
            >
              <span style={{ width: `${storagePercent}%` }} />
            </div>
          </div>

          {visibleFiles.length > 0 ? (
            <div className="file-list" role="list">
              {visibleFiles.map((studyFile) => {
                const course = courses.find((item) => item.code === studyFile.courseCode)
                const extension = studyFile.file.name.includes('.')
                  ? studyFile.file.name.split('.').pop()?.slice(0, 4).toUpperCase() ?? 'FILE'
                  : 'FILE'
                return (
                  <article className="file-row" key={studyFile.id} role="listitem">
                    <span className="file-type" aria-hidden="true">{extension}</span>
                    <div className="file-name">
                      <a href={studyFile.url} target="_blank" rel="noreferrer">
                        {studyFile.file.name}
                      </a>
                      <span>{course?.title ?? 'No course selected'}</span>
                    </div>
                    <time className="file-date" dateTime={studyFile.uploadedAt.toISOString()}>
                      {studyFile.uploadedAt.toLocaleString()}
                    </time>
                    <span className="file-size">{formatSize(studyFile.file.size)}</span>
                    <button
                      className="remove-file-button"
                      type="button"
                      aria-label={`Remove ${studyFile.file.name}`}
                      onClick={() => handleRemoveFile(studyFile)}
                    >
                      ×
                    </button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <strong>{text.noFiles}</strong>
              <p>{text.addFilesHelp}</p>
            </div>
          )}
        </section>}

        {activeSection === 'profile' && (
          <section className="content-section profile-section" aria-labelledby="profile-title">
            <div className="section-heading">
              <div>
                <p className="section-kicker">{text.yourStory}</p>
                <h2 id="profile-title">{text.profile}</h2>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile.photo
                    ? <img src={profile.photo} alt={`${username}'s profile`} />
                    : <span aria-hidden="true">{username.charAt(0)}</span>}
                </div>
                <div className="profile-identity">
                  <h3>{username}</h3>
                  <p>{text.student}</p>
                  <div className="profile-photo-actions">
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => profilePhotoInputRef.current?.click()}
                    >
                      {profile.photo ? text.changePhoto : text.addPhoto}
                    </button>
                    {profile.photo && (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          updateProfile({ photo: '' })
                          setStatus('Profile photo removed.')
                        }}
                      >
                        {text.removePhoto}
                      </button>
                    )}
                    <input
                      ref={profilePhotoInputRef}
                      className="visually-hidden"
                      type="file"
                      accept="image/*"
                      aria-label="Choose a profile photo"
                      onChange={handleProfilePhotoChange}
                    />
                  </div>
                  <small className="profile-help">{text.imageHelp}</small>
                </div>
              </div>

              <label className="profile-bio-field">
                {text.bio}
                <textarea
                  value={profile.bio}
                  maxLength={300}
                  rows={4}
                  placeholder={text.tellAboutYourself}
                  onChange={(event) => updateProfile({ bio: event.target.value })}
                />
                <span>{profile.bio.length}/300 characters</span>
              </label>
            </div>
          </section>
        )}

        {activeSection === 'settings' && (
          <section className="settings-page" aria-labelledby="settings-title">
            <div className="settings-heading">
              <p className="section-kicker">{text.settingsKicker}</p>
              <h1 id="settings-title">{text.settings}</h1>
              <p>{text.settingsIntro}</p>
            </div>

            <div className="settings-layout">
              <nav className="settings-navigation" aria-label={text.settings}>
                <p className="settings-nav-caption">{text.account}</p>
                <button className={`settings-nav-item${settingsSection === 'account' ? ' active' : ''}`} type="button" onClick={() => setSettingsSection('account')}>
                  <span aria-hidden="true">♙</span>{text.account}
                </button>
                <button className={`settings-nav-item${settingsSection === 'appearance' ? ' active' : ''}`} type="button" onClick={() => setSettingsSection('appearance')}>
                  <span aria-hidden="true">◐</span>{text.appearance}
                </button>
                <button className={`settings-nav-item${settingsSection === 'accessibility' ? ' active' : ''}`} type="button" onClick={() => setSettingsSection('accessibility')}>
                  <span aria-hidden="true">♿</span>{text.accessibility}
                </button>
                <button className={`settings-nav-item${settingsSection === 'notifications' ? ' active' : ''}`} type="button" onClick={() => setSettingsSection('notifications')}>
                  <span aria-hidden="true">♧</span>{text.notifications}
                </button>
                <p className="settings-nav-caption">{text.study}</p>
                <button className={`settings-nav-item${settingsSection === 'study' ? ' active' : ''}`} type="button" onClick={() => setSettingsSection('study')}>
                  <span aria-hidden="true">✦</span>{text.assistant}
                </button>
                <p className="settings-nav-caption">{text.data}</p>
                <button className={`settings-nav-item${settingsSection === 'data' ? ' active' : ''}`} type="button" onClick={() => setSettingsSection('data')}>
                  <span aria-hidden="true">▣</span>{text.data}
                </button>
              </nav>

              <div className="settings-panel">
                {settingsSection === 'account' && (
                  <section className="settings-card" aria-labelledby="settings-account-title">
                    <header className="settings-card-heading">
                      <span className="settings-card-icon" aria-hidden="true">♙</span>
                      <div>
                        <h2 id="settings-account-title">{text.account}</h2>
                        <p>{text.localAccountHelp}</p>
                      </div>
                    </header>
                    <div className="settings-action-row">
                      <span>
                        <strong>{username}</strong>
                        <small>{text.localAccount}</small>
                      </span>
                      <a className="settings-action" href="#profile">{text.editProfile} <span aria-hidden="true">→</span></a>
                    </div>
                    <label className="settings-field">
                      <span>
                        <strong>{text.startPage}</strong>
                        <small>{text.startPageHelp}</small>
                      </span>
                      <SettingsSelect
                        label={text.startPage}
                        value={preferences.homePage}
                        options={[
                          { value: 'dashboard', label: text.overview },
                          { value: 'ask-axi', label: text.askAxi },
                        ]}
                        onChange={(value) => updatePreferences({ homePage: toHomePage(value) })}
                      />
                    </label>
                  </section>
                )}

                {settingsSection === 'appearance' && (
                  <section className="settings-card" aria-labelledby="settings-appearance-title">
                    <header className="settings-card-heading">
                      <span className="settings-card-icon" aria-hidden="true">◐</span>
                      <div>
                        <h2 id="settings-appearance-title">{text.appearance}</h2>
                        <p>{text.savedOnDevice}</p>
                      </div>
                    </header>
                    <label className="settings-field">
                      <span>
                        <strong>{text.language}</strong>
                        <small>{text.languageHelp}</small>
                      </span>
                      <SettingsSelect
                        label={text.language}
                        value={preferences.language}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'fr', label: 'Français' },
                          { value: 'ar', label: 'العربية' },
                        ]}
                        onChange={(value) => updatePreferences({
                          language: value === 'fr' || value === 'ar' ? value : 'en',
                        })}
                      />
                    </label>
                    <label className="settings-field">
                      <span>
                        <strong>{text.theme}</strong>
                        <small>{text.themeHelp}</small>
                      </span>
                      <SettingsSelect
                        label={text.theme}
                        value={preferences.theme}
                        options={[
                          { value: 'ember', label: text.emberTheme, swatch: '#fb7a24' },
                          { value: 'ocean', label: text.oceanTheme, swatch: '#38a6e8' },
                          { value: 'forest', label: text.forestTheme, swatch: '#57b77a' },
                          { value: 'light', label: text.lightTheme, swatch: '#7560d6' },
                        ]}
                        onChange={(value) => updatePreferences({
                          theme: value === 'ocean' || value === 'forest' || value === 'light' ? value : 'ember',
                        })}
                      />
                    </label>
                    <label className="settings-field">
                      <span>
                        <strong>{text.density}</strong>
                        <small>{text.densityHelp}</small>
                      </span>
                      <SettingsSelect
                        label={text.density}
                        value={preferences.density}
                        options={[
                          { value: 'comfortable', label: text.comfortable },
                          { value: 'compact', label: text.compact },
                        ]}
                        onChange={(value) => updatePreferences({
                          density: value === 'compact' ? 'compact' : 'comfortable',
                        })}
                      />
                    </label>
                  </section>
                )}

                {settingsSection === 'accessibility' && (
                  <section className="settings-card" aria-labelledby="settings-accessibility-title">
                    <header className="settings-card-heading">
                      <span className="settings-card-icon" aria-hidden="true">♿</span>
                      <div>
                        <h2 id="settings-accessibility-title">{text.accessibility}</h2>
                        <p>{text.reduceMotionHelp}</p>
                      </div>
                    </header>
                    <label className="settings-toggle-row">
                      <span><strong>{text.reduceMotion}</strong><small>{text.reduceMotionHelp}</small></span>
                      <input type="checkbox" checked={preferences.reduceMotion} onChange={(event) => updatePreferences({ reduceMotion: event.target.checked })} />
                    </label>
                  </section>
                )}

                {settingsSection === 'notifications' && (
                  <section className="settings-card" aria-labelledby="settings-notifications-title">
                    <header className="settings-card-heading">
                      <span className="settings-card-icon" aria-hidden="true">♧</span>
                      <div>
                        <h2 id="settings-notifications-title">{text.notifications}</h2>
                        <p>{text.inAppNotificationsHelp}</p>
                      </div>
                    </header>
                    <label className="settings-toggle-row">
                      <span><strong>{text.inAppNotifications}</strong><small>{text.inAppNotificationsHelp}</small></span>
                      <input type="checkbox" checked={preferences.showNotifications} onChange={(event) => updatePreferences({ showNotifications: event.target.checked })} />
                    </label>
                    <label className="settings-toggle-row">
                      <span><strong>{text.confirmCourseRemoval}</strong><small>{text.confirmCourseRemovalHelp}</small></span>
                      <input type="checkbox" checked={preferences.confirmCourseRemoval} onChange={(event) => updatePreferences({ confirmCourseRemoval: event.target.checked })} />
                    </label>
                  </section>
                )}

                {settingsSection === 'study' && (
                  <section className="settings-card" aria-labelledby="settings-study-title">
                    <header className="settings-card-heading">
                      <span className="settings-card-icon" aria-hidden="true">✦</span>
                      <div>
                        <h2 id="settings-study-title">{text.assistant}</h2>
                        <p>{text.defaultStyleHelp}</p>
                      </div>
                    </header>
                    <label className="settings-field">
                      <span><strong>{text.defaultStyle}</strong><small>{text.defaultStyleHelp}</small></span>
                      <SettingsSelect
                        label={text.defaultStyle}
                        value={preferences.defaultAnswerStyle}
                        options={[
                          { value: 'balanced', label: text.balanced },
                          { value: 'concise', label: text.concise },
                          { value: 'step-by-step', label: text.stepByStep },
                        ]}
                        onChange={(value) => {
                          const nextStyle = toAnswerStyle(value)
                          updatePreferences({ defaultAnswerStyle: nextStyle })
                          setAnswerStyle(nextStyle)
                        }}
                      />
                    </label>
                    <label className="settings-field">
                      <span><strong>{text.defaultCourse}</strong><small>{text.defaultCourseHelp}</small></span>
                      <SettingsSelect
                        label={text.defaultCourse}
                        value={preferences.defaultCourseCode}
                        options={[
                          { value: '', label: text.allCourses },
                          ...courses.map((course) => ({ value: course.code, label: `${course.code} · ${course.title}` })),
                        ]}
                        onChange={(value) => {
                          updatePreferences({ defaultCourseCode: value })
                          setAskCourseCode(value)
                          setAskFileId('')
                        }}
                      />
                    </label>
                  </section>
                )}

                {settingsSection === 'data' && (
                  <section className="settings-card" aria-labelledby="settings-data-title">
                    <header className="settings-card-heading">
                      <span className="settings-card-icon" aria-hidden="true">▣</span>
                      <div>
                        <h2 id="settings-data-title">{text.data}</h2>
                        <p>{text.localAccountHelp}</p>
                      </div>
                    </header>
                    <div className="settings-action-row">
                      <span><strong>{text.data}</strong><small>{formatSize(storageUsed)} used · {formatSize(storageRemaining)} available</small></span>
                      <button className="settings-action" type="button" onClick={() => setStorageReportOpen(true)}>View storage <span aria-hidden="true">→</span></button>
                    </div>
                    <div className="settings-action-row">
                      <span><strong>{text.resetSettings}</strong><small>{text.resetSettingsHelp}</small></span>
                      <button
                        className="settings-action"
                        type="button"
                        onClick={() => {
                          if (!window.confirm(`${text.resetSettings}?`)) return
                          setPreferences(defaultPreferences)
                          setAnswerStyle(defaultPreferences.defaultAnswerStyle)
                          setAskCourseCode(defaultPreferences.defaultCourseCode)
                          setAskFileId('')
                          try {
                            window.localStorage.setItem('memex-settings', JSON.stringify(defaultPreferences))
                            setStatus('Settings restored to defaults.')
                          } catch {
                            setStatus('Settings were reset, but could not be saved in this browser.')
                          }
                        }}
                      >
                        {text.reset}
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </section>
        )}

        {preferences.showNotifications && <p className="status-message" aria-live="polite">{status}</p>}
        {chatSettingsOpen && (
          <ChatSettingsModal
            open={chatSettingsOpen}
            settings={chatSettings}
            onClose={() => setChatSettingsOpen(false)}
            onSave={(nextSettings) => {
              setChatSettings(nextSettings)
              return true
            }}
          />
        )}
        <footer className="page-footer">Memex <span>·</span> {text.footer}</footer>
      </main>
    </div>
  )
}

export default App

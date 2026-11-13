import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import memexLogo from './assets/Memex.png'
import moonIcon from './assets/moon.png'
import notificationIcon from './assets/notification-bell.png'
import uploadIcon from './assets/upload.png'
import graduationCapIcon from './assets/graduation-cap.png'
import profileIcon from './assets/profile.png'
import {
  deleteCourseAndUnassignFiles,
  deleteFile as deleteStoredFile,
  loadWorkspace,
  saveCourse,
  saveFiles,
} from './workspaceStorage'
import type { StoredFile } from './workspaceStorage'
import ChatSettingsModal, { type ChatSettings } from './components/ChatSettingsModal'
import type { ChatSession } from './components/ChatSidebarWithHistory'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Files from './pages/Files'
import ProfilePage from './pages/Profile'
import Settings from './pages/Settings'
import AskAxi from './pages/AskAxi'
import Feed from './pages/Feed'
import { interfaceText } from './i18n'
import type {
  AnswerStyle,
  AppPreferences,
  Course,
  CourseForm,
  HomePage,
  PageName,
  Profile,
  SettingsSection,
  StudyFile,
} from './types'
import { formatSize } from './utils/format'
import { getAskGreeting, getGreeting } from './utils/greetings'
import { readSavedChatSessions } from './storage/chatHistory'
import { defaultPreferences, readSavedPreferences } from './storage/preferences'
import { readSavedProfile } from './storage/profile'

const emptyCourseForm: CourseForm = { code: '', title: '', instructor: '' }
const courseColors: Course['color'][] = ['blue', 'purple', 'green']
const username = 'Younes'
const storageLimit = 1 * 1024 ** 3

function toAnswerStyle(value: string): AnswerStyle {
  return value === 'concise' || value === 'step-by-step' ? value : 'balanced'
}

function getPageFromHash(defaultPage: HomePage = 'dashboard'): PageName {
  const page = window.location.hash.slice(1)
  return page === 'feed' || page === 'repository-create' || page === 'repository-files'
    || page === 'courses' || page === 'files' || page === 'profile' || page === 'ask-axi' || page === 'settings'
    ? page
    : defaultPage
}

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [files, setFiles] = useState<StudyFile[]>([])
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false)
  const [workspaceLoadError, setWorkspaceLoadError] = useState(false)
  const [workspaceLoadAttempt, setWorkspaceLoadAttempt] = useState(0)
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
    setWorkspaceLoaded(false)
    setWorkspaceLoadError(false)
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
        setWorkspaceLoadError(true)
        setStatus(`Saved courses and files could not be loaded: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
        setWorkspaceLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [workspaceLoadAttempt])

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

  function resetSettings() {
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
      setStatus(`Not enough storage. You have ${formatSize(storageRemaining)} remaining out of 1 GB.`)
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
      setStatus(`${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'} saved. ${formatSize(storageLimit - storageUsed - batchSize)} of 1 GB remaining.`)
    } catch (error) {
      setStatus(`Files could not be saved: ${error instanceof Error ? error.message : 'Unknown storage error.'}`)
    } finally {
      pendingUploadBytes.current -= batchSize
      input.value = ''
    }
  }

  function openCourseCreation() {
    setCourseFormOpen(true)
    window.location.hash = 'courses'
  }

  function openFilePicker() {
    if (!workspaceLoaded || workspaceLoadError || storageRemaining === 0) return
    setSelectedCourseCode(null)
    fileInputRef.current?.click()
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
      data-page={activeSection}
      lang={preferences.language}
      dir={preferences.language === 'ar' ? 'rtl' : 'ltr'}
    >
      <aside className="sidebar" aria-label={text.menu}>
        <a className="brand" href="#dashboard" aria-label="Memex - Home">
          <span className="brand-mark" aria-hidden="true">
            <img src={memexLogo} alt="" />
          </span>
          <span>
            <small className="brand-tagline">Learn • Organize • Achieve</small>
          </span>
        </a>

        <p className="nav-caption">{text.menu}</p>
        <nav className="main-nav">
          <a
            className={`nav-item${activeSection === 'dashboard' ? ' active' : ''}`}
            href="#dashboard"
            aria-current={activeSection === 'dashboard' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z" />
              </svg>
            </span>
            {text.overview}
          </a>
          <a
            className={`nav-item${activeSection === 'feed' || activeSection === 'repository-create' || activeSection === 'repository-files' ? ' active' : ''}`}
            href="#feed"
            aria-current={activeSection === 'feed' || activeSection === 'repository-create' || activeSection === 'repository-files' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 19h.01M5 12a7 7 0 0 1 7 7M5 5a14 14 0 0 1 14 14" />
              </svg>
            </span>
            Feed
          </a>
          <a
            className={`nav-item${activeSection === 'profile' ? ' active' : ''}`}
            href="#profile"
            aria-current={activeSection === 'profile' ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              <img src={profileIcon} alt="" />
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
          <span
            className="sidebar-note-icon"
            role="img"
            aria-label="Study journey"
            style={{ maskImage: `url("${graduationCapIcon}")` }}
          />
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
            <span className="sidebar-profile-chevron" aria-hidden="true">⌄</span>
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
          <div className="topbar-heading">
            <p>
              {activeSection === 'courses'
                ? text.courses
                : activeSection === 'files'
                  ? text.files
                  : activeSection === 'profile'
                    ? text.profile
                    : activeSection === 'feed'
                      ? 'Feed'
                      : activeSection === 'repository-create'
                        ? text.createRepository
                        : activeSection === 'repository-files'
                          ? text.addFilesToRepository
                      : activeSection === 'ask-axi'
                        ? text.askAxi
                        : activeSection === 'settings'
                          ? text.settings
                          : text.overview}
            </p>
            <div className="topbar-icons">
              <button className="icon-button" type="button" aria-label={text.notifications}>
                <img className="topbar-icon-image" src={notificationIcon} alt="" />
              </button>
              <button
                className="icon-button"
                type="button"
                aria-label={text.theme}
                aria-pressed={preferences.theme === 'dark'}
                onClick={() => updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}
              >
                {preferences.theme === 'dark' ? (
                  <img className="topbar-icon-image" src={moonIcon} alt="" />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            multiple
            aria-label={text.chooseFiles}
            disabled={!workspaceLoaded || workspaceLoadError || storageRemaining === 0}
            onChange={handleUpload}
          />
        </header>
        {activeSection === 'dashboard' && (
          <div className="topbar-secondary-row has-welcome">
            <section className="topbar-welcome" aria-labelledby="welcome-title" dir={preferences.language === 'ar' ? 'rtl' : 'ltr'}>
              <h1 id="welcome-title">{getGreeting(now, preferences.language)}</h1>
              <p className="welcome-copy">{text.buildSpace}</p>
            </section>
            <div className="topbar-actions">
              <button
                className="primary-button topbar-button"
                type="button"
                onClick={openCourseCreation}
              >
                <span aria-hidden="true">+</span> {text.addCourse}
              </button>
              <button
                className="secondary-button topbar-button"
                type="button"
                disabled={!workspaceLoaded || workspaceLoadError || storageRemaining === 0}
                onClick={openFilePicker}
              >
                <img className="topbar-action-image" src={uploadIcon} alt="" />
                {text.uploadFiles}
              </button>
            </div>
          </div>
        )}

        {activeSection === 'dashboard' && (
          <Dashboard
            text={text}
            language={preferences.language}
            courses={courses}
            files={files}
            storageUsed={formatSize(storageUsed)}
            storagePercent={storagePercent}
            workspaceLoaded={workspaceLoaded}
            workspaceLoadError={workspaceLoadError}
            canUploadFiles={workspaceLoaded && !workspaceLoadError && storageRemaining > 0}
            onAddCourse={openCourseCreation}
            onUploadFiles={openFilePicker}
            onSelectCourse={(courseCode) => {
              setSelectedCourseCode(courseCode)
              window.location.hash = 'files'
            }}
            onRetryLoad={() => setWorkspaceLoadAttempt((attempt) => attempt + 1)}
          />
        )}

        {activeSection === 'ask-axi' && (
          <AskAxi
            text={text}
            courses={courses}
            files={files}
            chatSessions={chatSessions}
            activeChatId={activeChatId}
            now={now}
            heading={activeChat?.title ?? getAskGreeting(now, courses, files, askCourseSelection, preferences.language)}
            askCourseSelection={askCourseSelection}
            answerStyle={answerStyle}
            askFileId={askFileId}
            askPrompt={askPrompt}
            chatAttachments={chatAttachments}
            chatAttachmentError={chatAttachmentError}
            chatImageInputRef={chatImageInputRef}
            chatFileInputRef={chatFileInputRef}
            onStartNewChat={startNewChat}
            onSelectChat={(session) => {
              setActiveChatId(session.id)
              setAskPrompt('')
              setChatAttachments([])
              setChatAttachmentError('')
            }}
            onDeleteChat={deleteChat}
            onRenameChat={renameChat}
            onOpenChatSettings={() => setChatSettingsOpen(true)}
            onPromptChange={setAskPrompt}
            onRemoveAttachment={(id) => setChatAttachments((current) => current.filter((attachment) => attachment.id !== id))}
            onAnswerStyleChange={(value) => setAnswerStyle(toAnswerStyle(value))}
            onCourseChange={(value) => {
              setAskCourseCode(value)
              if (askFileId && files.find((file) => file.id === askFileId)?.courseCode !== value) {
                setAskFileId('')
              }
            }}
            onFileChange={(value) => {
              setAskFileId(value)
              const selectedFile = files.find((file) => file.id === value)
              if (selectedFile?.courseCode) setAskCourseCode(selectedFile.courseCode)
            }}
            onAttachmentChange={handleChatAttachmentChange}
          />
        )}

        {(activeSection === 'feed' || activeSection === 'repository-create' || activeSection === 'repository-files') && (
          <Feed
            requestedAction={activeSection === 'repository-create' ? 'create-repository' : activeSection === 'repository-files' ? 'add-files' : null}
            onActionHandled={() => { window.location.hash = 'feed' }}
          />
        )}

                {activeSection === 'courses' && (
          <Courses
            text={text}
            courses={courses}
            files={files}
            selectedCourseCode={selectedCourseCode}
            workspaceLoaded={workspaceLoaded}
            workspaceLoadError={workspaceLoadError}
            courseFormOpen={courseFormOpen}
            courseForm={courseForm}
            onToggleForm={() => setCourseFormOpen((open) => !open)}
            onCourseFormChange={(field, value) => setCourseForm({ ...courseForm, [field]: value })}
            onSubmit={handleAddCourse}
            onSelectCourse={(courseCode) => {
              setSelectedCourseCode(courseCode)
              window.location.hash = 'files'
            }}
            onRemoveCourse={handleRemoveCourse}
            onRetryLoad={() => setWorkspaceLoadAttempt((attempt) => attempt + 1)}
          />
        )}

        {activeSection === 'files' && (
          <Files
            text={text}
            selectedCourseCode={selectedCourseCode}
            workspaceLoaded={workspaceLoaded}
            workspaceLoadError={workspaceLoadError}
            storageRemaining={storageRemaining}
            storageRemainingLabel={formatSize(storageRemaining)}
            storageUsedLabel={formatSize(storageUsed)}
            storagePercent={storagePercent}
            courses={courses}
            visibleFiles={visibleFiles}
            onShowAll={() => setSelectedCourseCode(null)}
            onChooseFiles={() => fileInputRef.current?.click()}
            onRemoveFile={handleRemoveFile}
            onRetryLoad={() => setWorkspaceLoadAttempt((attempt) => attempt + 1)}
          />
        )}

        {activeSection === 'profile' && (
          <ProfilePage
            text={text}
            username={username}
            profile={profile}
            profilePhotoInputRef={profilePhotoInputRef}
            onPhotoChange={handleProfilePhotoChange}
            onUpdateProfile={updateProfile}
            onRemovePhoto={() => {
              updateProfile({ photo: '' })
              setStatus('Profile photo removed.')
            }}
          />
        )}

        {activeSection === 'settings' && (
          <Settings
            text={text}
            username={username}
            preferences={preferences}
            settingsSection={settingsSection}
            courses={courses}
            storageUsed={formatSize(storageUsed)}
            storageRemaining={formatSize(storageRemaining)}
            onSectionChange={setSettingsSection}
            onPreferencesChange={updatePreferences}
            onAnswerStyleChange={(value) => {
              const nextStyle = toAnswerStyle(value)
              updatePreferences({ defaultAnswerStyle: nextStyle })
              setAnswerStyle(nextStyle)
            }}
            onDefaultCourseChange={(value) => {
              updatePreferences({ defaultCourseCode: value })
              setAskCourseCode(value)
              setAskFileId('')
            }}
            onOpenStorageReport={() => setStorageReportOpen(true)}
            onResetSettings={resetSettings}
          />
        )}

        {preferences.showNotifications && <p className="status-message" role="status" aria-live="polite">{status}</p>}
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

/* Renders workspace preferences, settings navigation, and settings controls. */
import type { interfaceText } from '../i18n'
import type { AppPreferences, Course, SettingsSection } from '../types'
import SettingsSelect from '../components/SettingsSelect'

type SettingsProps = {
  text: typeof interfaceText.en
  username: string
  preferences: AppPreferences
  settingsSection: SettingsSection
  courses: Course[]
  storageUsed: string
  storageRemaining: string
  onSectionChange: (section: SettingsSection) => void
  onPreferencesChange: (changes: Partial<AppPreferences>) => void
  onAnswerStyleChange: (style: string) => void
  onDefaultCourseChange: (courseCode: string) => void
  onOpenStorageReport: () => void
  onResetSettings: () => void
}

export default function Settings({
  text,
  username,
  preferences,
  settingsSection,
  courses,
  storageUsed,
  storageRemaining,
  onSectionChange,
  onPreferencesChange,
  onAnswerStyleChange,
  onDefaultCourseChange,
  onOpenStorageReport,
  onResetSettings,
}: SettingsProps) {
  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <div className="settings-heading">
        <p className="section-kicker">{text.settingsKicker}</p>
        <h1 id="settings-title">{text.settings}</h1>
        <p>{text.settingsIntro}</p>
      </div>

      <div className="settings-layout">
        <nav className="settings-navigation" aria-label={text.settings}>
          <p className="settings-nav-caption">{text.account}</p>
          <button className={`settings-nav-item${settingsSection === 'account' ? ' active' : ''}`} type="button" onClick={() => onSectionChange('account')}>
            <span aria-hidden="true">♙</span>{text.account}
          </button>
          <button className={`settings-nav-item${settingsSection === 'appearance' ? ' active' : ''}`} type="button" onClick={() => onSectionChange('appearance')}>
            <span aria-hidden="true">◐</span>{text.appearance}
          </button>
          <button className={`settings-nav-item${settingsSection === 'accessibility' ? ' active' : ''}`} type="button" onClick={() => onSectionChange('accessibility')}>
            <span aria-hidden="true">♿</span>{text.accessibility}
          </button>
          <button className={`settings-nav-item${settingsSection === 'notifications' ? ' active' : ''}`} type="button" onClick={() => onSectionChange('notifications')}>
            <span aria-hidden="true">♧</span>{text.notifications}
          </button>
          <p className="settings-nav-caption">{text.study}</p>
          <button className={`settings-nav-item${settingsSection === 'study' ? ' active' : ''}`} type="button" onClick={() => onSectionChange('study')}>
            <span aria-hidden="true">✦</span>{text.assistant}
          </button>
          <p className="settings-nav-caption">{text.data}</p>
          <button className={`settings-nav-item${settingsSection === 'data' ? ' active' : ''}`} type="button" onClick={() => onSectionChange('data')}>
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
                  onChange={(value) => onPreferencesChange({ homePage: value === 'ask-axi' ? value : 'dashboard' })}
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
                  onChange={(value) => onPreferencesChange({
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
                  onChange={(value) => onPreferencesChange({
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
                  onChange={(value) => onPreferencesChange({
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
                <input type="checkbox" checked={preferences.reduceMotion} onChange={(event) => onPreferencesChange({ reduceMotion: event.target.checked })} />
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
                <input type="checkbox" checked={preferences.showNotifications} onChange={(event) => onPreferencesChange({ showNotifications: event.target.checked })} />
              </label>
              <label className="settings-toggle-row">
                <span><strong>{text.confirmCourseRemoval}</strong><small>{text.confirmCourseRemovalHelp}</small></span>
                <input type="checkbox" checked={preferences.confirmCourseRemoval} onChange={(event) => onPreferencesChange({ confirmCourseRemoval: event.target.checked })} />
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
                  onChange={onAnswerStyleChange}
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
                  onChange={onDefaultCourseChange}
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
                <span><strong>{text.data}</strong><small>{storageUsed} used · {storageRemaining} available</small></span>
                <button className="settings-action" type="button" onClick={onOpenStorageReport}>View storage <span aria-hidden="true">→</span></button>
              </div>
              <div className="settings-action-row">
                <span><strong>{text.resetSettings}</strong><small>{text.resetSettingsHelp}</small></span>
                <button className="settings-action" type="button" onClick={onResetSettings}>
                  {text.reset}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}

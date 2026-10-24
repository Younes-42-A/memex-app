/* Renders the dashboard welcome section, workspace statistics, and shortcuts. */
import type { Language } from '../i18n'
import type { interfaceText } from '../i18n'

type DashboardProps = {
  text: typeof interfaceText.en
  language: Language
  now: Date
  greeting: string
  username: string
  courses: number
  files: number
  visibleFiles: number
  selectedCourseCode: string | null
  storageUsed: string
  storageRemaining: string
  storagePercent: number
}

export default function Dashboard({
  text,
  language,
  now,
  greeting,
  username,
  courses,
  files,
  visibleFiles,
  selectedCourseCode,
  storageUsed,
  storageRemaining,
  storagePercent,
}: DashboardProps) {
  return (
    <>
      <section className="welcome-section" aria-labelledby="welcome-title">
        <div>
          <p className="eyebrow">{now.toLocaleDateString(language, { dateStyle: 'full' })}</p>
          <h1 id="welcome-title">{greeting}, {username} <span aria-hidden="true">✦</span></h1>
          <p className="welcome-copy">{text.buildSpace}</p>
        </div>
      </section>

      <section className="stats-grid" aria-label={text.summary}>
        <a className="stat-card stat-card-link" href="#courses" aria-label={`${text.courses}: ${courses}`}>
          <span className="stat-icon icon-blue" aria-hidden="true">▦</span>
          <div>
            <p>{text.courses}</p>
            <strong>{courses}</strong>
            <small>{text.courseCount}</small>
          </div>
        </a>
        <a className="stat-card stat-card-link" href="#files" aria-label={`${text.studyFiles}: ${visibleFiles}`}>
          <span className="stat-icon icon-orange" aria-hidden="true">▤</span>
          <div>
            <p>{text.studyFiles}</p>
            <strong>{visibleFiles}</strong>
            <small>{selectedCourseCode ? text.filesInSelectedCourse : text.filesAdded}</small>
          </div>
        </a>
        <article className="stat-card">
          <span className="stat-icon icon-green" aria-hidden="true">▣</span>
          <div className="storage-stat-content">
            <p>{text.storage}</p>
            <strong>{storageUsed}</strong>
            <small>{storageRemaining} available of 5 GB</small>
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
            <small>{courses} {courses === 1 ? 'course' : 'courses'} in your workspace</small>
          </span>
          <span className="shortcut-arrow" aria-hidden="true">→</span>
        </a>
        <a className="shortcut-card" href="#files">
          <span className="shortcut-icon" aria-hidden="true">▤</span>
          <span>
            <strong>{text.manageFiles}</strong>
            <small>{files} {files === 1 ? 'file' : 'files'} in your workspace</small>
          </span>
          <span className="shortcut-arrow" aria-hidden="true">→</span>
        </a>
      </section>
    </>
  )
}

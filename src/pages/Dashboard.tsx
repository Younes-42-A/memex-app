/* Dashboard page: welcome, statistics, two summary panels, and the AXI assistant card. */
import type { interfaceText } from '../i18n'

type DashboardProps = {
  text: typeof interfaceText.en
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
  courses,
  files,
  visibleFiles,
  selectedCourseCode,
  storageUsed,
  storagePercent,
}: DashboardProps) {
  return (
    <>
      <section className="stats-grid" aria-label={text.summary}>
        <a className="stat-card stat-card-link" href="#courses" aria-label={`${text.courses}: ${courses}`}>
          <span className="stat-icon icon-orange" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M5 8h9a3 3 0 0 1 3 3v17a3 3 0 0 0-3-3H5V8Zm22 0h-9a3 3 0 0 0-3 3v17a3 3 0 0 1 3-3h9V8Z" />
              <path d="M8 12v10m4-10v10m12-10v10m-4-10v10" />
            </svg>
          </span>
          <div>
            <p>{text.courses}</p>
            <strong>{courses}</strong>
            <small>{text.courseCount}</small>
          </div>
        </a>
        <a className="stat-card stat-card-link" href="#files" aria-label={`${text.studyFiles}: ${visibleFiles}`}>
          <span className="stat-icon icon-purple" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M8 4h11l7 7v17H8V4Z" />
              <path d="M19 4v8h7M12 17h10m-10 5h10" />
            </svg>
          </span>
          <div>
            <p>{text.studyFiles}</p>
            <strong>{visibleFiles}</strong>
            <small>{selectedCourseCode ? text.filesInSelectedCourse : text.filesAdded}</small>
          </div>
        </a>
        <article className="stat-card">
          <span className="stat-icon icon-green" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <ellipse cx="16" cy="7" rx="10" ry="4" />
              <path d="M6 7v6c0 2 4.5 4 10 4s10-2 10-4V7m-20 6v6c0 2 4.5 4 10 4s10-2 10-4v-6m-20 6v6c0 2 4.5 4 10 4s10-2 10-4v-6" />
            </svg>
          </span>
          <div className="storage-stat-content">
            <p>{text.storage}</p>
            <div className="storage-value">
              <strong>{storageUsed}</strong>
              <small>/ 5 GB</small>
            </div>
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
            <span className="storage-percent">{Math.round(storagePercent)}%</span>
          </div>
        </article>
      </section>

      <section className="dashboard-panels" aria-label={text.workspacePages}>
        <article className="panel">
          <header className="panel-heading">
            <div className="panel-title">
              <span className="panel-icon icon-orange" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M3 5h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H3V5Zm18 0h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7V5Z" />
                </svg>
              </span>
              <h2>My courses</h2>
            </div>
            <a href="#courses">View all →</a>
          </header>
          {courses > 0 && <p className="panel-count">{courses} {courses === 1 ? 'course' : 'courses'}</p>}
          {courses === 0 && (
            <div className="panel-empty">
              <span className="panel-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <path d="m5 23 27-12 27 12-27 13L5 23Z" />
                  <path d="M14 28v13c10 7 26 7 36 0V28M59 23v15" />
                  <circle cx="59" cy="42" r="2" />
                  <path className="empty-icon-accent" d="m57 22 5-4m-4 11h6m-7 5 5 4" />
                </svg>
              </span>
              <strong>No courses yet</strong>
              <p>Add your first course to organize your studies.</p>
              <a className="primary-button" href="#courses">+ Add course</a>
            </div>
          )}
        </article>

        <article className="panel">
          <header className="panel-heading">
            <div className="panel-title">
              <span className="panel-icon icon-purple" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6 3h8l5 5v13H6V3Z" />
                  <path d="M14 3v6h5M9 13h7m-7 4h7" />
                </svg>
              </span>
              <h2>Recent files</h2>
            </div>
            <a href="#files">View all →</a>
          </header>
          {files > 0 && <p className="panel-count">{files} {files === 1 ? 'file' : 'files'}</p>}
          {files === 0 && (
            <div className="panel-empty">
              <span className="panel-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <path d="M15 7h23l12 12v25a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4Z" />
                  <path d="M38 7v12h12M19 27h17M19 34h15M19 41h10" />
                  <circle cx="45" cy="45" r="11" />
                  <path d="M45 39v7l5 3" />
                  <path className="empty-icon-accent" d="m57 27 4-3m-3 9h5m-6 6 4 3" />
                </svg>
              </span>
              <strong>No recent files yet</strong>
              <p>Upload your first study file for quick access.</p>
              <a className="primary-button" href="#files">Upload files</a>
            </div>
          )}
        </article>
      </section>

      <section className="axi-card" aria-labelledby="axi-title">
        <div className="axi-info">
          <span className="axi-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 8.5h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3Z" />
              <path d="M12 5v3.5M9 13h.01M15 13h.01M9 16h6" />
              <circle cx="12" cy="4" r="1" />
            </svg>
          </span>
          <div>
            <h2 id="axi-title">AXI</h2>
            <p>Your study assistant for questions and explanations.</p>
          </div>
        </div>
        <a className="primary-button" href="#ask-axi">
          <svg className="axi-button-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.9L4 20l3.8-.9A8.5 8.5 0 1 0 12 3.5Z" />
            <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
          </svg>
          Ask AXI →
        </a>
      </section>
    </>
  )
}

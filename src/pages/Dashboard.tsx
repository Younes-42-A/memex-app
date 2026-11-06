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
  storageRemaining,
  storagePercent,
}: DashboardProps) {
  return (
    <>
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

      <section className="dashboard-panels" aria-label={text.workspacePages}>
        <article className="panel">
          <header className="panel-heading">
            <h2>My courses</h2>
            <a href="#courses">View all →</a>
          </header>
          <p className="panel-count">{courses} {courses === 1 ? 'course' : 'courses'}</p>
          {courses === 0 && (
            <div className="panel-empty">
              <strong>No courses yet</strong>
              <p>Add your first course to organize your studies.</p>
              <a className="primary-button" href="#courses">+ Add course</a>
            </div>
          )}
        </article>

        <article className="panel">
          <header className="panel-heading">
            <h2>Recent files</h2>
            <a href="#files">View all →</a>
          </header>
          <p className="panel-count">{files} {files === 1 ? 'file' : 'files'}</p>
          {files === 0 && (
            <div className="panel-empty">
              <strong>No recent files yet</strong>
              <p>Upload your first study file for quick access.</p>
              <a className="primary-button" href="#files">Upload files</a>
            </div>
          )}
        </article>
      </section>

      <section className="axi-card" aria-labelledby="axi-title">
        <div className="axi-info">
          <span className="axi-icon" aria-hidden="true">✦</span>
          <div>
            <h2 id="axi-title">AXI</h2>
            <p>Your study assistant for questions and explanations.</p>
          </div>
        </div>
        <a className="primary-button" href="#ask-axi">Ask AXI →</a>
      </section>
    </>
  )
}

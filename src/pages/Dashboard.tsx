/* Dashboard page: welcome, statistics, two summary panels, and the AXI assistant card. */
import courseBookIcon from '../assets/course-book.png'
import courseCardIcon from '../assets/course-card-book.png'
import graduationCapIcon from '../assets/graduation-cap.png'
import recentCardIcon from '../assets/recent-card-file.png'
import recentFileClockIcon from '../assets/recent-file-clock.png'
import storageIcon from '../assets/storage-database.png'
import studyDocumentIcon from '../assets/study-document.png'
import axiRobotIcon from '../assets/axi-robot.png'
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
            <img src={courseBookIcon} alt="" />
          </span>
          <div>
            <p>{text.courses}</p>
            <strong>{courses}</strong>
            <small>{text.courseCount}</small>
          </div>
        </a>
        <a className="stat-card stat-card-link" href="#files" aria-label={`${text.studyFiles}: ${visibleFiles}`}>
          <span className="stat-icon icon-purple" aria-hidden="true">
            <img src={studyDocumentIcon} alt="" />
          </span>
          <div>
            <p>{text.studyFiles}</p>
            <strong>{visibleFiles}</strong>
            <small>{selectedCourseCode ? text.filesInSelectedCourse : text.filesAdded}</small>
          </div>
        </a>
        <article className="stat-card">
          <span className="stat-icon icon-green" aria-hidden="true">
            <img src={storageIcon} alt="" />
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
              <span className="panel-icon" aria-hidden="true">
                <img src={courseCardIcon} alt="" />
              </span>
              <h2>My courses</h2>
            </div>
            <a href="#courses">View all →</a>
          </header>
          {courses > 0 && <p className="panel-count">{courses} {courses === 1 ? 'course' : 'courses'}</p>}
          {courses === 0 && (
            <div className="panel-empty">
              <span className="panel-empty-icon" aria-hidden="true">
                <img src={graduationCapIcon} alt="" />
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
              <span className="panel-icon" aria-hidden="true">
                <img src={recentCardIcon} alt="" />
              </span>
              <h2>Recent files</h2>
            </div>
            <a href="#files">View all →</a>
          </header>
          {files > 0 && <p className="panel-count">{files} {files === 1 ? 'file' : 'files'}</p>}
          {files === 0 && (
            <div className="panel-empty">
              <span className="panel-empty-icon" aria-hidden="true">
                <img src={recentFileClockIcon} alt="" />
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
            <img src={axiRobotIcon} alt="" />
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

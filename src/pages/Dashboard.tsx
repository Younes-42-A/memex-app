/* Overview of saved courses, recent files, storage, and the AXI study workspace. */
import courseBookIcon from '/src/assets/course-book.png'
import courseCardIcon from '/src/assets/course-book.png'
import recentCardFileIcon from '/src/assets/recent-files.png'
import graduationCapIcon from '../assets/graduation-cap.png'
import recentFileClockIcon from '../assets/recent-files.png'
import storageIcon from '../assets/storage-database.png'
import axiRobotIcon from '../assets/axi-robot.png'
import type { interfaceText } from '../i18n'
import type { Course, StudyFile } from '../types'

type DashboardProps = {
  text: typeof interfaceText.en
  language: 'en' | 'fr' | 'ar'
  courses: Course[]
  files: StudyFile[]
  storageUsed: string
  storagePercent: number
  workspaceLoaded: boolean
  workspaceLoadError: boolean
  canUploadFiles: boolean
  onAddCourse: () => void
  onUploadFiles: () => void
  onSelectCourse: (courseCode: string) => void
  onRetryLoad: () => void
}

export default function Dashboard({
  text,
  language,
  courses,
  files,
  storageUsed,
  storagePercent,
  workspaceLoaded,
  workspaceLoadError,
  canUploadFiles,
  onAddCourse,
  onUploadFiles,
  onSelectCourse,
  onRetryLoad,
}: DashboardProps) {
  const recentFiles = [...files]
    .sort((left, right) => right.uploadedAt.getTime() - left.uploadedAt.getTime())
    .slice(0, 3)
  const dateFormatter = new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' })

  function getFileType(name: string) {
    const extension = name.includes('.') ? name.split('.').pop() : undefined
    return extension ? extension.slice(0, 4).toUpperCase() : 'FILE'
  }

  return (
    <>
      <section className="stats-grid" aria-label={text.summary} aria-busy={!workspaceLoaded}>
        <a
          className="stat-card stat-card-link"
          href="#courses"
          aria-label={`${text.courses}: ${workspaceLoaded && !workspaceLoadError ? courses.length : '—'}`}
        >
          <span className="stat-icon icon-orange" aria-hidden="true">
            <img src={courseBookIcon} alt="" />
          </span>
          <div>
            <p>{text.courses}</p>
            <strong>{workspaceLoaded && !workspaceLoadError ? courses.length : '—'}</strong>
          </div>
        </a>
        <a
          className="stat-card stat-card-link"
          href="#files"
          aria-label={`${text.studyFiles}: ${workspaceLoaded && !workspaceLoadError ? files.length : '—'}`}
        >
          <span className="stat-icon icon-purple" aria-hidden="true">
            <svg viewBox="0 0 21 20" focusable="false">
              <use href="/icons.svg#documentation-icon" />
            </svg>
          </span>
          <div>
            <p>{text.studyFiles}</p>
            <strong>{workspaceLoaded && !workspaceLoadError ? files.length : '—'}</strong>
          </div>
        </a>
        <article className="stat-card">
          <span className="stat-icon icon-green" aria-hidden="true">
            <img src={storageIcon} alt="" />
          </span>
          <div className="storage-stat-content">
            <p>{text.storage}</p>
            <div className="storage-value">
              <strong>{workspaceLoaded && !workspaceLoadError ? storageUsed : '—'}</strong>
              <small>/ 1 GB</small>
            </div>
            <div
              className="storage-progress"
              role="progressbar"
              aria-label={text.storage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={workspaceLoaded && !workspaceLoadError ? Math.round(storagePercent) : 0}
              aria-valuetext={workspaceLoaded && !workspaceLoadError ? `${Math.round(storagePercent)}%` : text.loading}
            >
              <span style={{ width: `${workspaceLoaded && !workspaceLoadError ? storagePercent : 0}%` }} />
            </div>
            <span className="storage-percent">
              {workspaceLoaded && !workspaceLoadError ? `${Math.round(storagePercent)}%` : '—'}
            </span>
          </div>
        </article>
      </section>

      <section className="dashboard-panels" aria-label={text.workspacePages}>
        <article className="panel dashboard-panel" aria-labelledby="dashboard-courses-title" aria-busy={!workspaceLoaded}>
          <header className="panel-heading">
            <div className="panel-title">
              <span className="panel-icon" aria-hidden="true">
                <img src={courseCardIcon} alt="" />
              </span>
              <h2 id="dashboard-courses-title">{text.courses}</h2>
            </div>
            <a href="#courses">{text.viewAll} <span aria-hidden="true">→</span></a>
          </header>

          {!workspaceLoaded ? (
            <p className="dashboard-panel-message" role="status">{text.loading}</p>
          ) : workspaceLoadError ? (
            <div className="dashboard-panel-message dashboard-panel-error" role="alert">
              <p>{text.workspaceLoadError}</p>
              <button className="text-button" type="button" onClick={onRetryLoad}>{text.retry}</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="panel-empty dashboard-empty">
              <span className="panel-empty-icon" aria-hidden="true">
                <img src={graduationCapIcon} alt="" />
              </span>
              <strong>{text.noCourses}</strong>
              <p>{text.addFirstCourseHelp}</p>
              <button className="primary-button" type="button" onClick={onAddCourse}>{text.addCourse}</button>
            </div>
          ) : (
            <div className="dashboard-course-list" aria-label={text.courses}>
              {courses.slice(0, 3).map((course) => {
                const fileCount = files.filter((file) => file.courseCode === course.code).length
                return (
                  <button
                    className="dashboard-course-item"
                    key={course.code}
                    type="button"
                    onClick={() => onSelectCourse(course.code)}
                    aria-label={`${text.openCourseFiles} ${course.title}`}
                  >
                    <span className={`dashboard-course-mark ${course.color}`} aria-hidden="true">
                      {course.code.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="dashboard-course-copy">
                      <strong>{course.title}</strong>
                      <small>{course.code}{course.instructor ? ` · ${course.instructor}` : ''}</small>
                    </span>
                    <span className="dashboard-course-files">
                      {fileCount} {fileCount === 1 ? text.studyFile : text.studyFiles}
                    </span>
                    <span className="dashboard-course-arrow" aria-hidden="true">→</span>
                  </button>
                )
              })}
            </div>
          )}
        </article>

        <article className="panel dashboard-panel" aria-labelledby="dashboard-files-title" aria-busy={!workspaceLoaded}>
          <header className="panel-heading">
            <div className="panel-title">
              <span className="panel-icon" aria-hidden="true">
                <img src={recentCardFileIcon} alt="" />
              </span>
              <h2 id="dashboard-files-title">{text.recentFiles}</h2>
            </div>
            <a href="#files">{text.viewAll} <span aria-hidden="true">→</span></a>
          </header>

          {!workspaceLoaded ? (
            <p className="dashboard-panel-message" role="status">{text.loading}</p>
          ) : workspaceLoadError ? (
            <div className="dashboard-panel-message dashboard-panel-error" role="alert">
              <p>{text.workspaceLoadError}</p>
              <button className="text-button" type="button" onClick={onRetryLoad}>{text.retry}</button>
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="panel-empty dashboard-empty">
              <span className="panel-empty-icon" aria-hidden="true">
                <img src={recentFileClockIcon} alt="" />
              </span>
              <strong>{text.noRecentFiles}</strong>
              <p>{text.addFirstFileHelp}</p>
              <button className="primary-button" type="button" disabled={!canUploadFiles} onClick={onUploadFiles}>{text.uploadFiles}</button>
            </div>
          ) : (
            <div className="dashboard-file-list" aria-label={text.recentFiles}>
              {recentFiles.map((studyFile) => {
                const course = courses.find((item) => item.code === studyFile.courseCode)
                return (
                  <a
                    className="dashboard-file-item"
                    key={studyFile.id}
                    href={studyFile.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${studyFile.file.name}, ${course?.title ?? text.noCourseAssociated}, ${dateFormatter.format(studyFile.uploadedAt)}`}
                  >
                    <span className="dashboard-file-type" aria-hidden="true">{getFileType(studyFile.file.name)}</span>
                    <span className="dashboard-file-copy">
                      <strong>{studyFile.file.name}</strong>
                      <small>{course?.title ?? text.noCourseAssociated}</small>
                    </span>
                    <time dateTime={studyFile.uploadedAt.toISOString()}>{dateFormatter.format(studyFile.uploadedAt)}</time>
                  </a>
                )
              })}
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
            <p>{text.askNotConnected}</p>
          </div>
        </div>
        <a className="primary-button" href="#ask-axi">
          <svg className="axi-button-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.9L4 20l3.8-.9A8.5 8.5 0 1 0 12 3.5Z" />
            <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
          </svg>
          {text.openAskAxi}
        </a>
      </section>
    </>
  )
}

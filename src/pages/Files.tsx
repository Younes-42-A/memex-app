/* Renders uploaded files and workspace storage usage. */
import type { ChangeEvent, RefObject } from 'react'
import type { interfaceText } from '../i18n'
import type { Course, StudyFile } from '../types'
import { formatSize } from '../utils/format'

type FilesProps = {
  text: typeof interfaceText.en
  selectedCourseCode: string | null
  workspaceLoaded: boolean
  storageRemaining: number
  storageRemainingLabel: string
  storageUsedLabel: string
  storagePercent: number
  courses: Course[]
  visibleFiles: StudyFile[]
  fileInputRef: RefObject<HTMLInputElement | null>
  onShowAll: () => void
  onChooseFiles: () => void
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (file: StudyFile) => void
}

export default function Files({
  text,
  selectedCourseCode,
  workspaceLoaded,
  storageRemaining,
  storageRemainingLabel,
  storageUsedLabel,
  storagePercent,
  courses,
  visibleFiles,
  fileInputRef,
  onShowAll,
  onChooseFiles,
  onUpload,
  onRemoveFile,
}: FilesProps) {
  return (
    <section className="content-section files-section" aria-labelledby="files-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">{text.uploads}</p>
          <h2 id="files-title">{selectedCourseCode ? `${text.files} · ${selectedCourseCode}` : text.files}</h2>
        </div>
        <div className="file-actions">
          {selectedCourseCode && (
            <button className="text-button" type="button" onClick={onShowAll}>
              {text.showAll}
            </button>
          )}
          <button className="primary-button" type="button" disabled={!workspaceLoaded || storageRemaining === 0} onClick={onChooseFiles}>
            {text.addFiles}
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            multiple
            aria-label="Choose study files"
            onChange={onUpload}
          />
        </div>
      </div>

      <div className="storage-summary">
        <div className="storage-summary-label">
          <strong>{text.workspaceStorage}</strong>
          <span>{storageUsedLabel} of {text.totalStorage} {text.storageUsed} · {storageRemainingLabel} {text.storageRemaining}</span>
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
                  onClick={() => onRemoveFile(studyFile)}
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
    </section>
  )
}

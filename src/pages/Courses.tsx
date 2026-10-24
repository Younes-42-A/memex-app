/* Renders course creation controls and the course list. */
import type { FormEvent } from 'react'
import type { interfaceText } from '../i18n'
import type { Course, CourseForm } from '../types'

type CoursesProps = {
  text: typeof interfaceText.en
  courses: Course[]
  files: Array<{ courseCode: string }>
  selectedCourseCode: string | null
  workspaceLoaded: boolean
  courseFormOpen: boolean
  courseForm: CourseForm
  onToggleForm: () => void
  onCourseFormChange: (field: keyof CourseForm, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSelectCourse: (courseCode: string) => void
  onRemoveCourse: (course: Course) => void
}

export default function Courses({
  text,
  courses,
  files,
  selectedCourseCode,
  workspaceLoaded,
  courseFormOpen,
  courseForm,
  onToggleForm,
  onCourseFormChange,
  onSubmit,
  onSelectCourse,
  onRemoveCourse,
}: CoursesProps) {
  return (
    <section className="content-section" aria-labelledby="courses-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">{text.learningSpace}</p>
          <h2 id="courses-title">{text.courses}</h2>
        </div>
        <button className="primary-button" type="button" disabled={!workspaceLoaded} onClick={onToggleForm}>
          {!workspaceLoaded ? text.loading : courseFormOpen ? text.cancel : text.addCourse}
        </button>
      </div>

      {courseFormOpen && (
        <form className="course-form" onSubmit={onSubmit}>
          <label>
            {text.courseCode}
            <input
              required
              value={courseForm.code}
              onChange={(event) => onCourseFormChange('code', event.target.value)}
              placeholder="e.g. CS 204"
            />
          </label>
          <label>
            {text.courseName}
            <input
              required
              value={courseForm.title}
              onChange={(event) => onCourseFormChange('title', event.target.value)}
              placeholder="e.g. Data Structures"
            />
          </label>
          <label>
            {text.instructor}
            <input
              value={courseForm.instructor}
              onChange={(event) => onCourseFormChange('instructor', event.target.value)}
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
                  onClick={() => onSelectCourse(course.code)}
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
                  onClick={() => onRemoveCourse(course)}
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
    </section>
  )
}

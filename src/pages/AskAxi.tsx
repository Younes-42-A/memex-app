/* Renders the Ask AXI composer, study selectors, and chat history workspace. */
import type { ChangeEvent, RefObject } from 'react'
import type { ChatSession } from '../components/ChatSidebarWithHistory'
import ChatSidebarWithHistory from '../components/ChatSidebarWithHistory'
import AskSelect from '../components/AskSelect'
import type { interfaceText } from '../i18n'
import type { AnswerStyle, Course, StudyFile } from '../types'

type ChatAttachment = { id: string; file: File }

type AskAxiProps = {
  text: typeof interfaceText.en
  courses: Course[]
  files: StudyFile[]
  chatSessions: ChatSession[]
  activeChatId: string | null
  now: Date
  heading: string
  askCourseSelection: string
  answerStyle: AnswerStyle
  askFileId: string
  askPrompt: string
  chatAttachments: ChatAttachment[]
  chatAttachmentError: string
  chatImageInputRef: RefObject<HTMLInputElement | null>
  chatFileInputRef: RefObject<HTMLInputElement | null>
  onStartNewChat: () => void
  onSelectChat: (session: ChatSession) => void
  onDeleteChat: (session: ChatSession) => void
  onRenameChat: (session: ChatSession, title: string) => void
  onOpenChatSettings: () => void
  onPromptChange: (prompt: string) => void
  onRemoveAttachment: (id: string) => void
  onAnswerStyleChange: (value: string) => void
  onCourseChange: (value: string) => void
  onFileChange: (value: string) => void
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function AskAxi({
  text,
  courses,
  files,
  chatSessions,
  activeChatId,
  now,
  heading,
  askCourseSelection,
  answerStyle,
  askFileId,
  askPrompt,
  chatAttachments,
  chatAttachmentError,
  chatImageInputRef,
  chatFileInputRef,
  onStartNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onOpenChatSettings,
  onPromptChange,
  onRemoveAttachment,
  onAnswerStyleChange,
  onCourseChange,
  onFileChange,
  onAttachmentChange,
}: AskAxiProps) {
  return (
    <section className="chat-workspace" aria-label={text.studyAssistant}>
      <ChatSidebarWithHistory
        sessions={chatSessions}
        activeSessionId={activeChatId}
        currentDate={now}
        onNewChat={onStartNewChat}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
        onRenameChat={onRenameChat}
      />
      <div className="chat-workspace-main">
        <div className="ask-heading chat-heading">
          <div>
            <p className="section-kicker">{text.studyAssistant}</p>
            <h1 id="ask-title">{heading}</h1>
            <p>{text.askDescription}</p>
          </div>
          <button className="chat-settings-trigger" type="button" onClick={onOpenChatSettings}>
            <span aria-hidden="true">⚙</span> Chat settings
          </button>
        </div>

        <div className="ask-composer">
          <label className="visually-hidden" htmlFor="ask-prompt">{text.yourQuestion}</label>
          <textarea
            id="ask-prompt"
            value={askPrompt}
            onChange={(event) => onPromptChange(event.target.value)}
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
                    onClick={() => onRemoveAttachment(id)}
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
                onChange={onAnswerStyleChange}
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
                onChange={onCourseChange}
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
                onChange={onFileChange}
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
                onChange={onAttachmentChange}
              />
              <input
                ref={chatFileInputRef}
                className="visually-hidden"
                type="file"
                multiple
                aria-label="Choose files to attach"
                onChange={onAttachmentChange}
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
  )
}

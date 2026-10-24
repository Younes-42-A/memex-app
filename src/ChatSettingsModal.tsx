import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'

export type ChatSettings = {
  model: string
  responseStyle: 'balanced' | 'concise' | 'step-by-step'
  detailLevel: 'brief' | 'standard' | 'in-depth'
  systemInstructions: string
}

type ChatSettingsModalProps = {
  open: boolean
  settings: ChatSettings
  onClose: () => void
  onSave: (settings: ChatSettings) => boolean | void
}

type DropdownOption = {
  value: string
  label: string
}

function SettingsDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex((option) => option.value === value)))
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    optionRefs.current[activeIndex]?.focus()

    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [activeIndex, open])

  function openMenu(index = options.findIndex((option) => option.value === value)) {
    setActiveIndex(Math.max(0, index))
    setOpen(true)
  }

  function handleOptionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + direction + options.length) % options.length)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1)
    } else if (event.key === 'Escape') {
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div className="chat-settings-dropdown" ref={rootRef}>
      <button
        ref={triggerRef}
        className="chat-settings-dropdown-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => open ? setOpen(false) : openMenu()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const selectedIndex = options.findIndex((option) => option.value === value)
            const initialIndex = selectedIndex < 0 ? 0 : selectedIndex
            const nextIndex = event.key === 'ArrowDown'
              ? Math.min(initialIndex + 1, options.length - 1)
              : Math.max(initialIndex - 1, 0)
            openMenu(nextIndex)
          } else if (event.key === 'Escape' && open) {
            event.stopPropagation()
            setOpen(false)
          }
        }}
      >
        <span>{selectedOption?.label ?? 'Choose'}</span>
        <span className={`chat-settings-dropdown-chevron${open ? ' open' : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="chat-settings-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              ref={(element) => { optionRefs.current[index] = element }}
              className={`chat-settings-dropdown-option${option.value === value ? ' selected' : ''}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={handleOptionKeyDown}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
                triggerRef.current?.focus()
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChatSettingsModal({ open, settings, onClose, onSave }: ChatSettingsModalProps) {
  const [draft, setDraft] = useState(settings)
  const [saveError, setSaveError] = useState('')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusableElements?.length) return
      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!open) return null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const saved = onSave(draft)
      if (saved === false) {
        setSaveError('Your settings could not be saved. Please try again.')
        return
      }
      onClose()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Your settings could not be saved.')
    }
  }

  return (
    <div
      className="chat-settings-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="chat-settings-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-settings-title"
      >
        <header className="chat-settings-header">
          <div>
            <p className="section-kicker">PERSONALIZE YOUR AI</p>
            <h2 id="chat-settings-title">Chat settings</h2>
            <p>Choose how your study assistant responds.</p>
          </div>
          <button ref={closeButtonRef} className="chat-settings-close" type="button" onClick={onClose} aria-label="Close chat settings">
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="chat-settings-field">
            <span><strong>AI model</strong><small>Choose the model for this chat.</small></span>
            <SettingsDropdown
              label="AI model"
              value={draft.model}
              options={[
                { value: 'axi-study', label: 'AXI Study' },
                { value: 'axi-fast', label: 'AXI Fast' },
                { value: 'axi-reasoning', label: 'AXI Reasoning' },
              ]}
              onChange={(model) => setDraft({ ...draft, model })}
            />
          </div>

          <fieldset className="chat-settings-options">
            <legend>Response style</legend>
            <p>Set the tone and structure of answers.</p>
            <div className="chat-settings-choice-grid">
              {([
                ['balanced', 'Balanced', 'Clear, helpful explanations'],
                ['concise', 'Concise', 'Key points without extra detail'],
                ['step-by-step', 'Step by step', 'Break problems into stages'],
              ] as const).map(([value, label, description]) => (
                <label className={`chat-settings-choice${draft.responseStyle === value ? ' selected' : ''}`} key={value}>
                  <input
                    type="radio"
                    name="chat-response-style"
                    value={value}
                    checked={draft.responseStyle === value}
                    onChange={() => setDraft({ ...draft, responseStyle: value })}
                  />
                  <span><strong>{label}</strong><small>{description}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="chat-settings-field">
            <span><strong>Explanation detail</strong><small>Control how much context the assistant includes.</small></span>
            <SettingsDropdown
              label="Explanation detail"
              value={draft.detailLevel}
              options={[
                { value: 'brief', label: 'Brief' },
                { value: 'standard', label: 'Standard' },
                { value: 'in-depth', label: 'In depth' },
              ]}
              onChange={(detailLevel) => {
                if (detailLevel === 'brief' || detailLevel === 'standard' || detailLevel === 'in-depth') {
                  setDraft({ ...draft, detailLevel })
                }
              }}
            />
          </div>

          <label className="chat-settings-instructions">
            <span><strong>Custom instructions</strong><small>Optional context for your AI study assistant.</small></span>
            <textarea
              value={draft.systemInstructions}
              maxLength={1200}
              rows={4}
              placeholder="For example: explain concepts using examples from my course notes."
              onChange={(event) => setDraft({ ...draft, systemInstructions: event.target.value })}
            />
            <small className="chat-settings-count">{draft.systemInstructions.length}/1200</small>
          </label>

          {saveError && <p className="chat-settings-error" role="alert">{saveError}</p>}
          <footer className="chat-settings-actions">
            <button className="chat-settings-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit">Save preferences</button>
          </footer>
        </form>
      </section>
    </div>
  )
}

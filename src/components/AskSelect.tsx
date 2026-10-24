/* Selects a study material option in the Ask AXI composer. */
import { useEffect, useRef, useState } from 'react'

type AskOption = {
  value: string
  label: string
}

type AskSelectProps = {
  label: string
  value: string
  options: AskOption[]
  icon: string
  onChange: (value: string) => void
}

export default function AskSelect({
  label,
  value,
  options,
  icon,
  onChange,
}: AskSelectProps) {
  const [open, setOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !selectRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="ask-select" ref={selectRef}>
      <button
        className="ask-select-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="ask-select-icon" aria-hidden="true">{icon}</span>
        <span className="ask-select-value">{selectedOption?.label ?? 'Choose'}</span>
        <span className={`ask-select-chevron${open ? ' open' : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="ask-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              className={`ask-select-option${option.value === value ? ' selected' : ''}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <span className="ask-select-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}

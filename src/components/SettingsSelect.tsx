/* Selects a setting option and optional color swatch. */
import { useEffect, useRef, useState } from 'react'
import type { SelectOption } from '../types'

type SettingsSelectProps = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export default function SettingsSelect({
  label,
  value,
  options,
  onChange,
}: SettingsSelectProps) {
  const [open, setOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !selectRef.current?.contains(event.target)) setOpen(false)
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
    <div className="settings-select-wrap" ref={selectRef}>
      <button
        className="settings-select-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="settings-select-current">
          {selectedOption?.swatch && <span className="theme-swatch" style={{ background: selectedOption.swatch }} aria-hidden="true" />}
          {selectedOption?.label ?? 'Choose'}
        </span>
        <span className={`settings-select-chevron${open ? ' open' : ''}`} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="settings-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              className={`settings-select-option${option.value === value ? ' selected' : ''}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <span className="settings-select-option-label">
                {option.swatch && <span className="theme-swatch" style={{ background: option.swatch }} aria-hidden="true" />}
                {option.label}
              </span>
              {option.value === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

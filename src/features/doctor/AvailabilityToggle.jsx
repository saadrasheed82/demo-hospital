import { AVAILABILITY_OPTIONS } from '../../shared/utils/doctorStatus'

export function AvailabilityToggle({ value, onChange, busy }) {
  return (
    <div>
      <p className="label-mono mb-3xs">Your status</p>
      <div className="inline-flex flex-wrap rounded-control border border-rule-2 p-3xs">
        {AVAILABILITY_OPTIONS.map(opt => {
          const active = (value || 'available') === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              disabled={busy}
              aria-pressed={active}
              className={`rounded-[4px] px-xs py-2xs text-sm transition-colors duration-150 ease-out ${
                active ? 'bg-accent-soft font-medium text-accent' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

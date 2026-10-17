export function ArrivalToggle({ status, onStatusChange }) {
  const options = [
    { value: 'on_way', label: 'On my way' },
    { value: 'arriving', label: 'Arriving in 5 min' },
    { value: 'arrived', label: 'Arrived' },
  ]

  return (
    <div>
      <p className="label-mono mb-3xs">Your status</p>
      <div className="inline-flex flex-wrap rounded-control border border-rule-2 p-3xs">
        {options.map(opt => {
          const active = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
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
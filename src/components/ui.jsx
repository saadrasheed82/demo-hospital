import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

/* Hallmark · component set: Cobalt · genre: modern-minimal
 * Every surface in the app resolves through these primitives, so the hairline
 * language, status vocabulary and 8-state behaviour stay identical everywhere.
 */

/* ── Page header — title, supporting line, actions right ───────────────── */
export function PageHeader({ eyebrow, title, meta, actions, children }) {
  return (
    <header className="mb-md flex flex-wrap items-start justify-between gap-md">
      <div className="min-w-0">
        {eyebrow && <p className="label-mono mb-3xs">{eyebrow}</p>}
        <h1 className="text-xl font-display font-semibold md:text-2xl">{title}</h1>
        {meta && <p className="mt-2xs text-sm text-ink-3">{meta}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2xs">{actions}</div>}
    </header>
  )
}

/* ── Panel — the hairline surface every page is built from ─────────────── */
export function Panel({ title, meta, actions, children, className = '', flush = false, quiet = false }) {
  const shell = ['panel', quiet ? 'panel--quiet' : '', flush ? 'panel--flush' : '', className]
    .filter(Boolean)
    .join(' ')
  const hasHead = title || meta || actions
  return (
    <section className={shell}>
      {hasHead && (
        <div className="panel-head">
          <div className="min-w-0">
            {title && <h2 className="text-base font-display font-semibold">{title}</h2>}
            {meta && <p className="mt-3xs text-xs text-ink-3">{meta}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2xs">{actions}</div>}
        </div>
      )}
      {flush ? children : <div className="panel-body">{children}</div>}
    </section>
  )
}

/* ── Stat — one figure with a mono label, no decoration ────────────────── */
export function Stat({ label, value, unit, foot, tone = 'default' }) {
  const valueTone =
    tone === 'danger' ? 'text-danger' : tone === 'ok' ? 'text-ok' : tone === 'muted' ? 'text-ink-3' : 'text-ink'
  return (
    <div className="panel px-md py-sm">
      <p className="label-mono">{label}</p>
      <p className={`mt-2xs font-display text-xl font-semibold tnum ${valueTone}`}>
        {value}
        {unit && <span className="ml-3xs text-sm font-normal text-ink-3">{unit}</span>}
      </p>
      {foot && <p className="mt-3xs text-xs text-ink-3">{foot}</p>}
    </div>
  )
}

/* ── StatRow — the dashboard rhythm, wraps at every width ──────────────── */
export function StatRow({ children }) {
  return <div className="mb-md grid grid-cols-2 gap-xs md:grid-cols-4">{children}</div>
}

/* ── StatusChip — one vocabulary, five tones ───────────────────────────── */
const CHIP_TONE = {
  active: 'chip chip--active',
  ok: 'chip chip--ok',
  warn: 'chip chip--warn',
  danger: 'chip chip--danger',
  neutral: 'chip',
  muted: 'chip',
}

export function StatusChip({ tone = 'neutral', children }) {
  return <span className={CHIP_TONE[tone] || CHIP_TONE.neutral}>{children}</span>
}

/* Queue + payment vocabularies, resolved in one place. */
export function QueueChip({ status }) {
  const map = {
    current: ['active', 'Seeing now'],
    pending: ['neutral', 'Waiting'],
    completed: ['muted', 'Completed'],
    'no-show': ['danger', 'No-show'],
    no_show: ['danger', 'No-show'],
    end_of_queue: ['warn', 'Re-queued'],
  }
  const [tone, label] = map[status] || ['neutral', status || '—']
  return <StatusChip tone={tone}>{label}</StatusChip>
}

export function PaymentChip({ status }) {
  const paid = status === 'paid'
  return <StatusChip tone={paid ? 'ok' : 'warn'}>{paid ? 'Paid' : 'Unpaid'}</StatusChip>
}

/* ── Notice — the inline message, replaces five colour variants ────────── */
export function Notice({ tone = 'default', title, children }) {
  const cls =
    tone === 'warn'
      ? 'notice notice--warn'
      : tone === 'danger'
        ? 'notice notice--danger'
        : tone === 'ok'
          ? 'notice notice--ok'
          : 'notice'
  return (
    <div className={cls} role={tone === 'danger' ? 'alert' : 'status'}>
      <div className="min-w-0">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className={title ? 'mt-3xs text-ink-2' : ''}>{children}</div>}
      </div>
    </div>
  )
}

/* ── EmptyState — replaces the bare "No X found" paragraph ─────────────── */
export function EmptyState({ title, hint, action }) {
  return (
    <div className="px-md py-lg text-center">
      <p className="font-display text-base font-medium text-ink">{title}</p>
      {hint && <p className="mx-auto mt-2xs max-w-sm text-sm text-ink-3">{hint}</p>}
      {action && <div className="mt-sm flex justify-center">{action}</div>}
    </div>
  )
}

/* ── Skeleton — replaces every "Loading..." line ───────────────────────── */
export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="space-y-2xs" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" />
      ))}
    </div>
  )
}

export function SkeletonPanel({ label = 'Loading' }) {
  return (
    <Panel>
      <span className="sr-only">{label}</span>
      <SkeletonRows rows={4} />
    </Panel>
  )
}

/* ── Field — label + control + hint + error, all eight states ──────────── */
export function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-hint text-danger">{error}</p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  )
}

/* ── Button — every variant is a class, never an interpolated colour ───── */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  type = 'button',
  loading = false,
  loadingLabel,
  children,
  className = '',
  ...props
}) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={cls} disabled={props.disabled || loading} aria-busy={loading} {...props}>
      {loading ? loadingLabel || 'Working…' : children}
    </button>
  )
}

/* ── Modal — hairline dialog, focus-managed, no window.confirm ─────────── */
export function Modal({ title, meta, onClose, children, width = 'max-w-md' }) {
  return (
    <div
      className="scrim"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`panel ${width} max-h-[90vh] w-full overflow-y-auto rounded-b-none sm:rounded-b-card`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="panel-head">
          <div className="min-w-0">
            <h2 className="text-base font-display font-semibold">{title}</h2>
            {meta && <p className="mt-3xs text-xs text-ink-3">{meta}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
            Close
          </Button>
        </div>
        <div className="panel-body">{children}</div>
      </div>
    </div>
  )
}

/* ── AppShell — the Workbench frame every role shares ──────────────────── */
export function AppShell({ workspace, role, children, nav = [], aside }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:absolute focus:left-sm focus:top-sm focus:z-50 focus:rounded-control focus:bg-paper focus:px-sm focus:py-2xs"
      >
        Skip to content
      </a>

      {/* ── side rail ─────────────────────────────────────────────────── */}
      <nav
        className="shrink-0 border-b border-rule bg-paper-2 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r"
        aria-label={`${workspace} navigation`}
      >
        <div className="flex items-center justify-between gap-sm px-md py-xs lg:block lg:py-md">
          <div className="min-w-0">
            <p className="font-display text-base font-semibold tracking-tight text-ink">Saad Hospital</p>
            <p className="label-mono mt-3xs">{workspace}</p>
          </div>
          <span className="chip lg:hidden">{role}</span>
        </div>

        <ul className="flex gap-3xs overflow-x-auto border-t border-rule px-2xs py-2xs lg:mt-sm lg:flex-col lg:gap-3xs lg:border-t-0 lg:px-xs lg:py-0">
          {nav.map((item) => (
            <li key={item.to} className="shrink-0 lg:shrink">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'block whitespace-nowrap rounded-control px-xs py-2xs text-sm transition-colors duration-150 ease-out',
                    isActive
                      ? 'bg-accent-soft font-medium text-accent shadow-[inset_2px_0_0_oklch(58%_0.20_256)]'
                      : 'text-ink-2 hover:bg-paper-3 hover:text-ink',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {aside && <div className="border-t border-rule px-md py-sm">{aside}</div>}

        <div className="hidden border-t border-rule px-md py-sm lg:block">
          <p className="label-mono">Signed in</p>
          <p className="mt-3xs truncate text-sm font-medium text-ink">{user?.name || user?.email || '—'}</p>
          <p className="truncate text-xs text-ink-3">{user?.email}</p>
          <Button variant="secondary" size="sm" onClick={handleLogout} className="mt-sm w-full">
            Sign out
          </Button>
        </div>
      </nav>

      {/* ── content canvas ────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-sm border-b border-rule px-md py-xs lg:hidden">
          <span className="chip">{role}</span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
        <main id="workspace" className="mx-auto w-full max-w-6xl px-md py-md lg:px-lg lg:py-lg">
          {children}
        </main>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { isSupabaseActive } from '../supabase'
import { Button, Field, Notice } from '../components/ui'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, signupPatient } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const role = await login(email, password)
      navigate(`/${role}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Please enter your name')
      return
    }
    setBusy(true)
    setError('')
    try {
      const role = await signupPatient({ name: name.trim(), email, password })
      navigate(`/${role}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setName('')
    setPassword('')
  }

  const isLogin = mode === 'login'

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ── the one dark beat: the brand panel ───────────────────────── */}
      <section className="graphite m-0 flex flex-col justify-between rounded-none border-0 p-md lg:m-3 lg:p-lg">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight text-graphite-ink">Saad Hospital</p>
          <p className="label-mono mt-3xs">Appointment &amp; queue system</p>
        </div>

        <div className="my-lg max-w-md">
          <h1 className="font-display text-xl font-semibold leading-tight lg:text-2xl">
            One queue your whole hospital can read.
          </h1>
          <p className="mt-sm text-sm leading-relaxed text-graphite-dim">
            Patients book and track a token. Counter staff run the live queue. Doctors call the next patient and file
            consult notes. Administrators manage the team, schedules and revenue — against one shared record.
          </p>

          <dl className="mt-lg grid grid-cols-2 gap-x-md gap-y-sm border-t border-graphite-2 pt-md">
            {[
              ['Patient', 'Book · pay · track'],
              ['Counter', 'Live queue · re-queue'],
              ['Doctor', 'Now serving · notes'],
              ['Admin', 'Team · schedule · revenue'],
            ].map(([role, detail]) => (
              <div key={role}>
                <dt className="label-mono text-graphite-ink">{role}</dt>
                <dd className="mt-3xs text-xs text-graphite-dim">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="label-mono">
          {isSupabaseActive ? 'Live database connected' : 'Demo mode · nothing is saved'}
        </p>
      </section>

      {/* ── the form ─────────────────────────────────────────────────── */}
      <section className="flex items-center justify-center px-md py-lg lg:px-lg">
        <div className="w-full max-w-sm">
          <p className="label-mono">{isLogin ? 'Sign in' : 'Patient sign-up'}</p>
          <h2 className="mt-3xs font-display text-lg font-semibold">
            {isLogin ? 'Access your workspace' : 'Create your patient account'}
          </h2>
          <p className="mt-2xs text-sm text-ink-3">
            {isLogin
              ? 'Use the email your account was created with.'
              : 'Book appointments and track your queue in real time.'}
          </p>

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="mt-md space-y-sm">
            {!isLogin && (
              <Field label="Full name" htmlFor="login-name">
                <input
                  id="login-name"
                  type="text"
                  autoComplete="name"
                  className="input"
                  placeholder="e.g. Ayesha Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
            )}

            <Field label="Email" htmlFor="login-email">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field
              label="Password"
              htmlFor="login-password"
              hint={isLogin ? undefined : 'At least 6 characters.'}
            >
              <input
                id="login-password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className={error ? 'input input--error' : 'input'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isLogin ? undefined : 6}
              />
            </Field>

            {error && <Notice tone="danger">{error}</Notice>}

            <Button type="submit" block loading={busy} loadingLabel={isLogin ? 'Signing in…' : 'Creating account…'}>
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-md border-t border-rule pt-sm text-sm text-ink-3">
            {isLogin ? 'New patient? ' : 'Already registered? '}
            <button type="button" onClick={switchMode} className="link">
              {isLogin ? 'Create an account' : 'Sign in instead'}
            </button>
          </p>

          <p className="mt-sm text-xs text-ink-3">
            Staff and doctor logins are issued by the hospital administrator from the admin workspace.
          </p>
        </div>
      </section>
    </div>
  )
}
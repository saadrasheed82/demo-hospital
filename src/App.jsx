import { BrowserRouter, HashRouter } from 'react-router-dom'
import AppRoutes from './routes'
import { isPatientOnly } from './config'
import './index.css'

// HashRouter keeps deep links working inside Capacitor's WebView,
// where there is no server to rewrite history paths.
const Router = isPatientOnly ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </Router>
  )
}

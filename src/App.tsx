import { useState } from 'react'
import './App.css'

type Page = { label: string; url: string }

const PAGES: Page[] = [
  { label: 'Home', url: '/home.html' },
  { label: 'Tools', url: '/tools.html' },
  { label: 'Tutorial', url: '/tutorial.html' },
  { label: 'Credits', url: '/credits.html' },
  { label: 'Dashboard', url: '/dashboard.html' },
  { label: 'Bookmarks', url: '/bookmart.html' },
  { label: 'Submit', url: '/submit.html' },
]

function App() {
  const [active, setActive] = useState('Home')

  const current = PAGES.find((p) => p.label === active) ?? PAGES[0]

  return (
    <div className="shell">
      <nav className="bar">
        <div className="brand">🎮 Securly Games</div>
        <ul className="tabs">
          {PAGES.map((page) => (
            <li key={page.label}>
              <button
                type="button"
                className={page.label === active ? 'tab active' : 'tab'}
                onClick={() => setActive(page.label)}
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>
        <a className="open" href={current.url} target="_blank" rel="noreferrer">
          Open ↗
        </a>
      </nav>
      <main className="frame-wrap">
        <iframe
          key={current.url}
          className="frame"
          src={current.url}
          title={current.label}
          allow="fullscreen"
        />
      </main>
    </div>
  )
}

export default App
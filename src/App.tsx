import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { ColtraneLogo } from './components/Logo'
import { HomePage } from './pages/HomePage'
import { BrowsePage } from './pages/BrowsePage'
import { SearchPage } from './pages/SearchPage'
import { ReleasePage } from './pages/ReleasePage'
import { ArtistPage } from './pages/ArtistPage'
import { QueuePage } from './pages/QueuePage'
import { ListsPage } from './pages/ListsPage'
import { ListDetailPage } from './pages/ListDetailPage'
import { ProfileLayout } from './pages/profile/ProfileLayout'
import { ProfileOverview } from './pages/profile/ProfileOverview'
import { ProfileMusic } from './pages/profile/ProfileMusic'
import { ProfileDiary } from './pages/profile/ProfileDiary'
import { ProfileReviews } from './pages/profile/ProfileReviews'
import { ProfileLikes } from './pages/profile/ProfileLikes'
import { EmptyState } from './components/Section'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Footer() {
  return (
    <footer className="border-t border-line bg-soft/60">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted">
        <span className="flex items-center gap-2">
          <ColtraneLogo height={18} />
          <b className="text-ink">coltrane</b> — your taste, on display.
        </span>
        <span>
          Catalog &amp; artwork via the iTunes Search API. Your diary lives in this browser.
        </span>
      </div>
    </footer>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10">
      <EmptyState>
        This page skipped like a scratched record.{' '}
        <Link to="/" className="font-semibold text-green hover:underline">
          Back home
        </Link>
      </EmptyState>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/release/:id" element={<ReleasePage />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/list/:id" element={<ListDetailPage />} />
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfileOverview />} />
              <Route path="music" element={<ProfileMusic />} />
              <Route path="diary" element={<ProfileDiary />} />
              <Route path="reviews" element={<ProfileReviews />} />
              <Route path="likes" element={<ProfileLikes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

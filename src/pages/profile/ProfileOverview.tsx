import { useState } from 'react'
import { useStore, shelfIds } from '../../lib/store'
import { useDocumentTitle } from '../../lib/hooks'
import { Section, EmptyState } from '../../components/Section'
import { ReleaseCard } from '../../components/ReleaseCard'
import { ReleasePickerModal } from '../../components/ReleasePickerModal'
import { ActivityFeed } from '../../components/ActivityFeed'
import { ReleaseGrid } from '../../components/ReleaseGrid'
import { PlusIcon, XIcon } from '../../components/Icons'

export function ProfileOverview() {
  const profile = useStore((s) => s.profile)
  useDocumentTitle(profile.displayName)
  const releases = useStore((s) => s.releases)
  const logs = useStore((s) => s.logs)
  const ratings = useStore((s) => s.ratings)
  const likes = useStore((s) => s.likes)
  const cacheRelease = useStore((s) => s.cacheRelease)
  const setFavorite = useStore((s) => s.setFavorite)
  const [pickingSlot, setPickingSlot] = useState<number | null>(null)

  const favorites = [0, 1, 2, 3].map((i) => {
    const id = profile.favoriteIds[i]
    return id ? (releases[id] ?? null) : null
  })

  const recentIds = shelfIds({ logs, ratings, likes }).slice(0, 6)
  const recent = recentIds.map((id) => releases[id]).filter(Boolean)

  return (
    <>
      <Section title="Favorite music">
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {favorites.map((fav, i) =>
            fav ? (
              <div key={i} className="group/fav relative">
                <ReleaseCard release={fav} caption />
                <button
                  type="button"
                  className="absolute -right-1.5 -top-1.5 z-10 hidden cursor-pointer rounded-full border border-line bg-card p-1 text-muted shadow-sm transition-colors hover:text-fail group-hover/fav:block"
                  onClick={() => setFavorite(i, null)}
                  aria-label={`Remove ${fav.title} from favorites`}
                >
                  <XIcon size={12} />
                </button>
              </div>
            ) : (
              <button
                key={i}
                type="button"
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-[#d8cdbd] text-muted transition-colors hover:border-green hover:text-green"
                onClick={() => setPickingSlot(i)}
              >
                <PlusIcon size={18} />
                <span className="text-[0.7rem] font-semibold">Add favorite</span>
              </button>
            ),
          )}
        </div>
      </Section>

      <Section title="Recently on the shelf" action={{ label: 'All music', to: '/profile/music' }}>
        {recent.length === 0 ? (
          <EmptyState>Log, rate or like something and it’ll show up here.</EmptyState>
        ) : (
          <ReleaseGrid releases={recent} />
        )}
      </Section>

      <Section title="Activity">
        <ActivityFeed limit={10} />
      </Section>

      {pickingSlot != null && (
        <ReleasePickerModal
          title="Pick a favorite"
          onClose={() => setPickingSlot(null)}
          onPick={(r) => {
            cacheRelease(r)
            setFavorite(pickingSlot, r.id)
          }}
        />
      )}
    </>
  )
}

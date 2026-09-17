import { formatMoney, type PriceBasis } from '@/lib/money'
import { timeRemaining } from '@/alerts/templates'
import { setListingState } from './actions'

export interface FeedCardListing {
  id: string
  title: string
  url: string
  priceExGst: number | null
  priceBasis: PriceBasis
  imageUrl: string | null
  sourceName: string
  region: string
  outOfRegion: boolean
  matchedTerms: string[]
  closesAt: string | null
  firstSeenAt: string
  lotNumber: string | null
  state: string | null
  stateBy: string | null
  stateNote: string | null
  duplicateSources: string[]
  isNewSinceLastVisit: boolean
}

export function FeedCard({ listing, now }: { listing: FeedCardListing; now: Date }) {
  const price = formatMoney({
    priceExGst: listing.priceExGst,
    priceOriginal: listing.priceExGst,
    basis: listing.priceBasis,
  })
  const priceIsTbc = listing.priceExGst === null

  return (
    <article className={`card${listing.isNewSinceLastVisit ? ' is-new' : ''}`}>
      {listing.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="card-image" src={listing.imageUrl} alt="" loading="lazy" />
      ) : (
        <div className="card-image-empty">no image</div>
      )}

      <div className="card-body">
        <div className="row" style={{ gap: 6 }}>
          {listing.isNewSinceLastVisit ? <span className="badge new">new</span> : null}
          <span className="badge">{listing.sourceName}</span>
          {listing.duplicateSources.map((source) => (
            <span className="badge dup" key={source}>
              also on {source}
            </span>
          ))}
          {listing.outOfRegion ? <span className="badge out-of-region">out of region</span> : null}
        </div>

        <div className="card-title">{listing.title}</div>
        <div className={`card-price${priceIsTbc ? ' tbc' : ''}`}>{price}</div>

        <div className="card-meta">
          <span>{listing.region}</span>
          {listing.lotNumber ? <span>lot {listing.lotNumber}</span> : null}
          {listing.closesAt ? <span>{timeRemaining(listing.closesAt, now)}</span> : null}
        </div>

        <div className="card-meta">
          {listing.matchedTerms.length > 0 ? <span>matched {listing.matchedTerms.join(', ')}</span> : null}
        </div>

        {listing.state && listing.state !== 'new' ? (
          <div className="card-meta">
            <span className="badge">{listing.state}</span>
            {listing.stateBy ? <span>by {listing.stateBy}</span> : null}
            {listing.stateNote ? <span>{listing.stateNote}</span> : null}
          </div>
        ) : null}
      </div>

      <div className="card-actions">
        <a className="button primary" href={listing.url} target="_blank" rel="noreferrer">
          Open on {listing.sourceName}
        </a>
        <form action={setListingState}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="state" value="watching" />
          <button type="submit">Watching</button>
        </form>
        <form action={setListingState}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="state" value="dismissed" />
          <button type="submit">Dismiss</button>
        </form>
        <form action={setListingState}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="state" value="bought" />
          <button type="submit">Bought</button>
        </form>
      </div>

      <form action={setListingState} className="card-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
        <input type="hidden" name="listingId" value={listing.id} />
        <input type="hidden" name="state" value={listing.state ?? 'new'} />
        <input name="note" placeholder="Add a note" defaultValue={listing.stateNote ?? ''} style={{ flex: 1 }} />
        <button type="submit">Save note</button>
      </form>
    </article>
  )
}

import { useCallback, useEffect, useState } from "react";

const INITIAL_QUERY = "album";
const PAGE_SIZE = 10;

function AlbumCard({ album, saved, onToggleSave }) {
  return (
    <article className="album-card">
      <a className="album-art" href={album.spotifyUrl || "#"} target="_blank" rel="noreferrer">
        {album.imageUrl ? (
          <img src={album.imageUrl} alt={`${album.name} by ${album.artist}`} />
        ) : (
          <span className="art-fallback">♪</span>
        )}
      </a>
      <div className="album-info">
        <div>
          <h3>{album.name}</h3>
          <p>{album.artist} · {album.releaseDate?.slice(0, 4)}</p>
        </div>
        <button className={`save-button ${saved ? "saved" : ""}`} onClick={() => onToggleSave(album.id)} aria-label={`${saved ? "Remove" : "Add"} ${album.name} ${saved ? "from" : "to"} watchlist`}>
          {saved ? "✓" : "＋"}
        </button>
      </div>
      <div className="rating"><span className="stars">★★★★★</span><span>Spotify</span></div>
    </article>
  );
}

function App() {
  const [page, setPage] = useState(window.location.hash === "#all-albums" ? "all" : "discover");
  const [albums, setAlbums] = useState([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState(INITIAL_QUERY);
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [savedAlbums, setSavedAlbums] = useState(() => new Set());
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadAlbums = useCallback(async (searchQuery, nextOffset = 0, append = false) => {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch(`/api/albums?query=${encodeURIComponent(searchQuery)}&limit=${PAGE_SIZE}&offset=${nextOffset}`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setAlbums((current) => append ? [...current, ...data.albums] : data.albums);
      setOffset(nextOffset);
      setHasMore(data.albums.length === PAGE_SIZE);
      setStatus("ready");
    } catch (requestError) {
      setStatus("error");
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    loadAlbums(submittedQuery);
  }, [loadAlbums, submittedQuery]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = window.location.hash === "#all-albums" ? "all" : "discover";
      setPage(nextPage);
      setQuery("");
      setYear("all");
      setOffset(0);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (nextQuery) {
      setSubmittedQuery(nextQuery);
      setOffset(0);
      if (page === "discover") window.location.hash = "all-albums";
    }
  }

  function applyFilters(event) {
    event.preventDefault();
    const yearQuery = year === "all" ? "album" : `year:${year}`;
    setSubmittedQuery(query.trim() ? `${query.trim()} ${yearQuery}` : yearQuery);
    setOffset(0);
  }

  function toggleSaved(id) {
    setSavedAlbums((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleAlbums = [...albums].sort((first, second) => {
    if (sort === "newest") return second.releaseDate.localeCompare(first.releaseDate);
    if (sort === "oldest") return first.releaseDate.localeCompare(second.releaseDate);
    return 0;
  });

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/"> <span className="brand-mark">A</span><span>album<span>boxd</span></span></a>
        <nav className="main-nav" aria-label="Main navigation"><a className={page === "discover" ? "active" : ""} href="#discover">Discover</a><a className={page === "all" ? "active" : ""} href="#all-albums">All albums</a><a href="#diary">My diary</a></nav>
        <div className="header-actions"><span className="spotify-status">● Spotify metadata</span><span className="profile-button">JD</span></div>
      </header>

      <main>
        {page === "all" ? (
          <section className="all-albums-page">
            <div className="page-intro"><p className="eyebrow">The complete shelf</p><h1>All <em>albums.</em></h1><p>Search Spotify's catalogue and find your next record. Results load in batches so you can keep exploring.</p></div>
            <form className="filter-bar" onSubmit={applyFilters}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by album or artist" aria-label="Search by album or artist" />
              <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by year"><option value="all">Any year</option><option value="2025">2025</option><option value="2024">2024</option><option value="2023">2023</option><option value="2022">2022</option><option value="2021">2021</option></select>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort albums"><option value="relevance">Relevance</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
              <button className="button button-primary">Apply filters <span>→</span></button>
            </form>
            <div className="section-heading"><div><p className="eyebrow">Live from Spotify</p><h2>{albums.length} albums loaded</h2></div></div>
            {status === "loading" && <div className="message">Loading album metadata from Spotify...</div>}
            {status === "error" && <div className="message error"><strong>Could not load Spotify albums.</strong><span>{error}</span><button className="button button-dark" onClick={() => loadAlbums(submittedQuery, offset)}>Try again</button></div>}
            {status === "ready" && <div className="album-grid">{visibleAlbums.map((album) => <AlbumCard key={album.id} album={album} saved={savedAlbums.has(album.id)} onToggleSave={toggleSaved} />)}</div>}
            {status === "ready" && hasMore && <button className="button button-dark load-more" onClick={() => loadAlbums(submittedQuery, offset + PAGE_SIZE, true)}>Load more albums</button>}
          </section>
        ) : (
        <section className="hero" id="discover">
          <div className="hero-content">
            <p className="eyebrow">Your music diary</p>
            <h1>Find your next<br /><em>favorite album.</em></h1>
            <p className="hero-copy">Keep track of what you listen to, share your taste, and discover records worth playing all the way through.</p>
            <form className="search-form" onSubmit={submitSearch}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Spotify albums or artists" aria-label="Search Spotify albums or artists" />
              <button className="button button-primary">Search <span>→</span></button>
            </form>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="hero-record" /><div className="hero-cover"><strong>NIGHT<br />DRIVE</strong><small>SPOTIFY EDITION</small></div><span className="floating-note">✦</span></div>
        </section>
        )}

        {page === "discover" && <section className="content-section">
          <div className="section-heading"><div><p className="eyebrow">Live from Spotify</p><h2>{submittedQuery === INITIAL_QUERY ? "Trending now" : `Results for "${submittedQuery}"`}</h2></div><span className="result-count">{albums.length} albums</span></div>
          {status === "loading" && <div className="message">Loading album metadata from Spotify...</div>}
          {status === "error" && <div className="message error"><strong>Could not load Spotify albums.</strong><span>{error}</span><button className="button button-dark" onClick={() => loadAlbums(submittedQuery)}>Try again</button></div>}
          {status === "ready" && albums.length === 0 && <div className="message">Spotify returned no albums for this search.</div>}
          {status === "ready" && albums.length > 0 && <div className="album-grid">{albums.map((album) => <AlbumCard key={album.id} album={album} saved={savedAlbums.has(album.id)} onToggleSave={toggleSaved} />)}</div>}
        </section>}

        <section className="lower-section" id="diary">
          <div className="diary-card"><div><p className="eyebrow">Keep a record</p><h2>Your listening life,<br /><em>all in one place.</em></h2><p>Rate albums, write reviews, and build a diary that is as personal as your taste.</p><button className="button button-dark" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Explore more albums <span>→</span></button></div><div className="diary-stats"><div><strong>{albums.length}</strong><span>albums loaded</span></div><div><strong>{savedAlbums.size}</strong><span>in watchlist</span></div></div></div>
          <div className="side-panel" id="lists"><p className="eyebrow">Connected source</p><h3>Spotify metadata</h3><p>Album artwork, artists, release dates and links are provided by Spotify.</p><a className="text-link" href="https://developer.spotify.com/documentation/web-api" target="_blank" rel="noreferrer">Read the API docs <span>→</span></a></div>
        </section>
      </main>
      <footer><span>album<span>boxd</span></span><span>For people who listen closely.</span></footer>
    </>
  );
}

export default App;

"use client"; // ESSENCIAL: Isso marca o componente para rodar no navegador

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/app/context/PlayerContext";
import FallbackImage from "@/components/FallbackImage";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Podcast {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  categories: string;
}

interface RawEpisode {
  id: string;
  title: string;
  imageUrl: string;
  audioUrl: string;
  podcast?: {
    id?: string;
    title?: string;
    slug?: string;
    categories?: string;
  };
}

interface Episode {
  id: string;
  title: string;
  imageUrl: string;
  audioUrl: string;
  podcastId: string;
  podcastTitle: string;
  categories: string;
  slug: string;
}

interface EpisodesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type MixedContent =
  | (Podcast & { type: "podcast" })
  | (Episode & { type: "episode" });

interface PodcastGridClientProps {
  initialPodcasts: Podcast[];
  initialEpisodes: RawEpisode[];
  episodesPagination: EpisodesPagination;
  initialCategories: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const INITIAL_ITEMS_LIMIT = 18;
const ITEMS_INCREMENT = 12;
const EPISODES_PER_PAGE = 24;
const SEARCH_DEBOUNCE_MS = 400;

function normalizeEpisode(raw: RawEpisode): Episode {
  return {
    id: raw.id,
    title: raw.title,
    imageUrl: raw.imageUrl,
    audioUrl: raw.audioUrl,
    podcastId: raw.podcast?.id || "",
    podcastTitle: raw.podcast?.title || "",
    categories: raw.podcast?.categories || "",
    slug: raw.podcast?.slug || "",
  };
}

export default function PodcastGridClient({
  initialPodcasts,
  initialEpisodes,
  episodesPagination,
  initialCategories,
}: PodcastGridClientProps) {
  const router = useRouter();
  const { playEpisode, closePlayer } = usePlayer();

  const [allPodcasts] = useState<Podcast[]>(initialPodcasts);
  const [episodes, setEpisodes] = useState<Episode[]>(
    initialEpisodes.map(normalizeEpisode)
  );
  const [episodesPage, setEpisodesPage] = useState(episodesPagination.page);
  const [episodesTotal, setEpisodesTotal] = useState(episodesPagination.total);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  const [categories] = useState<string[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    podcast: true,
    episode: true,
  });

  const [visiblePodcastsCount, setVisiblePodcastsCount] =
    useState(INITIAL_ITEMS_LIMIT);
  const [visibleMixedCount, setVisibleMixedCount] =
    useState(INITIAL_ITEMS_LIMIT);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search query
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  // Fetch episodes from API when search or category changes
  const fetchEpisodes = useCallback(
    async (page: number, search: string, category: string, append: boolean) => {
      setIsLoadingEpisodes(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(EPISODES_PER_PAGE),
        });
        if (search) params.set("search", search);
        if (category) params.set("category", category);

        const res = await fetch(`${API_URL}/api/allEpisodes?${params}`);
        if (!res.ok) throw new Error(`Episodes API error: ${res.status}`);
        const data = await res.json();

        const normalized = (data.data || []).map(normalizeEpisode);
        setEpisodes((prev) => (append ? [...prev, ...normalized] : normalized));
        setEpisodesPage(data.pagination?.page ?? page);
        setEpisodesTotal(data.pagination?.total ?? 0);
      } catch (err) {
        console.error("Failed to fetch episodes:", err);
      } finally {
        setIsLoadingEpisodes(false);
      }
    },
    []
  );

  // Re-fetch from page 1 whenever search or category changes
  useEffect(() => {
    console.log(`[PodcastGridClient] search/category effect: debouncedSearch="${debouncedSearch}" selectedCategory="${selectedCategory}"`);
    setVisibleMixedCount(INITIAL_ITEMS_LIMIT);
    setVisiblePodcastsCount(INITIAL_ITEMS_LIMIT);
    if (activeFilters.podcast && activeFilters.episode && !debouncedSearch && !selectedCategory) return;
    fetchEpisodes(1, debouncedSearch, selectedCategory, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory]);

  // Reset filters when search is cleared
  useEffect(() => {
    if (searchQuery === "") {
      setActiveFilters((prev) => {
        if (prev.podcast && prev.episode) return prev;
        return { podcast: true, episode: true };
      });
    }
    setVisibleMixedCount(INITIAL_ITEMS_LIMIT);
    setVisiblePodcastsCount(INITIAL_ITEMS_LIMIT);
  }, [searchQuery, selectedCategory]);

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Podcast filtering remains client-side (small dataset)
  const filteredPodcasts = useMemo((): Podcast[] => {
    const lowerQuery = debouncedSearch.toLowerCase();
    return allPodcasts
      .filter((podcast) => {
        const titleMatch = podcast.title.toLowerCase().includes(lowerQuery);
        const categoryMatch = selectedCategory
          ? podcast.categories
              ?.toLowerCase()
              .includes(selectedCategory.toLowerCase())
          : true;
        return titleMatch && categoryMatch;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [allPodcasts, debouncedSearch, selectedCategory]);

  const mixedSearchResults = useMemo((): MixedContent[] => {
    if (!debouncedSearch) return [];

    const podcastsWithType: MixedContent[] = filteredPodcasts.map((p) => ({
      ...p,
      type: "podcast",
    }));
    const episodesWithType: MixedContent[] = episodes.map((e) => ({
      ...e,
      type: "episode",
    }));

    return [...podcastsWithType, ...episodesWithType].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [filteredPodcasts, episodes, debouncedSearch]);

  const finalFilteredItems = useMemo((): MixedContent[] => {
    if (!activeFilters.podcast && !activeFilters.episode) return [];
    if (activeFilters.podcast && activeFilters.episode) return mixedSearchResults;
    return mixedSearchResults.filter((item) => activeFilters[item.type]);
  }, [mixedSearchResults, activeFilters]);

  const itemsToDisplay = useMemo(
    () => finalFilteredItems.slice(0, visibleMixedCount),
    [finalFilteredItems, visibleMixedCount]
  );

  const podcastsToDisplay = useMemo(
    () => filteredPodcasts.slice(0, visiblePodcastsCount),
    [filteredPodcasts, visiblePodcastsCount]
  );

  const handleCardClick = (item: MixedContent) => {
    if (item.type === "podcast") {
      router.push(`/episodes/${item.slug}`);
      closePlayer();
    } else {
      const episodeIndex = episodes.findIndex((e) => e.id === item.id);
      if (episodeIndex !== -1) {
        playEpisode(episodes, episodeIndex);
      }
    }
  };

  const handleEpisodeClick = (episode: Episode) => {
    const index = episodes.findIndex((e) => e.id === episode.id);
    if (index !== -1) {
      playEpisode(episodes, index);
    }
  };

  const handleLoadMoreEpisodes = () => {
    const nextPage = episodesPage + 1;
    fetchEpisodes(nextPage, debouncedSearch, selectedCategory, true);
  };

  const handleFilterToggle = (filterType: "podcast" | "episode") => {
    setActiveFilters((currentFilters) => {
      const nextFilters = {
        ...currentFilters,
        [filterType]: !currentFilters[filterType],
      };
      if (!nextFilters.podcast && !nextFilters.episode) return currentFilters;
      return nextFilters;
    });
  };

  const hasMoreEpisodes = episodesPage * EPISODES_PER_PAGE < episodesTotal;

  return (
    <div>
      <div className="search-section">
        <h2>Browse podcasts</h2>
        <div className="second-search-parent">
          <div className="second-search-bar">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              id="search-input"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {capitalizeFirstLetter(cat)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="main-parent">
        <p className="filter-text">Filter results by type:</p>
        <div className="filter-buttons">
          <button onClick={() => handleFilterToggle("podcast")}>
            <div
              className="checkbox"
              style={
                activeFilters.podcast ? { backgroundColor: "#4e4e4eff" } : {}
              }
            >
              <FontAwesomeIcon
                icon={faCheck}
                style={
                  activeFilters.podcast
                    ? { display: "inline-flex" }
                    : { display: "none" }
                }
              />
            </div>
            Podcasts
            <span>{filteredPodcasts.length}</span>
          </button>
          <button onClick={() => handleFilterToggle("episode")}>
            <div
              className="checkbox"
              style={
                activeFilters.episode ? { backgroundColor: "#4e4e4eff" } : {}
              }
            >
              <FontAwesomeIcon
                icon={faCheck}
                style={
                  activeFilters.episode
                    ? { display: "inline-flex" }
                    : { display: "none" }
                }
              />
            </div>
            Episodes
            <span>{episodesTotal}</span>
          </button>
        </div>

        {debouncedSearch.length > 0 ? (
          /* --- SEARCH RESULTS VIEW --- */
          <div className="grid-section">
            <div className="count">
              <div className="channels">Results</div>
              <p id="channel-count">
                {`Showing ${itemsToDisplay.length} of ${finalFilteredItems.length} results`}
              </p>
            </div>

            <div id="mixedList" className="podcastList">
              {itemsToDisplay.length > 0 ? (
                itemsToDisplay.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="podcast-card"
                    onClick={() => handleCardClick(item)}
                  >
                    <FallbackImage
                      src={`${API_URL}${item.imageUrl}`}
                      alt={item.title}
                      width={150}
                      height={150}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="podcast-details">
                      <h3>
                        <strong
                          style={{
                            fontSize: "0.8em",
                            color: "#888",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {item.type === "podcast" ? "PODCAST" : "EPISODE"}
                        </strong>
                        {item.title}
                      </h3>
                      <div className="categories">
                        {item.categories?.split(",").map((cat) => (
                          <span key={cat} className="category-tag">
                            {capitalizeFirstLetter(cat.trim())}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : isLoadingEpisodes ? (
                <p>Searching...</p>
              ) : (
                <p>No results found for {`"${debouncedSearch}"`}.</p>
              )}
            </div>

            {visibleMixedCount < finalFilteredItems.length && (
              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                  onClick={() =>
                    setVisibleMixedCount((c) => c + ITEMS_INCREMENT)
                  }
                  className="see-more-button"
                >
                  See more
                </button>
              </div>
            )}
          </div>
        ) : (
          /* --- DEFAULT BROWSE VIEW --- */
          <>
            <div className="grid-section">
              <div className="count">
                <div className="channels">Podcasts</div>
                <p id="channel-count">
                  {`Showing ${podcastsToDisplay.length} of ${filteredPodcasts.length}`}
                </p>
              </div>
              <div id="podcastList" className="podcastList">
                {podcastsToDisplay.map((item) => (
                  <div
                    key={`podcast-${item.id}`}
                    className="podcast-card"
                    onClick={() =>
                      handleCardClick({ ...item, type: "podcast" })
                    }
                  >
                    <FallbackImage
                      src={`${API_URL}${item.imageUrl}`}
                      alt={item.title}
                      width={150}
                      height={150}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="podcast-details">
                      <h3>{item.title}</h3>
                      <div className="categories">
                        {item.categories?.split(",").map((cat) => (
                          <span key={cat} className="category-tag">
                            {capitalizeFirstLetter(cat.trim())}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {visiblePodcastsCount < filteredPodcasts.length && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <button
                    onClick={() =>
                      setVisiblePodcastsCount((c) => c + ITEMS_INCREMENT)
                    }
                    className="see-more-button"
                  >
                    See More
                  </button>
                </div>
              )}
            </div>

            <div className="grid-section" style={{ marginTop: "3rem" }}>
              <div className="count">
                <div className="channels">Episodes</div>
                <p id="channel-count">
                  {`Showing ${episodes.length} of ${episodesTotal}`}
                </p>
              </div>
              <div id="episodeList" className="podcastList">
                {episodes.map((item) => (
                  <div
                    key={`episode-${item.id}`}
                    className="podcast-card"
                    onClick={() => handleEpisodeClick(item)}
                  >
                    <FallbackImage
                      src={`${API_URL}${item.imageUrl}`}
                      alt={item.title}
                      width={150}
                      height={150}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="podcast-details">
                      <h3>{item.title}</h3>
                      {item.podcastTitle && (
                        <p style={{ fontSize: "0.8em", color: "#888", margin: "2px 0" }}>
                          {item.podcastTitle}
                        </p>
                      )}
                      <div className="categories">
                        {item.categories?.split(",").map((cat) => (
                          <span key={cat} className="category-tag">
                            {capitalizeFirstLetter(cat.trim())}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreEpisodes && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <button
                    onClick={handleLoadMoreEpisodes}
                    className="see-more-button"
                    disabled={isLoadingEpisodes}
                  >
                    {isLoadingEpisodes ? "Loading..." : "See More"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

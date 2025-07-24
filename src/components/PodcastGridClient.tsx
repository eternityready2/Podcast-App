"use client"; // ESSENCIAL: Isso marca o componente para rodar no navegador

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/app/context/PlayerContext";
import Image from "next/image";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Defina as interfaces aqui também para o componente saber o formato dos dados
interface Podcast {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  categories: string;
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
type MixedContent =
  | (Podcast & { type: "podcast" })
  | (Episode & { type: "episode" });

// Props que o componente receberá do Componente de Servidor
interface PodcastGridClientProps {
  initialPodcasts: Podcast[];
  initialEpisodes: Episode[];
  initialCategories: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const INITIAL_ITEMS_LIMIT = 18;
const ITEMS_INCREMENT = 12;

// O componente agora recebe os dados iniciais como props
export default function PodcastGridClient({
  initialPodcasts,
  initialEpisodes,
  initialCategories,
}: PodcastGridClientProps) {
  const router = useRouter();
  const { playEpisode, closePlayer } = usePlayer();

  // O estado agora é populado com as props iniciais.
  // A busca de dados não acontece mais aqui!
  const [allPodcasts] = useState<Podcast[]>(initialPodcasts);
  const [allEpisodes] = useState<Episode[]>(initialEpisodes);
  const [categories] = useState<string[]>(initialCategories);

  // Toda a sua lógica de estado para filtros e interatividade continua aqui
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    podcast: true,
    episode: true,
  });

  const [visiblePodcastsCount, setVisiblePodcastsCount] =
    useState(INITIAL_ITEMS_LIMIT);
  const [visibleEpisodesCount, setVisibleEpisodesCount] =
    useState(INITIAL_ITEMS_LIMIT);
  const [visibleMixedCount, setVisibleMixedCount] =
    useState(INITIAL_ITEMS_LIMIT);

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    setVisiblePodcastsCount(INITIAL_ITEMS_LIMIT);
    setVisibleEpisodesCount(INITIAL_ITEMS_LIMIT);
    setVisibleMixedCount(INITIAL_ITEMS_LIMIT);
    if (searchQuery === "") {
      setActiveFilters({
        podcast: true,
        episode: true,
      });
    }
  }, [searchQuery, selectedCategory]);

  const filteredPodcasts = useMemo((): Podcast[] => {
    const lowerQuery = searchQuery.toLowerCase();
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
  }, [allPodcasts, searchQuery, selectedCategory]);

  const filteredEpisodes = useMemo((): Episode[] => {
    const lowerQuery = searchQuery.toLowerCase();
    return allEpisodes
      .filter((episode) => {
        const titleMatch = episode.title.toLowerCase().includes(lowerQuery);
        const categoryMatch = selectedCategory
          ? episode.categories
              ?.toLowerCase()
              .includes(selectedCategory.toLowerCase())
          : true;
        return titleMatch && categoryMatch;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [allEpisodes, searchQuery, selectedCategory]);

  const mixedSearchResults = useMemo((): MixedContent[] => {
    if (!searchQuery) return [];

    const podcastsWithType: MixedContent[] = filteredPodcasts.map((p) => ({
      ...p,
      type: "podcast",
    }));
    const episodesWithType: MixedContent[] = filteredEpisodes.map((e) => ({
      ...e,
      type: "episode",
    }));

    return [...podcastsWithType, ...episodesWithType].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [filteredPodcasts, filteredEpisodes, searchQuery]);

  const finalFilteredItems = useMemo((): MixedContent[] => {
    // Se nenhum filtro estiver ativo, não mostre nada.
    if (!activeFilters.podcast && !activeFilters.episode) {
      return [];
    }

    // Se ambos estiverem ativos, mostre todos os resultados da busca.
    if (activeFilters.podcast && activeFilters.episode) {
      return mixedSearchResults;
    }

    // Filtra com base no objeto de filtros ativos.
    return mixedSearchResults.filter((item) => activeFilters[item.type]);
  }, [mixedSearchResults, activeFilters]);

  const itemsToDisplay = useMemo(
    () => finalFilteredItems.slice(0, visibleMixedCount),
    [finalFilteredItems, visibleMixedCount]
  );

  const podcastsToDisplay = useMemo(() => {
    return filteredPodcasts.slice(0, visiblePodcastsCount);
  }, [filteredPodcasts, visiblePodcastsCount]);

  const episodesToDisplay = useMemo(() => {
    return filteredEpisodes.slice(0, visibleEpisodesCount);
  }, [filteredEpisodes, visibleEpisodesCount]);

  const handleCardClick = (item: MixedContent) => {
    if (item.type === "podcast") {
      router.push(`/episodes/${item.slug}`);
      closePlayer();
    } else {
      const episodeIndex = allEpisodes.findIndex((e) => e.id === item.id);
      if (episodeIndex !== -1) {
        playEpisode(allEpisodes, episodeIndex);
      } else {
        console.error("Erro: Episódio não encontrado na lista global.");
      }
    }
  };

  const handleFilterToggle = (filterType: "podcast" | "episode") => {
    setActiveFilters((currentFilters) => {
      // Calcula o próximo estado
      const nextFilters = {
        ...currentFilters,
        [filterType]: !currentFilters[filterType],
      };

      // Trava de segurança: Se ambos os filtros estiverem prestes a se tornar falsos,
      // não permita a mudança. Pelo menos um deve estar sempre ativo.
      if (!nextFilters.podcast && !nextFilters.episode) {
        return currentFilters; // Retorna o estado anterior sem alteração
      }

      return nextFilters;
    });
  };

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
          <button
            onClick={() => handleFilterToggle("podcast")}
            // Aplica um estilo se o filtro de podcast estiver ativo
            // style={activeFilters.podcast ? { fontWeight: "bold" } : {}}
          >
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
          <button
            onClick={() => handleFilterToggle("episode")}
            // Aplica um estilo se o filtro de episódio estiver ativo
            // style={activeFilters.episode ? { fontWeight: "bold" } : {}}
          >
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
            <span>{filteredEpisodes.length}</span>
          </button>
        </div>
        {searchQuery.length > 0 ? (
          /* --- CENÁRIO 1: EXIBINDO RESULTADOS DA BUSCA --- */
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
                    <Image
                      src={`${API_URL}${item.imageUrl}`}
                      alt={item.title}
                      width={150}
                      height={150}
                      style={{ objectFit: "cover" }}
                      priority
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
              ) : (
                <p>No results found for {`"${searchQuery}"`}.</p>
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
          /* --- CENÁRIO 2: EXIBIÇÃO PADRÃO (SEM BUSCA) --- */
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
                    <Image
                      src={`${API_URL}${item.imageUrl}`}
                      alt={item.title}
                      width={150}
                      height={150}
                      style={{ objectFit: "cover" }}
                      priority
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

            {filteredEpisodes.length > 0 && (
              <div className="grid-section" style={{ marginTop: "3rem" }}>
                <div className="count">
                  <div className="channels">Episodes</div>
                  <p id="channel-count">
                    {`Showing ${episodesToDisplay.length} of ${filteredEpisodes.length}`}
                  </p>
                </div>
                <div id="episodeList" className="podcastList">
                  {episodesToDisplay.map((item) => (
                    <div
                      key={`episode-${item.id}`}
                      className="podcast-card"
                      onClick={() =>
                        handleCardClick({ ...item, type: "episode" })
                      }
                    >
                      <Image
                        src={`${API_URL}${item.imageUrl}`}
                        alt={item.title}
                        width={150}
                        height={150}
                        style={{ objectFit: "cover" }}
                        priority
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
                {visibleEpisodesCount < filteredEpisodes.length && (
                  <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <button
                      onClick={() =>
                        setVisibleEpisodesCount((c) => c + ITEMS_INCREMENT)
                      }
                      className="see-more-button"
                    >
                      See More
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

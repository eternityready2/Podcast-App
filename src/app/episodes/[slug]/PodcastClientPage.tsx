"use client";

import { useCallback, useEffect, useState } from "react";
import FallbackImage from "@/components/FallbackImage";
import EpisodeCard from "@/components/episodeCard";
import Link from "next/link";
import SplideSlider from "@/components/splideSlider";
// import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Podcast {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  categories: string;
}

interface PodcastItem {
  slug: string;
  imageUrl: string;
  title: string;
  categories: string;
}

interface Episode {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
  releaseDate: string;
  episode: number;
  season: number;
}

interface PodcastClientPageProps {
  slug: string;
  initialPodcast: Podcast | null;
  initialTotalEpisodes: number;
  initialSeasons: { count: number; hasUnknown: boolean };
  latestPodcastsData: PodcastItem[];
}

function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function PodcastClientPage({
  slug,
  initialPodcast,
  initialTotalEpisodes,
  initialSeasons,
  latestPodcastsData,
}: PodcastClientPageProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(
    null
  );

  const handlePlayPause = (episodeId: number) => {
    setCurrentlyPlayingId((currentId) =>
      currentId === episodeId ? null : episodeId
    );
  };

  // Função para buscar episódios, memorizada com useCallback para otimização
  const fetchAllEpisodesForSeason = useCallback(
    async (season: number) => {
      console.log(`[PodcastClientPage] fetchAllEpisodesForSeason called, season=${season}`);
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/episodes/${slug}?season=${season}&limit=9999`
        );
        const result = await response.json();

        if (response.ok) {
          setEpisodes(result.data);
        } else {
          console.error("Failed searching episodes:", result.error);
        }
      } catch (error) {
        console.error("Error requesting episodes:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    console.log(`[PodcastClientPage] MOUNTED slug=${slug}`);
    return () => console.log(`[PodcastClientPage] UNMOUNTED slug=${slug}`);
  }, [slug]);

  useEffect(() => {
    console.log(`[PodcastClientPage] seasons effect: count=${initialSeasons.count} hasUnknown=${initialSeasons.hasUnknown}`);
    if (initialSeasons.count > 0) {
      setSelectedSeason(initialSeasons.count);
    } else if (initialSeasons.hasUnknown) {
      setSelectedSeason(0);
    }
  }, [initialSeasons.count, initialSeasons.hasUnknown]);

  useEffect(() => {
    if (selectedSeason !== null) {
      fetchAllEpisodesForSeason(selectedSeason);
    }
  }, [selectedSeason, fetchAllEpisodesForSeason]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = parseInt(e.target.value, 10);
    setSelectedSeason(newSeason);
  };

  // --- RENDER ---
  if (!initialPodcast) {
    return <div>Loading podcast...</div>;
  }

  return (
    <main>
      <div className="container">
        <div className="podcast-section">
          <div className="podcast-header">
            <div className="podcast-image-wrap">
              <FallbackImage
                src={`${API_URL}${initialPodcast.imageUrl}`}
                alt={initialPodcast.title}
                className="podcast-image"
                width={200}
                height={200}
                priority
              />
            </div>
            <div className="podcast-info">
              <h1 className="podcast-title">{initialPodcast.title}</h1>
              <div
                className="podcast-description"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(initialPodcast.description) }}
              />
              <div>
                <span>
                  Seasons: <span>{initialSeasons.count}</span>
                </span>{" "}
                <span>
                  Episodes: <span>{initialTotalEpisodes}</span>
                </span>
              </div>
              <div id="podcast-categories">
                {initialPodcast.categories?.split(",").map((cat) => (
                  <Link
                    href={`/?category=${encodeURIComponent(cat.trim())}`}
                    key={cat}
                    style={{ marginRight: "8px" }}
                  >
                    {cat.trim()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SplideSlider type="latestPodcasts" data={latestPodcastsData} />

        <div className="seasons-wrap" id="seasons-wrap">
          <label htmlFor="seasons-dropdown">Select Season:</label>
          <select
            id="seasons-dropdown"
            value={selectedSeason ?? ""}
            onChange={handleSeasonChange}
          >
            {Array.from({ length: initialSeasons.count }, (_, i) => i + 1).map(
              (seasonNum) => (
                <option key={seasonNum} value={seasonNum}>
                  Season {seasonNum}
                </option>
              )
            )}
            {initialSeasons.hasUnknown && (
              <option value={0}>
                {initialSeasons.count > 0 ? "Extras" : "All Episodes"}
              </option>
            )}
          </select>
          <div id="season-total-episodes">{initialTotalEpisodes} episodes</div>
        </div>

        {isLoading ? (
          <div id="loading">
            <p>Loading episodes...</p>
          </div>
        ) : (
          <div id="episodes-container">
            {episodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                apiUrl={API_URL}
                isPlaying={currentlyPlayingId === episode.id}
                onPlayClick={() => handlePlayPause(episode.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

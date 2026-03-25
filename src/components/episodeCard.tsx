"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

interface EpisodeCardProps {
  episode: Episode;
  apiUrl: string;
  isPlaying: boolean;
  onPlayClick: () => void;
}

function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
}

// Função para formatar a data como no seu script original
const formatDate = (dateString: string) => {
  const releaseDate = new Date(dateString);
  return releaseDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeInSeconds: number) => {
  if (!timeInSeconds) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default function EpisodeCard({
  episode,
  apiUrl,
  isPlaying,
  onPlayClick,
}: EpisodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const trackingSessionRef = useRef<any>(null);
  const handlePlayClick = () => {
    onPlayClick();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const progressContainer = e.currentTarget;
    const clickPositionX = e.nativeEvent.offsetX;
    const width = progressContainer.clientWidth;
    const newTime = (clickPositionX / width) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => console.error("Error playing:", error));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    // const handleAudioEnd = () => setIsPlaying(false);
    const handleAudioEnd = () => onPlayClick();

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleAudioEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleAudioEnd);
    };
  }, [audioRef, onPlayClick]);

  useEffect(() => {
    if (!isPlaying || !episode) return;
    if (typeof window === "undefined") return;

    const mediaTitle = (episode as any)?.podcastTitle?.trim() || episode.title?.trim();
    const rawCategories = (episode as any)?.categories || "";
    const mediaData = {
      origin: "podcast",
      categories: typeof rawCategories === "string"
        ? rawCategories.split(",").map((c: string) => c.trim()).filter(Boolean)
        : rawCategories,
    };

    try {
      const globalUserTracking = getTracking()
      const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
      const previousTitle = sessionStorage.getItem("lastTitle");
      
      const trackingSession =
        globalUserTracking["sessions"]?.[mediaTitle] ?? {
          origin: mediaData.origin,
          categories: mediaData.categories,
          total_consumption_seconds: 0,
          timestamps: [],
          metadata: {
            device: [],
            average_watch_seconds: 0,
            referrers: {},
          },
        };

      if (previousTitle && previousTitle !== mediaTitle) {
        const referrers = trackingSession.metadata.referrers;
        referrers[previousTitle] = (referrers[previousTitle] ?? 0) + 1;
      }
      sessionStorage.setItem("lastTitle", mediaTitle);

      trackingSession.metadata.device.push(deviceType);
      trackingSession.timestamps.push({ start: Date.now() });

      trackingSessionRef.current = trackingSession;
      globalUserTracking.sessions[mediaTitle] = trackingSession;
      setTracking(globalUserTracking);

      const finalizeTracking = () => {
        if (!trackingSessionRef.current?.timestamps?.length) return;
        const ts = trackingSessionRef.current.timestamps;
        const last = ts[ts.length - 1];
        if (!last.end) {
          last.end = Date.now();
          const duration = (last.end - last.start) / 1000;
          trackingSessionRef.current.total_consumption_seconds += duration;
          trackingSessionRef.current.metadata.average_watch_seconds = 
            trackingSessionRef.current.total_consumption_seconds / ts.length;

          const finalTracking = getTracking();
          finalTracking.sessions[mediaTitle] = trackingSessionRef.current;
          setTracking(finalTracking);
        }
      };

      window.addEventListener('beforeunload', finalizeTracking);
      audioRef.current?.addEventListener('ended', finalizeTracking);

      return () => {
        window.removeEventListener('beforeunload', finalizeTracking);
        audioRef.current?.removeEventListener('ended', finalizeTracking);
        finalizeTracking();
      };
    } catch (error) {
      console.error("EpisodeCard tracking error:", error);
    }
  }, [isPlaying, episode]);
  return (
    <div className={`episode-section ${isPlaying ? "playing" : ""}`}>
      <div className="episode-image-wrap-outer">
        <div className="episode-image-wrap">
          <Image
            className="episode-image"
            src={`${apiUrl}${episode.imageUrl}`}
            alt={episode.title || "Episode Cover"}
            width={150}
            height={150}
          />
          <div className="play-overlay play-pause" onClick={handlePlayClick}>
            {isPlaying ? (
              <FontAwesomeIcon icon={faPause} size="2x" />
            ) : (
              <FontAwesomeIcon icon={faPlay} size="2x" />
            )}
          </div>
        </div>

        {/* --- Bloco Mobile --- */}
        <div className="mobile-details">
          {episode.episode > 0 && (
            <div className="episode-number">Episode: {episode.episode}</div>
          )}
          <div className="mobile-title">{episode.title}</div>
          <div className="play-btn play-pause" onClick={handlePlayClick}>
            {isPlaying ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </div>
          <div className="audio-player">
            <div className="progress-container">
              <div
                className="progress"
                id={`progress-mobile-${episode.id}`}
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
            </div>
            <div className="time-duration">
              <span
                className="current-time"
                id={`current-time-mobile-${episode.id}`}
              >
                {formatTime(currentTime)}
              </span>
              /
              <span className="duration" id={`duration-mobile-${episode.id}`}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Bloco Desktop --- */}
      <div className="episode-details">
        <div className="episode">
          {episode.episode > 0 && (
            <div className="episode-number">Episode: {episode.episode}</div>
          )}
          <div className={`playing-bars ${isPlaying ? "playing" : ""}`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bar"></div>
            ))}
          </div>
          <div className="episode-player">
            <div className="audio-player">
              <audio
                ref={audioRef}
                id={`audio-${episode.id}`}
                src={episode.audioUrl}
                preload="metadata"
              ></audio>
              <div className="progress-container" onClick={handleProgressClick}>
                <div
                  className="progress"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                ></div>
              </div>
              <div className="time-duration">
                <span className="current-time">{formatTime(currentTime)}</span>/
                <span className="duration">{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
        <div className="episode-title">{episode.title}</div>
        <div
          className={`episode-description ${isExpanded ? "expanded" : ""}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(episode.description) }}
        />
        <div className="episode-date">
          <div>{formatDate(episode.releaseDate)}</div>
          <button
            className="read-more"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ display: "block" }} // Idealmente, isso também seria controlado por lógica/CSS
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        </div>
      </div>
    </div>
  );
}

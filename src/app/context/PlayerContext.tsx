"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

interface Episode {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
  podcastTitle?: string;
}

interface PlayerContextData {
  playlist: Episode[];
  currentEpisodeIndex: number;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  playEpisode: (playlist: Episode[], index: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  closePlayer: () => void;
  mutePlayer: () => void;
  isPlayerVisible: boolean;
  isMuted: boolean;
}

const PlayerContext = createContext({} as PlayerContextData);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Episode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentEpisode =
    currentEpisodeIndex >= 0 ? playlist[currentEpisodeIndex] : null;

  useEffect(() => {
    if (!currentEpisode) return;

    const audio = audioRef.current;
    const mediaTitle = (currentEpisode as any)?.podcastTitle?.trim() || currentEpisode.title?.trim();
    const rawCategories = (currentEpisode as any)?.categories || "";
    const mediaData = {
      origin: "podcast",
      categories: typeof rawCategories === "string"
        ? rawCategories.split(",").map((c: string) => c.trim()).filter(Boolean)
        : rawCategories,
    };

    try {
      if (typeof getTracking !== "function") return;

      const deviceType = /Mobi|Android/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop";

      const globalUserTracking = getTracking()
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

      // Sync categoriesConsumed in localStorage for the recommendation engine
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem("categoriesConsumed");
        let categoriesConsumed: Record<string, number> = {};
        try {
          categoriesConsumed = stored ? JSON.parse(stored) : {};
        } catch { /* corrupted localStorage, reset */ }
        for (const cat of mediaData.categories) {
          categoriesConsumed[cat] = (categoriesConsumed[cat] ?? 0) + 1;
        }
        localStorage.setItem("categoriesConsumed", JSON.stringify(categoriesConsumed));
      }

      // Report community engagement for podcast plays
      if (typeof reportCommunityEngagement === "function") {
        reportCommunityEngagement(mediaTitle, "podcasts", "play");
      }

      if (isPlaying && audio) {
        audio.src = currentEpisode.audioUrl;
        audio.muted = isMuted;
        const playPromise = audio.play();
        playPromise?.catch((error) => {
          console.error("Failed to play:", error);
          setIsPlaying(false);
        });
      }

      const finalizeTracking = () => {
        const ts = trackingSession.timestamps;
        const last = ts[ts.length - 1];
        if (!last.end) last.end = Date.now();

        const duration = (last.end - last.start) / 1000;
        trackingSession.total_consumption_seconds += duration;
        const totalSegments = ts.length;
        trackingSession.metadata.average_watch_seconds =
          trackingSession.total_consumption_seconds / totalSegments;

        globalUserTracking.sessions[mediaTitle] = trackingSession;
        (window as any).globalUserTracking = globalUserTracking;
        setTracking(globalUserTracking);
      };

      window.addEventListener("beforeunload", finalizeTracking);
      audio?.addEventListener("ended", finalizeTracking);

      return () => {
        window.removeEventListener("beforeunload", finalizeTracking);
        audio?.removeEventListener("ended", finalizeTracking);
        finalizeTracking();
      };
    } catch (error) {
      console.error("Tracking error:", error);
    }
  }, [currentEpisode, isPlaying, isMuted]);

  const playEpisode = useCallback((newPlaylist: Episode[], index: number) => {
    setPlaylist(newPlaylist);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
    setIsPlayerVisible(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    setIsPlaying((prev) => {
      if (prev) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      return !prev;
    });
  }, []);

  const playNext = useCallback(() => {
    setPlaylist((pl) => {
      setCurrentEpisodeIndex((prev) => (prev + 1 < pl.length ? prev + 1 : prev));
      return pl;
    });
  }, []);

  const playPrev = useCallback(() => {
    setCurrentEpisodeIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const closePlayer = useCallback(() => {
    setIsPlaying(false);
    setIsPlayerVisible(false);
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  }, []);

  const mutePlayer = useCallback(() => {
    if (!audioRef.current) return;
    setIsMuted((prev) => {
      audioRef.current!.muted = !prev;
      return !prev;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      playlist,
      currentEpisodeIndex,
      currentEpisode,
      isPlaying,
      playEpisode,
      togglePlayPause,
      playNext,
      playPrev,
      closePlayer,
      isPlayerVisible,
      mutePlayer,
      isMuted,
    }),
    [
      playlist,
      currentEpisodeIndex,
      currentEpisode,
      isPlaying,
      playEpisode,
      togglePlayPause,
      playNext,
      playPrev,
      closePlayer,
      isPlayerVisible,
      mutePlayer,
      isMuted,
    ]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      <audio
        ref={audioRef}
        onEnded={playNext}
      />
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  return useContext(PlayerContext);
};

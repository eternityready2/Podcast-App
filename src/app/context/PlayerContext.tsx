"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useEffect,
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
  const [isMuted, SetIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentEpisode =
    currentEpisodeIndex >= 0 ? playlist[currentEpisodeIndex] : null;

  useEffect(() => {
    if (!currentEpisode) return;

    const audio = audioRef.current;
    console.log('Podcast', currentEpisode?.podcast?.title?.trim(), 'currentEpisode', currentEpisode);
    const mediaTitle = currentEpisode?.podcast?.title?.trim();
    const mediaData = {
      origin: "podcast",
      categories: currentEpisode.podcast.keywords.split(',') ?? [],
    };

    try {
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
  }, [currentEpisode, isPlaying]);

  function playEpisode(newPlaylist: Episode[], index: number) {
    setPlaylist(newPlaylist);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
    setIsPlayerVisible(true);
  }

  function togglePlayPause() {
    if (!currentEpisode) return;
    setIsPlaying(!isPlaying);

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      console.log("pause");
    } else {
      audioRef.current.play();
      console.log("play");
    }
  }

  function playNext() {
    const nextIndex = currentEpisodeIndex + 1;
    if (nextIndex < playlist.length) {
      setCurrentEpisodeIndex(nextIndex);
    }
  }

  function playPrev() {
    const prevIndex = currentEpisodeIndex - 1;
    if (prevIndex >= 0) {
      setCurrentEpisodeIndex(prevIndex);
    }
  }

  function closePlayer() {
    setIsPlaying(false);
    setIsPlayerVisible(false);
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  }

  function mutePlayer() {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    SetIsMuted(!isMuted);
  }

  return (
    <PlayerContext.Provider
      value={{
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
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentEpisode?.audioUrl}
        onEnded={playNext}
        autoPlay
      />
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  return useContext(PlayerContext);
};

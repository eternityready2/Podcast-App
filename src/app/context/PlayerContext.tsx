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
    if (!currentEpisode) {
      return;
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.src = currentEpisode.audioUrl;
      const playPromise = audioRef.current.play();
      audioRef.current.muted = false;

      // O método .play() retorna uma Promise. É uma boa prática tratá-la.
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Erro ao tentar reproduzir o áudio:", error);
          // Opcional: pausar o estado se a reprodução automática falhar
          setIsPlaying(false);
        });
      }
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

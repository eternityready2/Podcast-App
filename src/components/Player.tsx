"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faBackward,
  faForward,
  faClose,
  faVolumeHigh,
  faVolumeOff,
} from "@fortawesome/free-solid-svg-icons";
import { usePlayer } from "@/app/context/PlayerContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Player() {
  const {
    currentEpisode,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrev,
    closePlayer,
    isPlayerVisible,
    mutePlayer,
    isMuted,
  } = usePlayer();

  if (!isPlayerVisible || !currentEpisode) {
    return null;
  }

  return (
    <div id="player-bar" className={isPlayerVisible ? "ativo" : ""}>
      <div className="song-details">
        {currentEpisode.imageUrl && (
          <Image
            src={`${API_URL}${currentEpisode.imageUrl}`}
            alt="Episode image"
            className="album-art-bar"
            width={50}
            height={50}
          />
        )}
        <div className="song-info-bar">
          <h3>{currentEpisode.title}</h3>
          <p>{currentEpisode.podcastTitle || "Podcast"}</p>
        </div>
      </div>

      <div className="player-core-controls">
        <div className="controls">
          <button onClick={playPrev} className="control-btn">
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button onClick={togglePlayPause} className="control-btn play-btn">
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button onClick={playNext} className="control-btn">
            <FontAwesomeIcon icon={faForward} />
          </button>
        </div>
      </div>

      <div className="extra-controls">
        <FontAwesomeIcon
          icon={isMuted ? faVolumeOff : faVolumeHigh}
          onClick={mutePlayer}
          id="mute"
        />{" "}
        <FontAwesomeIcon icon={faClose} onClick={closePlayer} id="close" />
      </div>
    </div>
  );
}

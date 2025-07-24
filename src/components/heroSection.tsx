"use client";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { usePlayer } from "@/app/context/PlayerContext";

interface SlideData {
  key: string;
  type: "youtube" | "video" | "image";
  src: string;
}

const slidesData: SlideData[] = [
  // { key: "slide1", type: "youtube", src: "edNXYYZYYV8" },
  {
    key: "slide1",
    type: "image",
    src: "/herobg.png",
  },
  {
    key: "slide2",
    type: "video",
    src: "/optimizedVideo.mp4",
  },
  {
    key: "slide3",
    type: "image",
    src: "/herobg.png",
  },
  // { key: "slide4", type: "youtube", src: "_7qr2NcJhA0" },
];

// Interface para nosso controlador de mídia unificado
interface PlayerControl {
  play: () => void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  seek: (time: number) => void;
  destroy?: () => void;
}

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const { isPlayerVisible } = usePlayer();

  // 2. REFS PARA CONTROLADORES E ELEMENTOS
  // Este ref guardará nossos controladores unificados ({ play, pause, etc. })
  const playerControlsRef = useRef<PlayerControl[]>([]);
  // Este ref guardará os elementos <video> para controle direto
  const videoElementRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  }, []);

  // 3. useEffect PRINCIPAL PARA INICIALIZAÇÃO
  useEffect(() => {
    const initializePlayers = () => {
      if (slidesData.length <= 1) return;

      slidesData.forEach((slide, index) => {
        if (slide.type === "youtube") {
          new window.YT.Player(`player-${index}`, {
            videoId: slide.src,
            playerVars: {
              autoplay: 0,
              controls: 0,
              mute: 1,
              playlist: slide.src,
              playsinline: 1,
            },
            events: {
              onReady: (event) => {
                // Cria o controlador unificado para o player do YouTube
                playerControlsRef.current[index] = {
                  play: () => event.target.playVideo(),
                  pause: () => event.target.pauseVideo(),
                  mute: () => event.target.mute(),
                  unmute: () => event.target.unMute(),
                  seek: (time) => event.target.seekTo(time, true),
                };
                // Se for o primeiro slide, inicia o slider e dá play
                if (index === 0) {
                  playerControlsRef.current[0].play();
                }
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  goToNextSlide();
                }
              },
            },
          });
        } else if (slide.type === "video") {
          const videoElement = videoElementRefs.current[index];
          if (videoElement) {
            playerControlsRef.current[index] = {
              play: () => {
                if (videoElement.readyState >= 2) {
                  videoElement
                    .play()
                    .catch((e) => console.warn("Erro ao dar play:", e));
                } else {
                  videoElement.oncanplay = () =>
                    videoElement
                      .play()
                      .catch((e) => console.warn("Erro ao dar play:", e));
                }
              },
              pause: () => videoElement.pause(),
              mute: () => (videoElement.muted = true),
              unmute: () => (videoElement.muted = false),
              seek: (time) => (videoElement.currentTime = time),
            };
          }
        } else if (slide.type === "image") {
          // Imagens não têm controles, então criamos funções vazias
          playerControlsRef.current[index] = {
            play: () => {},
            pause: () => {},
            mute: () => {},
            unmute: () => {},
            seek: () => {},
          };
        }
      });

      // Se o primeiro slide não for YouTube, inicia o intervalo aqui
      if (slidesData[0].type !== "youtube") {
        playerControlsRef.current[0]?.play();
      }
    };

    // Carrega a API do YouTube apenas se for necessário
    if (slidesData.some((slide) => slide.type === "youtube")) {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => initializePlayers();
      } else {
        initializePlayers();
      }
    } else {
      initializePlayers();
    }

    // const startSliderInterval = () => {
    //   if (intervalRef.current) clearInterval(intervalRef.current);
    //   intervalRef.current = setInterval(() => {
    //     setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    //   }, 15000);
    // };

    const controls = playerControlsRef.current;
    const videoElements = videoElementRefs.current;

    return () => {
      if (imageTimerRef.current) clearInterval(imageTimerRef.current);

      controls.forEach((control) => {
        control.pause();
        control.destroy?.();
      });

      videoElements.forEach((videoEl) => {
        if (videoEl) {
          videoEl.pause();
          // videoEl.src = "";
          // videoEl.removeAttribute("src"); // Garante a remoção
          videoEl.load();
        }
      });
    };
  }, [goToNextSlide]);

  useEffect(() => {
    if (imageTimerRef.current) clearTimeout(imageTimerRef.current);

    playerControlsRef.current.forEach((control, index) => {
      if (!control) return;

      if (index === currentSlide) {
        control.seek(0); // Reinicia a mídia
        // control.unmute();
        control.play();
      } else {
        control.pause();
        control.mute();
      }
    });

    const activeSLide = slidesData[currentSlide];
    if (activeSLide.type === "image") {
      imageTimerRef.current = setTimeout(() => {
        goToNextSlide();
      }, 5000);
    }
  }, [currentSlide, goToNextSlide]); // Dispara toda vez que 'currentSlide' muda

  useEffect(() => {
    const currentHeroControl = playerControlsRef.current[currentSlide];
    if (!currentHeroControl) return;

    if (isPlayerVisible) {
      currentHeroControl.mute();
    } else {
      currentHeroControl.unmute();
    }
  }, [isPlayerVisible, currentSlide]);
  return (
    <section id="hero-section" className="hero-section">
      <div className="hero-content">
        <h1 id="hero-title">Pantry Podcast</h1>
        <p id="hero-text">
          Daily questions and changes in your spiritual diet that will transform
          your walk with Christ and your daily life.{" "}
        </p>
        <a
          id="hero-button"
          href="https://podcasts.eternityready.com/episodes?podcast=cmcsg7kpj06d8it1fu6btde4q"
          className="hero-btn"
        >
          Learn More
        </a>
      </div>
      <div className="hero-overlay"></div>

      {/* 5. RENDERIZAÇÃO CONDICIONAL DA MÍDIA */}
      <div className="hero-background">
        {slidesData.map((slide, index) => (
          <div
            key={slide.key}
            className={`slide ${index === currentSlide ? "active" : ""}`}
          >
            {slide.type === "youtube" && <div id={`player-${index}`}></div>}

            {slide.type === "video" && (
              <video
                // Adiciona o elemento ao array de refs
                ref={(el) => {
                  videoElementRefs.current[index] = el;
                }}
                src={slide.src}
                muted
                playsInline
                className="media-element"
                onEnded={goToNextSlide}
              ></video>
            )}

            {slide.type === "image" && (
              <Image
                src={slide.src}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                className="media-element"
                priority
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(HeroSection);

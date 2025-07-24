document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.getElementById("dropdown-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");

  // Adiciona um "escutador de evento" que reage   ao clique no botão
  dropdownBtn.addEventListener("click", function (event) {
    event.preventDefault();
    dropdownMenu.classList.toggle("show");
  });

  // Opcional, mas recomendado: Fecha o dropdown se o usuário clicar fora dele
  window.addEventListener("click", function (event) {
    // Verifica se o clique NÃO foi no botão do dropdown
    if (!dropdownBtn.contains(event.target)) {
      // Se o menu estiver aberto (contém a classe 'show'), ele a remove para fechar
      if (dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
      }
    }
  });

  const slides = document.querySelectorAll(".hero-background .slide");

  if (slides.length <= 1) {
    return;
  }

  let players = [];
  let currentSlide = 0;
  let isGloballyMuted = false;

  // Função para avançar para o próximo slide
  function showNextSlide() {
    pauseMedia(slides[currentSlide], currentSlide);
    slides[currentSlide].classList.remove("active");

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.add("active");
    playMedia(slides[currentSlide], currentSlide);
  }

  // Função para pausar a mídia
  function pauseMedia(slide, index) {
    const type = slide.dataset.type;
    if (
      type === "youtube" &&
      players[index] &&
      typeof players[index].pauseVideo === "function"
    ) {
      players[index].pauseVideo();
    } else if (type === "video") {
      const video = slide.querySelector("video");
      if (video) video.pause();
    }
  }

  // Função para tocar a mídia
  function playMedia(slide, index) {
    const type = slide.dataset.type;
    if (
      type === "youtube" &&
      players[index] &&
      typeof players[index].playVideo === "function"
    ) {
      players[index].seekTo(0);
      players[index].playVideo();
      if (isGloballyMuted) {
        players[index].mute();
      } else {
        players[index].unMute();
      }
    } else if (type === "video") {
      const video = slide.querySelector("video");
      if (video) {
        video.currentTime = 0;
        video.play();
        video.muted = isGloballyMuted;
      }
    }
  }

  // --- LÓGICA DE INICIALIZAÇÃO MODIFICADA ---

  // Verifica se existe algum slide do YouTube para carregar a API
  const hasYouTubeSlide = Array.from(slides).some(
    (slide) => slide.dataset.type === "youtube"
  );

  if (hasYouTubeSlide) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api"; // URL correta da API
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
    // Se não houver vídeos do YouTube, inicializa diretamente
    initializeSliders();
  }

  // A API do YouTube chamará esta função quando estiver pronta
  window.onYouTubeIframeAPIReady = function () {
    initializeSliders();
  };

  function initializeSliders() {
    slides.forEach((slide, index) => {
      const type = slide.dataset.type;

      if (type === "youtube") {
        const iframe = slide.querySelector("iframe");
        // Garante que o enablejsapi=1 está na URL
        let src = iframe.getAttribute("src");
        if (!src.includes("enablejsapi=1")) {
          src += (src.includes("?") ? "&" : "?") + "enablejsapi=1";
          iframe.setAttribute("src", src);
        }

        players[index] = new YT.Player(iframe, {
          events: {
            // Adiciona o listener para o estado do player
            onStateChange: (event) => {
              // Se o vídeo terminou (estado 0), chama a função para ir para o próximo slide
              if (event.data === YT.PlayerState.ENDED) {
                showNextSlide();
              }
            },
            onReady: (event) => {
              if (isGloballyMuted) {
                event.target.mute();
              }
            },
          },
        });
      } else if (type === "video") {
        const video = slide.querySelector("video");
        if (video) {
          // Adiciona o listener 'ended' para vídeos HTML5
          video.addEventListener("ended", showNextSlide);
        }
      }
    });

    // Inicia o primeiro slide
    if (slides.length > 0) {
      slides[0].classList.add("active");
      playMedia(slides[0], 0);
    }
  }

  // ... (seu código do sliderManager para mutar/desmutar permanece o mesmo) ...
  window.sliderManager = {
    mute: () => {
      isGloballyMuted = true;
      const player = players[currentSlide];
      const slide = slides[currentSlide];
      const type = slide.dataset.type;

      if (type === "youtube" && player?.mute) {
        player.mute();
      } else if (type === "video") {
        slide.querySelector("video").muted = true;
      }
      console.log("Slider mutado pelo player de podcast.");
    },
    unmute: () => {
      isGloballyMuted = false;
      const player = players[currentSlide];
      const slide = slides[currentSlide];
      const type = slide.dataset.type;

      if (type === "youtube" && player?.unMute) {
        player.unMute();
      } else if (type === "video") {
        slide.querySelector("video").muted = false;
      }
      console.log("Slider desmutado.");
    },
  };
});

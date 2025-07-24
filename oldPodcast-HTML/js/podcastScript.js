// js/script.js

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get("category");

  const categorySelect = document.getElementById("categorySelect");
  const searchInput = document.getElementById("search-input");
  const podcastList = document.getElementById("podcastList");
  const channelCount = document.getElementById("channel-count");
  const suggestionsList = document.getElementById("suggestions-list");

  const showEpisodes = document.getElementById("showEpisode");
  const isCheckedEpisode = showEpisodes.checked;

  let currentPage = 1;
  const limit = 9999;

  let debounceTimeout = null;
  let categoryDebounceTimeout = null;
  let currentFetchController = null;

  let episodeFetched = false;

  const sentinel = document.createElement("div");
  sentinel.id = "sentinel";
  podcastList.after(sentinel);

  let allPodcasts = [];
  let allEpisodes = [];

  async function main() {
    await fetchCategories();
    console.log("Categories fetched");

    allPodcasts = await fetchPodcasts();
    console.log("Podcasts fetched:", allPodcasts);

    updateChannelCount(allPodcasts.length);
    renderPodcasts(allPodcasts);
    console.log("Podcasts Rendered");

    const cached = getCachedEpisodes();
    if (cached) {
      console.log("Using cached episodes");
      allEpisodes = cached;
      episodeFetched = true;
    } else {
      allEpisodes = await fetchPodcastEpisodes();
      cacheEpisodes(allEpisodes);
      episodeFetched = true;
    }

    console.log(`Episodes fetched: ${allEpisodes.length}`);
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const query = searchInput.value.trim().toLowerCase();

      if (showEpisodes.checked) {
        const filtered = getFilteredMixedItems(query);
        renderMixedContent(filtered);
        updateChannelCount(filtered.length);
        renderAutocompleteSuggestions(filtered);
      } else {
        const filtered = allPodcasts.filter((p) =>
          p.title.toLowerCase().includes(query)
        );
        renderPodcasts(filtered);
        updateChannelCount(filtered.length);
        renderAutocompleteSuggestions(filtered);
      }
    }, 300);
  });

  categorySelect.addEventListener("change", () => {
    clearTimeout(categoryDebounceTimeout);
    categoryDebounceTimeout = setTimeout(() => {
      const selectedCategory = categorySelect.value.toLowerCase();
      const filtered = allPodcasts.filter((p) =>
        p.categories?.toLowerCase().includes(selectedCategory)
      );
      updateChannelCount(filtered.length);
      renderPodcasts(filtered);
    }, 100);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceTimeout);
      const query = searchInput.value.trim().toLowerCase();

      if (showEpisodes.checked) {
        const filtered = getFilteredMixedItems(query);
        renderMixedContent(filtered);
        renderAutocompleteSuggestions(filtered);
      } else {
        const filtered = allPodcasts.filter((p) =>
          p.title.toLowerCase().includes(query)
        );
        renderPodcasts(filtered);
        updateChannelCount(filtered.length);
        renderAutocompleteSuggestions(filtered);
      }
    }
  });

  function resetPodcastList() {
    currentPage = 1;
    hasMore = true;
  }

  async function fetchCategories() {
    try {
      const response = await fetch(`${url}/api/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: window.location.origin,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      await populateCategories(data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async function populateCategories(categories) {
    try {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.selected = categoryParam
          ? category.toLowerCase() === categoryParam.toLowerCase()
          : false;
        option.value = category.toLowerCase();
        option.textContent = capitalizeFirstLetter(category);
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error populating categories:", error);
    }
  }

  function capitalizeFirstLetter(string) {
    if (typeof string !== "string" || string.length === 0) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async function fetchPodcasts() {
    try {
      const params = new URLSearchParams({
        limit,
      });
      const response = await fetch(`${url}/api/podcasts?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch podcasts: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const fetchedPodcasts = data.data || [];

      fetchedPodcasts.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

      return fetchedPodcasts;
    } catch (error) {
      console.error("Error at podcast search:", error);
      return [];
    }
  }

  function renderPodcasts(podcasts) {
    if (currentPage === 1) {
      podcastList.innerHTML = "";
    }

    if (podcasts.length === 0 && currentPage === 1) {
      const noResultItem = document.createElement("li");
      noResultItem.textContent = "No podcasts found.";
      podcastList.appendChild(noResultItem);
      return;
    }

    const fragment = document.createDocumentFragment();

    podcasts.forEach((podcast) => {
      const podcastCard = document.createElement("div");
      podcastCard.classList.add("podcast-card");

      const categoriesArray = podcast.categories
        ? podcast.categories.split(",")
        : [];

      podcastCard.innerHTML = `
        <img src="${url}${escapeHtml(podcast.imageUrl)}" alt="${escapeHtml(
        podcast.title
      )}">
        <div class="podcast-details">
          <h3>${escapeHtml(podcast.title)}</h3>
          <div class="categories">
            ${
              categoriesArray.length > 0
                ? categoriesArray
                    .sort((a, b) => a.localeCompare(b))
                    .map(
                      (cat) =>
                        `<a href="/?category=${encodeURIComponent(
                          cat.trim()
                        )}">${escapeHtml(cat.trim())}</a>`
                    )
                    .join(" ")
                : ""
            }
          </div>
        </div>
      `;

      podcastCard.addEventListener("click", () => {
        window.location.href = `/episodes/${podcast.slug}`;
      });

      fragment.appendChild(podcastCard);
    });

    podcastList.appendChild(fragment);
  }

  function escapeHtml(string) {
    const div = document.createElement("div");
    div.textContent = string;
    return div.innerHTML;
  }

  function renderAutocompleteSuggestions(suggestions) {
    suggestionsList.innerHTML = "";

    if (suggestions.length > 0) {
      const limitedSuggestions = suggestions.slice(0, 5);
      limitedSuggestions.forEach((podcast) => {
        const suggestionItem = document.createElement("li");
        suggestionItem.innerHTML = `${podcast.title}`;
        suggestionItem.addEventListener("click", () => {
          searchInput.value = podcast.title;
          suggestionsList.classList.add("hidden");
          renderPodcasts([podcast]);
        });
        suggestionsList.appendChild(suggestionItem);
      });

      suggestionsList.classList.remove("hidden");
      suggestionsList.classList.add("show");
    } else {
      suggestionsList.classList.add("hidden");
      suggestionsList.classList.remove("show");
    }
  }

  window.addEventListener("click", (event) => {
    if (
      !suggestionsList.contains(event.target) &&
      event.target !== searchInput
    ) {
      suggestionsList.classList.add("hidden");
    }
  });

  function updateChannelCount(count) {
    channelCount.textContent = `Results found: ${count}`;
  }

  async function fetchPodcastEpisodes() {
    console.log("Fetching Episodes");
    const limit = 100;
    let cont = 0;

    const episodePromises = allPodcasts.map(async (podcast) => {
      try {
        const responseInfo = await fetch(
          `${url}/api/podcast-info?podcast=${podcast.slug}`
        );
        const podcastInfo = await responseInfo.json();

        if (!responseInfo.ok) {
          console.log(
            `Error Fetching Podcast Info ${podcast.id}: ${podcastInfo.statusText}`
          );
          return [];
        }

        const totalSeasons = podcastInfo.data.totalSeasons;
        const totalEpisodes = podcastInfo.data.totalEpisodes + 1;
        let allSeasonEpisodes = [];

        for (let season = 0; season <= totalSeasons; season++) {
          const response = await fetch(
            `${url}/api/episodes/${podcast.slug}?season=${season}&limit=${totalEpisodes}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) {
            console.log(
              `Error Fetching Episodes of Podcast ${podcast.id}: ${response.statusText}`
            );
            return [];
          }

          const data = await response.json();
          const fetchedEpisodes = data.data || [];
          console.log(fetchedEpisodes);

          const mappedEpisodes = fetchedEpisodes.map((episode) => ({
            ...episode,
            categories: podcast.categories,
            podcastId: podcast.id,
          }));

          allSeasonEpisodes.push(...mappedEpisodes);
        }

        cont++;
        return allSeasonEpisodes;
      } catch (error) {
        console.error(`Failed Fetching to Podcast ${podcast.id}: `, error);
        return [];
      }
    });

    const allEpisodeArrays = await Promise.all(episodePromises);
    const allEpisodes = allEpisodeArrays.flat();

    allEpisodes.sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
    episodeFetched = true;
    console.log(cont, "podcasts");

    return allEpisodes;
  }

  function renderMixedContent(items) {
    console.log("Rendering Mixed Content...");
    podcastList.innerHTML = ""; // limpa a lista
    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("podcast-card");

      const categoriesArray = item.categories ? item.categories.split(",") : [];

      let title = escapeHtml(item.title);
      let imageUrl = escapeHtml(item.imageUrl);
      let typeLabel = item.type === "episode" ? "Episode" : "Podcast";

      card.innerHTML = `
      <img src="${url}${imageUrl}" alt="${title}">
      <div class="podcast-details">
        <h3><strong>${typeLabel}</strong><br/> ${title}</h3>
        <div class="categories">
          ${
            categoriesArray.length > 0
              ? categoriesArray
                  .sort((a, b) => a.localeCompare(b))
                  .map(
                    (cat) =>
                      `<a href="/?category=${encodeURIComponent(
                        cat.trim()
                      )}">${escapeHtml(cat.trim())}</a>`
                  )
                  .join(" ")
              : ""
          }
        </div>
      </div>
    `;

      card.addEventListener("click", () => {
        if (item.type === "episode") {
          const podcastEpisodes = searchPodcastEpisodes(item.podcastId);
          const episodeIndex = podcastEpisodes.findIndex(
            (episode) => episode.id === item.id
          );
          if (episodeIndex !== -1) {
            let podcastName = item.title;
            playEpisode(podcastEpisodes, episodeIndex, podcastName);
          } else {
            console.error("Error: Episode not found in episode list");
          }
        } else {
          window.location.href = `/episodes/${item.slug}`;
        }
      });

      fragment.appendChild(card);
    });

    podcastList.appendChild(fragment);
  }

  function getFilteredMixedItems(query) {
    const lowerQuery = query.toLowerCase();

    const filteredPodcasts = allPodcasts
      .filter((p) => p.title.toLowerCase().includes(lowerQuery))
      .map((p) => ({ ...p, type: "podcast" }));

    const filteredEpisodes = allEpisodes
      .filter((e) => e.title.toLowerCase().includes(lowerQuery))
      .map((e) => ({ ...e, type: "episode" }));

    return [...filteredPodcasts, ...filteredEpisodes].sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
  }

  function getCachedEpisodes() {
    const cached = sessionStorage.getItem("allEpisodes");
    return cached ? JSON.parse(cached) : null;
  }

  function cacheEpisodes(episodes) {
    sessionStorage.setItem("allEpisodes", JSON.stringify(episodes));
  }

  showEpisodes.addEventListener("click", async function () {
    if (showEpisodes.checked) {
      if (!episodeFetched) {
        allEpisodes = await fetchPodcastEpisodes();
        episodeFetched = true;
      }
      const mixedItems = [
        ...allPodcasts.map((p) => ({ ...p, type: "podcast" })),
        ...allEpisodes.map((e) => ({ ...e, type: "episode" })),
      ];

      mixedItems.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

      renderMixedContent(mixedItems);
      updateChannelCount(mixedItems.length);
      console.log("Episodes rendered");
    } else {
      renderPodcasts(allPodcasts);
      updateChannelCount(allPodcasts.length);
    }
  });

  // Audio Player
  const songTitle = document.getElementById("song-title");
  const songArtist = document.getElementById("song-artist");
  const albumArt = document.querySelector(".album-art-bar");
  const audio = document.getElementById("audio");

  const prevBtn = document.getElementById("prev");
  const playBtn = document.getElementById("play");
  const nextBtn = document.getElementById("next");
  const playBtnIcon = playBtn.querySelector("i.fas");
  const mute = document.getElementById("mute");
  const close = document.getElementById("close");
  const playerBar = document.getElementById("player-bar");

  let currentPlaylist = [];
  let currentSongIndex = 0;
  let isPlaying = false;

  function playEpisode(playlist, index, podcastName) {
    playerBar.classList.add("ativo");
    muteSlides();

    currentPlaylist = playlist;
    currentSongIndex = index;
    loadEpisode(currentPlaylist[currentSongIndex], podcastName);
    playSong();
  }

  function loadEpisode(episode, podcastName) {
    songTitle.textContent = episode.title;
    songArtist.textContent = podcastName || "";

    if (!episode.audioUrl || typeof episode.audioUrl !== "string") {
      console.error("Error: Invalid AudioUrl", episode.audioUrl);
      return;
    }

    audio.src = episode.audioUrl;
    albumArt.src = `https://keystone.eternityready.com${episode.imageUrl}`;
  }

  function playSong() {
    isPlaying = true;
    playBtnIcon.classList.remove("fa-play");
    playBtnIcon.classList.add("fa-pause");
    audio
      .play()
      .catch((error) =>
        console.error("Error trying to play the audio:", error)
      );
  }

  function pauseSong() {
    isPlaying = false;
    playBtnIcon.classList.add("fa-play");
    playBtnIcon.classList.remove("fa-pause");
    audio.pause();
  }

  function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
      currentSongIndex = currentPlaylist.length - 1;
    }
    loadEpisode(currentPlaylist[currentSongIndex]);
    playSong();
  }

  function nextSong() {
    currentSongIndex++;
    if (currentSongIndex >= currentPlaylist.length) {
      currentSongIndex = 0;
    }
    loadEpisode(currentPlaylist[currentSongIndex]);
    playSong();
  }

  function muteSong() {
    audio.muted = !audio.muted;
    mute.classList.toggle("fa-volume-high");
    mute.classList.toggle("fa-volume-mute");
  }

  function closeBar() {
    // const widget = document.querySelector(".widget-visible");
    // widget.style.setProperty("display", "block", "important");
    unmuteSlides();

    playerBar.classList.remove("ativo");
    pauseSong();
  }

  playBtn.addEventListener("click", () => {
    if (!audio.src) {
      console.warn("0 episodes loaded");
      return;
    }
    isPlaying ? pauseSong() : playSong();
  });
  prevBtn.addEventListener("click", prevSong);
  nextBtn.addEventListener("click", nextSong);
  mute.addEventListener("click", muteSong);
  audio.addEventListener("ended", nextSong);
  close.addEventListener("click", closeBar);

  function searchPodcastEpisodes(id) {
    const episodesArray = allEpisodes.filter((p) =>
      p.podcastId.toLowerCase().includes(id)
    );
    return episodesArray;
  }

  function muteSlides() {
    if (
      window.sliderManager &&
      typeof window.sliderManager.mute === "function"
    ) {
      window.sliderManager.mute();
    }
  }

  function unmuteSlides() {
    if (
      window.sliderManager &&
      typeof window.sliderManager.unmute === "function"
    ) {
      window.sliderManager.unmute();
    }
  }

  main();
});

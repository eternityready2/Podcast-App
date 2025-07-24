document.addEventListener("DOMContentLoaded", async () => {
  // const urlParams = new URLSearchParams(window.location.search);
  // const podcastSlug = urlParams.get("podcast");

  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const podcastSlug = pathSegments[pathSegments.length - 1];

  const urlParams = new URLSearchParams(window.location.search);
  let seasonId = parseInt(urlParams.get("season"));

  if (!podcastSlug) {
    console.log(podcastSlug);
    alert("Podcast Slug is missing in the URL.");
    return;
  }

  const podcastImage = document.getElementById("podcast-image");
  const podcastTitle = document.getElementById("podcast-title");
  const podcastDescription = document.getElementById("podcast-description");
  const podcastCategories = document.getElementById("podcast-categories");
  const totalSeasons = document.getElementById("total-seasons");
  const totalEpisodes = document.getElementById("total-episodes");
  const episodesContainer = document.getElementById("episodes-container");
  const loadingIndicator = document.getElementById("loading");
  const seasonsDropdown = document.getElementById("seasons-dropdown");

  // Create a Sentinel Element for IntersectionObserver
  const sentinel = document.createElement("div");
  sentinel.id = "sentinel";
  episodesContainer.after(sentinel);

  let currentPage = 1;
  const limit = 15;
  let totalPages = 1;
  let isLoading = false;
  let hasMoreEpisodes = true;
  let observer;

  let podcastData = null;

  // Fetch Podcast Info
  async function fetchPodcastInfo() {
    try {
      const response = await fetch(
        `${url}/api/podcast-info?podcast=${podcastSlug}`
      );
      const result = await response.json();

      if (response.ok) {
        podcastData = result.data.podcast;
        const episodesCount = result.data.totalEpisodes;
        const seasonsCount = result.data.totalSeasons;
        const hasUnknownSeason = result.data.hasUnknownSeason;

        podcastImage.src = `${url}${podcastData.imageUrl}`;
        podcastTitle.textContent = podcastData.title;
        podcastDescription.innerHTML = stripHtmlExceptLinks(
          podcastData.description
        );

        const categoriesArray = podcastData.categories
          ? podcastData.categories.split(",")
          : [];
        podcastCategories.innerHTML = `
        ${
          categoriesArray.length > 0
            ? categoriesArray
                .map(
                  (cat) =>
                    `<a href="/?category=${encodeURIComponent(
                      cat.trim()
                    )}">${escapeHtml(cat.trim())}</a>`
                )
                .join(" ") // Separator remains a space
            : ""
        }
          `;

        totalSeasons.textContent = seasonsCount;
        totalEpisodes.textContent = episodesCount;
        // hasUnknownSeason.textContent = hasUnknownSeason;

        if (isNaN(seasonId)) {
          if (seasonsCount > 1) {
            seasonId = seasonsCount;
          } else {
            seasonId = 0;
          }
        }

        fetchEpisodes(currentPage, podcastSlug);
        populateSeasonsDropdown(seasonsCount, hasUnknownSeason);
      } else {
        alert(result.error || "Failed to fetch podcast information.");
      }
    } catch (error) {
      console.error("Error fetching podcast info:", error);
      alert("An error occurred while fetching podcast information.");
    }
  }
  function escapeHtml(string) {
    const div = document.createElement("div");
    div.textContent = string;
    return div.innerHTML;
  }
  // Populate Seasons Dropdown
  function populateSeasonsDropdown(seasonsCount, hasUnknownSeason) {
    // Clear existing options
    seasonsDropdown.innerHTML = "";

    // Populate seasons
    for (let i = 1; i <= seasonsCount; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Season ${i}`;
      seasonsDropdown.appendChild(option);
    }

    if (hasUnknownSeason) {
      const hasUnknownOption = document.createElement("option");
      hasUnknownOption.value = 0;
      hasUnknownOption.textContent =
        seasonsCount > 0 ? "Extras" : "All Episodes";
      seasonsDropdown.appendChild(hasUnknownOption);
    }
    // Create default option

    // Set selected season based on URL or default to 'All Seasons'
    seasonsDropdown.value = seasonId;
  }

  // Fetch Episodes
  async function fetchEpisodes(page, podcastId) {
    if (isLoading || !hasMoreEpisodes) return;

    isLoading = true;
    loadingIndicator.style.display = "block";
    try {
      const response = await fetch(
        `${url}/api/episodes/${podcastId}?season=${seasonId}&page=${page}&limit=${limit}`
      );
      const result = await response.json();
      console.log(response);

      if (response.ok) {
        const { data: episodes, pagination } = result;
        const SeasonTotalEpisodes = document.getElementById(
          "season-total-episodes"
        );
        SeasonTotalEpisodes.textContent = `${pagination.total} episodes`;

        console.log(episodes);

        episodes.forEach((episode) => {
          createEpisodeElement(episode);
        });

        totalPages = pagination.totalPages;
        if (currentPage >= totalPages) {
          hasMoreEpisodes = false;
          loadingIndicator.style.display = "none";
          if (observer) {
            observer.disconnect();
          }
        } else {
          currentPage++;
          observeLastEpisode();
        }
      } else {
        console.error(result.error || "Failed to fetch episodes.");
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
    } finally {
      isLoading = false;
      if (hasMoreEpisodes) {
        loadingIndicator.style.display = "none";
      }
    }
  }

  // Create Episode Element
  function createEpisodeElement(episode) {
    const episodeSection = document.createElement("div");
    episodeSection.classList.add("episode-section");

    const imageWrapOuter = document.createElement("div");
    imageWrapOuter.classList.add("episode-image-wrap-outer");

    // Episode Image Wrap
    const imageWrap = document.createElement("div");
    imageWrap.classList.add("episode-image-wrap");

    imageWrapOuter.appendChild(imageWrap);

    const img = document.createElement("img");
    img.classList.add("episode-image");
    img.src = `${url}${episode.imageUrl}`;
    img.alt = episode.title || "Episode Cover"; // Fallback alt text

    const playOverlay = document.createElement("div");
    playOverlay.classList.add("play-overlay", "play-pause");

    const playIcon = document.createElement("i");
    playIcon.classList.add("fas", "fa-play", "fa-2x");

    playOverlay.appendChild(playIcon);
    imageWrap.appendChild(img);
    imageWrap.appendChild(playOverlay);

    // Episode Details
    const details = document.createElement("div");
    details.classList.add("episode-details");

    // Episode Header
    const episodeHeader = document.createElement("div");
    episodeHeader.classList.add("episode");

    const mobileDetails = document.createElement("div");
    mobileDetails.classList.add("mobile-details");

    if (episode.episode > 0) {
      const episodeNumber = document.createElement("div");
      episodeNumber.classList.add("episode-number");
      episodeNumber.textContent = `Episode: ${episode.episode}`;

      const episodeNumberMobile = document.createElement("div");
      episodeNumberMobile.classList.add("episode-number");
      episodeNumberMobile.textContent = `Episode: ${episode.episode}`;

      episodeHeader.appendChild(episodeNumber);

      mobileDetails.appendChild(episodeNumberMobile);
    }

    const mobileTitle = document.createElement("div");
    mobileTitle.classList.add("mobile-title");
    mobileTitle.textContent = episode.title;
    mobileDetails.appendChild(mobileTitle);

    const mobilePlayer = document.createElement("div");
    mobilePlayer.classList.add("episode-player");

    const mobileAudioPlayer = document.createElement("div");
    mobileAudioPlayer.classList.add("audio-player");

    const mobileAudio = document.createElement("audio");
    mobileAudio.id = `audio-${episode.id}`;
    mobileAudio.dataset.src = episode.audioUrl;

    const mobileProgressContainer = document.createElement("div");
    mobileProgressContainer.classList.add("progress-container");

    const mobileProgress = document.createElement("div");
    mobileProgress.classList.add("progress");
    mobileProgress.id = `progress-${episode.id}`;
    mobileProgressContainer.appendChild(mobileProgress);

    const mobileTimeDuration = document.createElement("div");
    mobileTimeDuration.classList.add("time-duration");

    const mobileCurrentTime = document.createElement("span");
    mobileCurrentTime.classList.add("current-time");
    mobileCurrentTime.id = `current-time-${episode.id}`;
    mobileCurrentTime.textContent = "0:00";

    const mobileDuration = document.createElement("span");
    mobileDuration.classList.add("duration");
    mobileDuration.id = `duration-${episode.id}`;
    mobileDuration.textContent = "0:00";

    mobileTimeDuration.appendChild(mobileCurrentTime);
    mobileTimeDuration.appendChild(document.createTextNode("/"));
    mobileTimeDuration.appendChild(mobileDuration);

    // mobileAudioPlayer.appendChild(mobileAudio);
    mobileAudioPlayer.appendChild(mobileProgressContainer);
    mobileAudioPlayer.appendChild(mobileTimeDuration);

    const mobilePlayBtn = document.createElement("div");
    mobilePlayBtn.classList.add("play-btn");
    mobilePlayBtn.classList.add("play-pause");

    const mobilePlayIcon = document.createElement("i");
    mobilePlayIcon.classList.add("fas", "fa-play");

    mobilePlayBtn.appendChild(mobilePlayIcon);

    mobileDetails.appendChild(mobilePlayBtn);

    mobileDetails.appendChild(mobileAudioPlayer);

    const playingBars = document.createElement("div");
    playingBars.classList.add("playing-bars");

    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("div");
      bar.classList.add("bar");
      playingBars.appendChild(bar);
    }

    episodeHeader.appendChild(playingBars);

    // Episode Player
    const episodePlayer = document.createElement("div");
    episodePlayer.classList.add("episode-player");

    const audioPlayer = document.createElement("div");
    audioPlayer.classList.add("audio-player");

    const audio = document.createElement("audio");
    audio.id = `audio-${episode.id}`;
    audio.dataset.src = episode.audioUrl;

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("progress-container");

    const progress = document.createElement("div");
    progress.classList.add("progress");
    progress.id = `progress-${episode.id}`;
    progressContainer.appendChild(progress);

    const timeDuration = document.createElement("div");
    timeDuration.classList.add("time-duration");

    const currentTime = document.createElement("span");
    currentTime.classList.add("current-time");
    currentTime.id = `current-time-${episode.id}`;
    currentTime.textContent = "0:00";

    const duration = document.createElement("span");
    duration.classList.add("duration");
    duration.id = `duration-${episode.id}`;
    duration.textContent = "0:00";

    timeDuration.appendChild(currentTime);
    timeDuration.appendChild(document.createTextNode("/"));
    timeDuration.appendChild(duration);

    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.classList.add("volume-slider");
    volumeSlider.id = `volume-slider-${episode.id}`;
    volumeSlider.min = "0";
    volumeSlider.max = "1";
    volumeSlider.step = "0.01";
    volumeSlider.value = "1";

    audioPlayer.appendChild(audio);
    audioPlayer.appendChild(progressContainer);
    audioPlayer.appendChild(timeDuration);
    audioPlayer.appendChild(volumeSlider);

    episodePlayer.appendChild(audioPlayer);
    episodeHeader.appendChild(episodePlayer);
    details.appendChild(episodeHeader);

    // Episode Title
    const episodeTitle = document.createElement("div");
    episodeTitle.classList.add("episode-title");
    episodeTitle.textContent = episode.title;
    details.appendChild(episodeTitle);

    // Episode Description
    const episodeDescription = document.createElement("div");
    episodeDescription.classList.add("episode-description");
    episodeDescription.innerHTML = stripHtmlExceptLinks(episode.description);
    details.appendChild(episodeDescription);

    const episodeDate = document.createElement("div");
    episodeDate.classList.add("episode-date");
    details.appendChild(episodeDate);

    const releaseDate = new Date(episode.releaseDate);
    const formattedDate = releaseDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const dateDiv = document.createElement("div");
    dateDiv.textContent = formattedDate;
    episodeDate.appendChild(dateDiv);

    const readmore = document.createElement("button");
    readmore.classList.add("read-more");
    readmore.textContent = "Read More";
    episodeDate.appendChild(readmore);

    // Assemble Episode Section
    episodeSection.appendChild(imageWrapOuter);
    imageWrapOuter.appendChild(mobileDetails);
    episodeSection.appendChild(details);

    episodesContainer.appendChild(episodeSection);

    playOverlay.addEventListener("click", function () {
      if (!audio.src) {
        audio.src = audio.dataset.src;
      }
    });
    mobilePlayBtn.addEventListener("click", function () {
      if (!audio.src) {
        audio.src = audio.dataset.src;
      }
    });

    if (episodeDescription && readmore) {
      if (isOverflown(episodeDescription)) {
        readmore.style.display = "block"; // Show the button
      } else {
        readmore.style.display = "none"; // Hide the button
      }
    }
  }
  function isOverflown(element) {
    return element.scrollHeight > element.clientHeight;
  }
  // Helper function to escape HTML special characters
  function stripHtmlExceptLinks(input) {
    const div = document.createElement("div");
    div.innerHTML = input;

    div.querySelectorAll("*:not(a)").forEach((el) => {
      el.replaceWith(document.createTextNode(el.textContent));
    });

    return div.innerHTML;
  }
  // Event delegation: Attach a single event listener to the document
  document.addEventListener("click", function (event) {
    // Check if the clicked element has the 'read-more' class
    if (event.target && event.target.classList.contains("read-more")) {
      const readMoreBtn = event.target;
      // Find the closest '.episode-details' ancestor
      const episodeDescription = readMoreBtn
        .closest(".episode-details")
        .querySelector(".episode-description");

      console.log(episodeDescription);

      if (episodeDescription) {
        // Toggle the 'expanded' class
        const isExpanded = episodeDescription.classList.toggle("expanded");

        // Update the button text
        readMoreBtn.textContent = isExpanded ? "Read Less" : "Read More";

        // Update the aria-expanded attribute for accessibility
        readMoreBtn.setAttribute("aria-expanded", isExpanded);
      }
    }
  });

  // Observe the last episode for infinite scrolling
  function observeLastEpisode() {
    const episodes = document.querySelectorAll(".episode-section");
    const lastEpisode = episodes[episodes.length - 1];

    if (lastEpisode) {
      if (observer) {
        observer.disconnect();
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreEpisodes) {
            fetchEpisodes(currentPage, podcastSlug);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 1.0,
        }
      );

      observer.observe(lastEpisode);
    }
  }

  // Handle Seasons Dropdown Change
  seasonsDropdown.addEventListener("change", () => {
    seasonId = parseInt(seasonsDropdown.value);
    currentPage = 1;
    totalPages = 1;
    hasMoreEpisodes = true;
    episodesContainer.innerHTML = ""; // Clear existing episodes

    if (observer) {
      observer.disconnect();
    }

    fetchEpisodes(currentPage, podcastSlug);
  });

  // Initial Load
  fetchPodcastInfo();
});

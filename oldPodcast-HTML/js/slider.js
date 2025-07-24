document.addEventListener("DOMContentLoaded", async () => {
  try {
    const sliders = document.querySelectorAll(".splide-wrapper");
    if (sliders.length === 0) {
      return;
    }

    for (const slider of sliders) {
      const dataType = slider.getAttribute("data-type");
      console.log(`${url}/api/${dataType}`);
      const response = await fetch(`${url}/api/${dataType}`);
      const { data } = await response.json();

      const sliderH2 = document.createElement("h2");
      sliderH2.textContent = dataType === "featured" ? "Featured" : "Latest";
      slider.appendChild(sliderH2);

      const splideDiv = document.createElement("div");
      splideDiv.className = "splide";
      slider.appendChild(splideDiv);

      const splideTrack = document.createElement("div");
      splideTrack.className = "splide__track";
      splideDiv.appendChild(splideTrack);

      const splideList = document.createElement("ul");
      splideList.className = "splide__list";
      splideTrack.appendChild(splideList);

      // Populate the <ul> with <li> elements
      data.forEach((item) => {
        const li = document.createElement("li");
        li.className = "splide__slide";

        const categoriesArray = item.categories
          ? item.categories.split(",")
          : [];
        li.innerHTML = `
                  <a href="/episodes/${item.slug}"><img src="${url}${
          item.imageUrl
        }" alt="${item.title}" />
                  <h3 class="slide-title">${item.title}</h3></a>
                  <p>${
                    categoriesArray.length > 0
                      ? categoriesArray
                          .map(
                            (cat) =>
                              `<a href="/?category=${encodeURIComponent(
                                cat.trim()
                              )}">${escapeHtml(cat.trim())}</a>`
                          )
                          .join(" ")
                      : ""
                  }</p>
                `;

        splideList.appendChild(li);
      });

      // Initialize Splide
      new Splide(splideDiv, {
        type: "slide",
        perPage: 6,
        perMove: 1,
        gap: "5px",
        autoplay: false,
        interval: 3000,
        pauseOnHover: true,
        resetProgress: false,
        arrows: true,
        pagination: false,
        breakpoints: {
          1024: {
            perPage: 4,
          },
          768: {
            perPage: 3,
          },
          480: {
            perPage: 2,
          },
        },
        speed: 600,
      }).mount();
    }
  } catch (error) {
    console.error("Error fetching or populating data:", error);
  }
});

// Example `escapeHtml` function
function escapeHtml(string) {
  const div = document.createElement("div");
  div.textContent = string;
  return div.innerHTML;
}

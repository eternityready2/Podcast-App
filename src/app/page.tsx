import HeroSection from "@/components/heroSection";
import SplideSlider from "@/components/splideSlider";
import PodcastSlider from "@/components/PodcastSlider";
// import PodcastGrid from "@/components/podcastGris";

import Player from "@/components/Player";
import PodcastGridClient from "@/components/PodcastGridClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Podcast {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  categories: string;
}

async function getGridData() {
  try {
    const options = {
      next: {
        revalidate: 3600, // Cache de 1 hora
        tags: ["podcasts-data"],
      },
    };

    const [podRes, epRes, catRes] = await Promise.all([
      fetch(`${API_URL}/api/podcasts?limit=9999`, options),
      fetch(`${API_URL}/api/allEpisodes`, options),
      fetch(`${API_URL}/api/categories`, options),
    ]);

    const podData = await podRes.json();
    const epData = await epRes.json();
    const catData = await catRes.json();

    const allPodcasts = (podData.data || []).sort((a: Podcast, b: Podcast) =>
      a.title.localeCompare(b.title)
    );
    const allEpisodes = epData.data || [];
    const categories = catData.categories || [];

    return { allPodcasts, allEpisodes, categories };
  } catch (error) {
    console.error("Falha ao buscar dados para o grid:", error);
    return { allPodcasts: [], allEpisodes: [], categories: [] };
  }
}

async function getSliderData(type: "featured" | "latestPodcasts") {
  try {
    const res = await fetch(`${API_URL}/api/${type}`, {
      next: { revalidate: 3600 },
    });
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error(`Falha ao buscar dados para o slider ${type}:`, error);
    return []; // Retorna um array vazio em caso de erro
  }
}

export default async function Home() {
  const [gridData, featuredData, latestPodcastsData] = await Promise.all([
    getGridData(),
    getSliderData("featured"),
    getSliderData("latestPodcasts"),
  ]);

  console.log('GridData', gridData, 'featuredPodcasts', featuredData);

  return (
    <main>
      <HeroSection />

      <div className="container">
        <div className="cardbg">
          <SplideSlider type="featured" data={featuredData} />
          <SplideSlider type="latestPodcasts" data={latestPodcastsData} />
          <PodcastSlider allMedia={gridData.allPodcasts} />

          <PodcastGridClient
            initialPodcasts={gridData.allPodcasts}
            initialEpisodes={gridData.allEpisodes}
            initialCategories={gridData.categories}
          />
        </div>
      </div>

      <Player />
    </main>
  );
}

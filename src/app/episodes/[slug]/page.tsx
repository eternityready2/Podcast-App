import PodcastClientPage from "./PodcastClientPage";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function getPodcastInfo(slug: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/podcast-info?podcast=${slug}`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar informações do podcast:", error);
    return null;
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

export default async function PodcastPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const initialData = await getPodcastInfo(slug);
  const latestPodcastsData = await getSliderData("latestPodcasts");
  if (!initialData || !initialData.data) {
    return <div>Podcast não encontrado.</div>;
  }

  const { podcast, totalEpisodes, totalSeasons, hasUnknownSeason } =
    initialData.data;

  return (
    <PodcastClientPage
      slug={slug}
      initialPodcast={podcast}
      initialTotalEpisodes={totalEpisodes}
      initialSeasons={{ count: totalSeasons, hasUnknown: hasUnknownSeason }}
      latestPodcastsData={latestPodcastsData}
    />
  );
}

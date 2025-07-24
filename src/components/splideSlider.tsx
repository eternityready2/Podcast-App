import "@splidejs/react-splide/css"; // Importando o CSS padrão
import ClientSplideWrapper from "./clientSplideWrapper";

// Definindo os tipos para os dados que virão da API
interface EpisodeItem {
  slug: string;
  imageUrl: string;
  title: string;
  categories: string; // Vem como uma string separada por vírgulas
}

// Definindo o tipo para as props do nosso componente
type SliderProps = {
  type: "featured" | "latestPodcasts";
  data: EpisodeItem[];
};

export default function SplideSlider({ type, data }: SliderProps) {
  const title = type === "featured" ? "Featured" : "Latest";

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="splide-wrapper">
      <h2>{title}</h2>
      <ClientSplideWrapper data={data} title={title} />
    </div>
  );
}

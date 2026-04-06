"use client"; // ESSENCIAL: Este componente é interativo e roda no cliente

import Link from "next/link";
import FallbackImage from "@/components/FallbackImage";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

// Tipos para os dados recebidos via props
interface EpisodeItem {
  slug: string;
  imageUrl: string;
  title: string;
  categories: string;
}

type ClientSplideWrapperProps = {
  data: EpisodeItem[];
  title: string;
};

export default function ClientSplideWrapper({
  data,
  title,
}: ClientSplideWrapperProps) {
  // Se não houver dados (por exemplo, erro na API), não renderiza o carrossel
  if (!data || data.length === 0) {
    return <p>Episodes not found.</p>;
  }

  return (
    <Splide
      options={{
        type: "slide",
        perPage: 6,
        perMove: 1,
        gap: "5px",
        autoplay: false,
        arrows: true,
        pagination: false,
        breakpoints: {
          1024: { perPage: 4 },
          768: { perPage: 3 },
          480: { perPage: 2 },
        },
        speed: 600,
      }}
      aria-label={`${title} Podcasts`}
    >
      {data.map((item) => {
        const categoriesArray = item.categories
          ? item.categories.split(",").map((cat) => cat.trim())
          : [];
        const imageUrl = item.imageUrl
          ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`
          : "/placeholder.png";
        return (
          <SplideSlide key={item.slug}>
            <Link href={`/episodes/${item.slug}`}>
              <FallbackImage
                src={imageUrl}
                alt={item.title}
                width={200}
                height={200}
                priority
              />
              <h3 className="slide-title">{item.title}</h3>
            </Link>
            <p>
              {categoriesArray
                .map((cat) => (
                  <Link
                    href={`/?category=${encodeURIComponent(cat)}`}
                    key={cat}
                  >
                    {cat}
                  </Link>
                ))
                .reduce((prev, curr) => (
                  <>
                    {prev} {curr}
                  </>
                ))}
            </p>
          </SplideSlide>
        );
      })}
    </Splide>
  );
}

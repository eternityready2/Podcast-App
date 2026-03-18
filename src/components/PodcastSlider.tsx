'use client';
import { useState, useEffect } from 'react';
import SplideSlider from "@/components/splideSlider";

export default function PodcastSlider({ allMedia }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
  });

  const getTopPodcasts = async (delay = 100, retries = 0) => {
    if (retries > 20) {
      setIsLoading(false);
      return;
    }
    try {
      const topItems = getTopItems({origins: ['podcast']})
        .map(x => allMedia.find(y => (y.title || y.name) === x.title));

      const recentlyWatched = getRecentlyWatched({origins: ['podcast']})
        .map(x => allMedia.find(y => (y.title || y.name) === x.title));

      const data = {
        'top': topItems,
        'recent': recentlyWatched
      }

      console.log('sliderData', data);

      if (topItems.length > 0 && recentlyWatched.length > 0) {
        setData(data);
        setIsLoading(false);
        return;
      }

    } catch (error) {
      console.error('getTopItems error, retrying in', delay, 'ms:', error);
      setTimeout(() => getTopPodcasts(Math.min(delay * 2, 5000), retries + 1), delay);
    }
  };

  useEffect(() => {
    getTopPodcasts();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <SplideSlider type="Most Consumed" data={data.top}/>
      <SplideSlider type="Recently Watched" data={data.recent}/>
    </>
  );
}

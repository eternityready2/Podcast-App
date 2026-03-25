'use client';
import { useState, useEffect } from 'react';
import SplideSlider from "@/components/splideSlider";

export default function PodcastSlider({ allMedia }: { allMedia: any[] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ top?: any[]; recent?: any[] }>({
    top: [],
    recent: [],
  });

  const getTopPodcasts = async (delay = 100, retries = 0) => {
    if (retries > 20) {
      setIsLoading(false);
      return;
    }
    try {
      const topItems = getTopItems({origins: ['podcast']})
        .map(x => allMedia.find(y => (y.title || y.name) === x.title))
        .filter(Boolean);

      const recentlyWatched = getRecentlyWatched({origins: ['podcast']})
        .map(x => allMedia.find(y => (y.title || y.name) === x.title))
        .filter(Boolean);

      const data = {
        'top': topItems,
        'recent': recentlyWatched
      }

      console.log('sliderData', data);

      if (topItems.length > 0 || recentlyWatched.length > 0) {
        setData(data);
        setIsLoading(false);
        return;
      }

      // No data available yet — retry (global tracking may not be populated)
      setTimeout(() => getTopPodcasts(Math.min(delay * 2, 5000), retries + 1), delay);

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

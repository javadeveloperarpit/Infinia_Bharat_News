export function getYoutubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([^&?/]+)/
  );

  return match?.[1] ?? "";
}

export function getYoutubeThumbnail(url: string): string {
  const id = getYoutubeId(url);

  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function getYoutubeEmbedUrl(url: string): string {
  return `https://www.youtube.com/embed/${getYoutubeId(url)}`;
}
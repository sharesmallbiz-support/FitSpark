interface VideoPlayerProps {
  youtubeId: string;
  title: string;
  autoplay?: boolean;
}

export default function VideoPlayer({ youtubeId, title, autoplay = false }: VideoPlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}${autoplay ? '?autoplay=1' : ''}`;

  return (
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        data-testid="iframe-youtube-player"
      ></iframe>
    </div>
  );
}

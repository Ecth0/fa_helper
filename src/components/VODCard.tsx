import { X } from 'lucide-react';

interface VODCardProps {
  vod: {
    id: string;
    url: string;
    title: string;
    thumbnail: string;
  };
  onRemove: (vodId: string) => void;
}

export function VODCard({ vod, onRemove }: VODCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/320x180?text=VOD';
  };

  return (
    <div className="group relative">
      <a
        href={`https://youtube.com/watch?v=${vod.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative overflow-hidden rounded-lg aspect-video bg-gray-800"
      >
        <img
          src={vod.thumbnail}
          alt={vod.title}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:opacity-75 transition"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </a>
      <button
        onClick={() => onRemove(vod.id)}
        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
      >
        <X className="w-4 h-4 text-white" />
      </button>
      <p className="text-sm text-gray-300 mt-2 truncate">{vod.title}</p>
    </div>
  );
}

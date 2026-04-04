import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward,
  Settings
} from 'lucide-react';

interface Chapter {
  title: string;
  startTime: number; // seconds
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  chapters?: Chapter[];
  onProgress?: (currentTime: number, duration: number, percent: number) => void;
  onComplete?: () => void;
  initialTime?: number;
  poster?: string;
}

/**
 * Extract YouTube video ID from various URL formats.
 * Supports youtube.com/watch?v=, youtu.be/, youtube.com/embed/, and youtube.com/shorts/
 */
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * YouTube embed component for YouTube video URLs.
 */
function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title || 'YouTube video'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {title && (
        <div className="p-3 bg-card">
          <h3 className="font-medium text-foreground text-sm">{title}</h3>
        </div>
      )}
    </div>
  );
}

export default function VideoPlayer({
  src, title, chapters = [], onProgress, onComplete, initialTime = 0, poster
}: VideoPlayerProps) {
  // Check if the source is a YouTube URL
  const youtubeId = getYouTubeId(src);
  if (youtubeId) {
    return <YouTubeEmbed videoId={youtubeId} title={title} />;
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [completed, setCompleted] = useState(false);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Set initial time on load
  useEffect(() => {
    const video = videoRef.current;
    if (video && initialTime > 0) {
      video.currentTime = initialTime;
    }
  }, [initialTime]);

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    const percent = duration > 0 ? (video.currentTime / duration) * 100 : 0;
    onProgress?.(video.currentTime, duration, percent);

    // Mark complete at 90%
    if (percent >= 90 && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  }, [duration, onProgress, onComplete, completed]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
  }, [duration]);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (video) video.currentTime = value[0];
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (video) {
      video.volume = value[0];
      setVolume(value[0]);
      setMuted(value[0] === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const changePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    if (videoRef.current) videoRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  }, [playbackRate]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  // Current chapter
  const currentChapter = chapters.filter(c => currentTime >= c.startTime).pop();

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setPlaying(false); onComplete?.(); }}
      />

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Chapter markers on progress bar */}
        <div className="relative mb-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          {chapters.map((chapter, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-yellow-400 rounded cursor-pointer"
              style={{ left: `${(chapter.startTime / (duration || 1)) * 100}%` }}
              title={chapter.title}
              onClick={() => handleSeek([chapter.startTime])}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => seek(-10)}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => seek(10)}>
              <SkipForward className="w-4 h-4" />
            </Button>
            <span className="text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            {currentChapter && (
              <span className="text-xs text-yellow-300 ml-3">📍 {currentChapter.title}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
            <Button
              variant="ghost" size="sm"
              className="text-white hover:bg-white/20 text-xs font-mono"
              onClick={changePlaybackRate}
            >
              {playbackRate}x
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}

      {/* Play button overlay when paused */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}

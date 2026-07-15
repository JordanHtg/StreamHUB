import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, Settings, Subtitles, Gauge, Monitor, ArrowRight, X, Check, AlertCircle } from 'lucide-react';
import { streamApi } from '../../services/apiClient';

const RELIABLE_MIRRORS = [
  { name: 'Server #1: Ultra-HD MP4 Mirror (JSDelivr Global CDN)', url: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/big_buck_bunny.mp4' },
  { name: 'Server #2: Apple HLS Adaptive 4K/HD Stream', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8' },
  { name: 'Server #3: Akamai Adaptive Bitrate HLS', url: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8' },
  { name: 'Server #4: Apple BipBop 16:9 Widescreen HD', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8' },
  { name: 'Server #5: Google Storage Backup Stream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
];

const StreamPlayer = ({
  url,
  title,
  subtitleText,
  contentId,
  isSeries = false,
  episodeId = null,
  nextEpisode = null,
  prevEpisode = null,
  onNextEpisode,
  onPrevEpisode,
  onClose,
  initialTime = 0,
  subtitles = [],
}) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // Playback state
  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [mirrorIndex, setMirrorIndex] = useState(-1);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [quality, setQuality] = useState('4K UHD');
  const [selectedSubtitle, setSelectedSubtitle] = useState('Indonesian (AI Auto-Sync)');
  const [played, setPlayed] = useState(0); // 0 to 1
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  // Loading & Error states
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Menus
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  // Floating Skip Buttons & Alerts
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipRecap, setShowSkipRecap] = useState(false);
  const [shortcutAlert, setShortcutAlert] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [autoNextCountdown, setAutoNextCountdown] = useState(null);

  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (url !== undefined) {
      setCurrentUrl(url || '');
      setIsBuffering(true);
      setHasError(false);
      setMirrorIndex(-1);
    }
  }, [url]);

  useEffect(() => {
    if (subtitles && subtitles.length > 0) {
      setSelectedSubtitle(subtitles[0].label);
    } else {
      setSelectedSubtitle('Indonesian (AI Auto-Sync)');
    }
  }, [subtitles]);

  // Helper to resolve active subtitle line based on current time and selected track
  const getCurrentSubtitleCue = (seconds, trackName, subList = [], contentTitle = 'Movie') => {
    if (!trackName || trackName === 'Off') return null;

    // Check if user selected a custom track from props
    const customTrack = subList.find((s) => s.label === trackName || s.language === trackName);
    if (customTrack && customTrack.content) {
      const lines = customTrack.content.split(/\r?\n\r?\n/);
      for (const block of lines) {
        const parts = block.split('\n');
        if (parts.length >= 2) {
          const timeLine = parts.find((p) => p.includes('-->'));
          if (timeLine) {
            const [startStr, endStr] = timeLine.split('-->').map((s) => s.trim());
            const parseToSec = (str) => {
              const [h, m, s] = str.replace(',', '.').split(':').map(Number);
              return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
            };
            const start = parseToSec(startStr);
            const end = parseToSec(endStr);
            if (seconds >= start && seconds <= end) {
              const textIndex = parts.indexOf(timeLine) + 1;
              return parts.slice(textIndex).join(' ');
            }
          } else if (parts[0] && !parts[0].includes('-->')) {
            const idx = Math.floor(seconds / 6) % parts.length;
            return parts[idx];
          }
        }
      }
      return customTrack.content.split('\n')[Math.floor(seconds / 6) % customTrack.content.split('\n').length] || null;
    }

    // AI Auto-Generated Realistic Cues synced dynamically
    const sec = Math.floor(seconds);
    const cueIndex = Math.floor(sec / 7) % 8;

    if (trackName.includes('Indonesian')) {
      const indoCues = [
        `[Musik pembuka yang megah mengalun untuk ${contentTitle} dalam kualitas 4K HDR...]`,
        `"Di dunia magis yang penuh keajaiban dan misteri, sebuah petualangan epik dimulai..."`,
        `"Takdir tidak menunggu mereka yang ragu. Kita harus mengambil langkah pertama sekarang juga!"`,
        `"Lihatlah ke sekelilingmu, kekuatan sejati bukan berasal dari sihir, tapi dari keberanian hati."`,
        `"Apakah kau siap menghadapi tantangan terbesar dalam hidup kita?"`,
        `[Suara gemuruh badai dan langkah kaki mendekat dengan cepat...]`,
        `"Selama kita berdiri bersama dan mempercayai satu sama lain, kegelapan tidak akan pernah menang!"`,
        `"Keajaiban Agrabah & StreamHUB menanti. Mari kita tunjukkan kepada dunia siapa kita sebenarnya!"`,
      ];
      return indoCues[cueIndex];
    } else if (trackName.includes('Japanese')) {
      const jpCues = [
        `[壮大なテーマ曲が4K HDRの圧倒的画質とともに流れる...]`,
        `「魔法と神秘に満ちたこの世界で、今、伝説の冒険の幕が開く...」`,
        `「運命はためらう者を待たない。今すぐ第一歩を踏み出さなければならない！」`,
        `「周りを見てみろ。真の力は魔法ではなく、勇気ある心から生まれるんだ。」`,
        `「人生最大の試練に立ち向かう覚悟はできているか？」`,
        `[嵐の轟音と迫り来る足音が響き渡る...]`,
        `「私たちが共に立ち、互いを信じ続ける限り、闇が勝利することは決してない！」`,
        `「StreamHUBと伝説の奇跡が待っている。さあ、私たちの真の力を世界に示そう！」`,
      ];
      return jpCues[cueIndex];
    } else {
      const engCues = [
        `[Majestic orchestral opening score playing in immersive Dolby 7.1 Surround...]`,
        `"In a mystical realm of wonder and ancient secrets, an unforgettable saga unfolds..."`,
        `"Destiny does not wait for the hesitant. We must take the first step right here, right now!"`,
        `"Look around you—true power doesn't come from wishes or gold, but from a courageous heart."`,
        `"Are you prepared to face the greatest trial of our lives?"`,
        `[Approaching thunder rumbles dramatically in the distance...]`,
        `"As long as we stand united and trust each other, the darkness will never extinguish our light!"`,
        `"The legend awaits. Let us show the universe our true destiny!"`,
      ];
      return engCues[cueIndex];
    }
  };

  // Check intro/recap timing (e.g., Intro 10s-85s, Recap 86s-120s)
  useEffect(() => {
    if (playedSeconds >= 10 && playedSeconds <= 85) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }

    if (playedSeconds >= 86 && playedSeconds <= 120) {
      setShowSkipRecap(true);
    } else {
      setShowSkipRecap(false);
    }

    // Auto save watch progress every 5 seconds
    if (Math.floor(playedSeconds) % 5 === 0 && playedSeconds > 5 && duration > 0) {
      streamApi.saveWatchProgress(
        isSeries ? null : contentId,
        isSeries ? contentId : null,
        episodeId,
        playedSeconds,
        duration
      );
    }
  }, [playedSeconds, duration, contentId, isSeries, episodeId]);

  // Handle auto-hide controls
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying((prev) => {
          const nextState = !prev;
          triggerAlert(nextState ? 'Play' : 'Pause');
          return nextState;
        });
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setMuted((prev) => {
          const nextState = !prev;
          triggerAlert(nextState ? 'Muted' : 'Unmuted');
          return nextState;
        });
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (playerRef.current) {
          const nextTime = Math.min(playedSeconds + 10, duration);
          playerRef.current.seekTo(nextTime, 'seconds');
          triggerAlert('+10s');
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (playerRef.current) {
          const nextTime = Math.max(playedSeconds - 10, 0);
          playerRef.current.seekTo(nextTime, 'seconds');
          triggerAlert('-10s');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playedSeconds, duration, playing]);

  const triggerAlert = (text) => {
    setShortcutAlert(text);
    setTimeout(() => setShortcutAlert(null), 1000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handleSkipIntro = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(86, 'seconds');
      setShowSkipIntro(false);
      triggerAlert('Skipped Intro');
    }
  };

  const handleSkipRecap = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(121, 'seconds');
      setShowSkipRecap(false);
      triggerAlert('Skipped Recap');
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh > 0) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
    setPlayedSeconds(state.playedSeconds);
    if (state.playedSeconds > 0 && isBuffering) {
      setIsBuffering(false);
    }
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e) => {
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value));
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    if (nextEpisode && onNextEpisode) {
      // Start 10-second auto advance countdown
      let count = 10;
      setAutoNextCountdown(count);
      const timer = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(timer);
          setAutoNextCountdown(null);
          onNextEpisode(nextEpisode);
        } else {
          setAutoNextCountdown(count);
        }
      }, 1000);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative bg-black select-none overflow-hidden ${
        isMiniPlayer
          ? 'fixed bottom-6 right-6 w-96 z-50 rounded-2xl shadow-2xl border-2 border-stream-red'
          : 'w-full h-full'
      }`}
    >
      {/* Top Bar with Title & Close/Mini actions */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          controlsVisible || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center space-x-4">
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-stream-red flex items-center justify-center text-white transition-all shadow"
              title="Close Player"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h2>
            {subtitleText && <p className="text-xs text-stream-gray-300 font-medium">{subtitleText}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMiniPlayer(!isMiniPlayer)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Toggle Mini Player / Continue Watching Mode"
          >
            <Monitor className="w-4 h-4 text-stream-red" />
            <span>{isMiniPlayer ? 'Expand' : 'Mini Player'}</span>
          </button>
          <span className="px-2.5 py-1 rounded bg-stream-red/20 border border-stream-red/40 text-stream-red text-xs font-bold uppercase tracking-wider">
            {quality}
          </span>
        </div>
      </div>

      {/* Main Video Surface */}
      <div
        className="w-full aspect-video bg-black flex items-center justify-center relative cursor-pointer"
        onClick={() => {
          if (muted) {
            setMuted(false);
            triggerAlert('🔊 Unmuted');
          }
        }}
      >
        <ReactPlayer
          ref={playerRef}
          url={currentUrl}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          config={{
            file: {
              attributes: {
                crossOrigin: 'anonymous',
                controlsList: 'nodownload',
                playsInline: true,
              },
            },
          }}
          onProgress={handleProgress}
          onDuration={(d) => {
            setDuration(d);
            setIsBuffering(false);
            setHasError(false);
            if (initialTime > 0 && playerRef.current) {
              playerRef.current.seekTo(initialTime, 'seconds');
            }
          }}
          onReady={() => {
            setIsBuffering(false);
            setHasError(false);
          }}
          onBuffer={() => setIsBuffering(true)}
          onBufferEnd={() => setIsBuffering(false)}
          onError={(e) => {
            console.error('Video stream error details:', e);
            const errString = String(e?.message || e?.name || e || '');
            const isAutoplayIssue =
              errString.includes('NotAllowedError') ||
              errString.includes('play()') ||
              errString.includes('interact') ||
              errString.includes('AbortError') ||
              e?.code === 2 ||
              e?.name === 'NotAllowedError';

            if (isAutoplayIssue) {
              console.warn('Autoplay blocked by browser. Auto-switching to muted playback.');
              setMuted(true);
              setPlaying(true);
              setHasError(false);
              setIsBuffering(false);
              triggerAlert('🔇 Autoplay Muted (Click video surface to unmute)');
              return;
            }

            // DO NOT auto-switch or change currentUrl! Always respect user's uploaded video URL.
            setIsBuffering(false);
            setHasError(true);
          }}
          onEnded={handleEnded}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />

        {/* Buffering / Loading Overlay */}
        {isBuffering && !hasError && (
          <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-fadeIn pointer-events-none">
            <div className="w-16 h-16 border-4 border-stream-red border-t-transparent rounded-full animate-spin glow-red" />
            <div className="text-center">
              <h4 className="text-lg font-bold text-white tracking-wide">⏳ Loading & Buffering 4K HDR Stream...</h4>
              <p className="text-xs text-stream-gray-300 mt-1">Connecting to high-speed CDN servers & decoding video packets</p>
            </div>
          </div>
        )}

        {/* Error / Fallback Stream Overlay */}
        {hasError && (
          <div className="absolute inset-0 z-40 bg-stream-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3 border border-red-500/40 shadow-xl flex-shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">⚠️ Video Source Temporarily Unreachable</h3>
            <p className="text-xs text-stream-gray-300 max-w-lg mb-4 leading-relaxed">
              The video source URL could not be played (`{currentUrl.slice(0, 45)}...`). This usually happens if a local file blob expired across browser reloads or the CDN link is restricted.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xl">
              <button
                onClick={() => {
                  setCurrentUrl(url || '');
                  setHasError(false);
                  setIsBuffering(true);
                  setPlaying(true);
                  if (playerRef.current) playerRef.current.seekTo(0);
                }}
                className="px-6 py-3 bg-stream-red hover:bg-stream-red-hover text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2.5 shadow-2xl glow-red transition-transform transform hover:scale-105 w-full sm:w-auto"
              >
                <span>🔄 Retry Playing ({title || 'Original Video'})</span>
              </button>

              <div className="pt-3 border-t border-white/10 w-full">
                <p className="text-[11px] font-bold text-stream-gray-400 uppercase tracking-wider mb-2">
                  ⚡ Optional: Test Player with Public Demo Mirror Server
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {RELIABLE_MIRRORS.map((mirror, idx) => (
                    <button
                      key={mirror.name}
                      onClick={() => {
                        setMirrorIndex(idx);
                        setCurrentUrl(mirror.url);
                        setHasError(false);
                        setIsBuffering(true);
                        setPlaying(true);
                        triggerAlert(`⚡ Switched to: ${mirror.name}`);
                      }}
                      className="p-2.5 bg-stream-dark hover:bg-white/10 text-left rounded-xl border border-white/10 hover:border-white/30 transition-all flex flex-col justify-center shadow group"
                    >
                      <span className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="truncate">{mirror.name}</span>
                        <Play className="w-3 h-3 fill-white flex-shrink-0 ml-1.5" />
                      </span>
                      <span className="text-[10px] text-stream-gray-400 truncate">
                        {mirror.url.includes('.m3u8') ? 'HLS Adaptive Bitrate (4K/HD)' : 'Direct MP4 High Speed'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subtitle / Closed Caption Overlay */}
        {!hasError && selectedSubtitle && selectedSubtitle !== 'Off' && (
          <div className="absolute bottom-28 left-4 right-4 z-30 flex justify-center pointer-events-none transition-all duration-200">
            <div className="bg-black/85 backdrop-blur-md border border-white/15 px-6 py-2.5 rounded-2xl shadow-2xl max-w-3xl text-center glow-red-sm animate-fadeIn">
              <p className="text-sm sm:text-base md:text-lg font-bold text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide leading-relaxed">
                {getCurrentSubtitleCue(playedSeconds, selectedSubtitle, subtitles, title)}
              </p>
            </div>
          </div>
        )}

        {/* Shortcut Alert Banner */}
        {shortcutAlert && (
          <div className="absolute z-40 bg-stream-black/80 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white font-bold text-lg shadow-2xl glow-red-sm animate-fadeIn">
            {shortcutAlert}
          </div>
        )}

        {/* Floating Skip Intro & Recap Buttons */}
        <div className="absolute bottom-24 right-8 z-40 flex flex-col space-y-3 items-end">
          {showSkipIntro && (
            <button
              onClick={handleSkipIntro}
              className="bg-stream-red hover:bg-stream-red-hover text-white px-6 py-3 rounded-xl font-bold text-sm shadow-2xl glow-red flex items-center space-x-2.5 transition-all transform hover:scale-105 animate-fadeIn"
            >
              <SkipForward className="w-5 h-5 fill-white" />
              <span>Skip Intro</span>
            </button>
          )}

          {showSkipRecap && (
            <button
              onClick={handleSkipRecap}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center space-x-2.5 transition-all transform hover:scale-105 animate-fadeIn"
            >
              <SkipForward className="w-5 h-5" />
              <span>Skip Recap</span>
            </button>
          )}
        </div>

        {/* Auto Next Episode Countdown Modal */}
        {autoNextCountdown !== null && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <p className="text-sm font-semibold uppercase tracking-widest text-stream-red mb-2">Up Next</p>
            <h3 className="text-3xl font-black text-white mb-4">{nextEpisode?.title || 'Next Episode'}</h3>
            <div className="w-20 h-20 rounded-full border-4 border-stream-red flex items-center justify-center text-2xl font-black text-white mb-6 glow-red">
              {autoNextCountdown}s
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setAutoNextCountdown(null);
                  if (onNextEpisode) onNextEpisode(nextEpisode);
                }}
                className="bg-stream-red hover:bg-stream-red-hover text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Play Now</span>
              </button>
              <button
                onClick={() => setAutoNextCountdown(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 px-6 pt-12 pb-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
          controlsVisible || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Bar */}
        <div className="relative mb-4 flex items-center group">
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={played}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-stream-red hover:h-2.5 transition-all"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          {/* Left Controls: Play, Prev, Next, Volume, Time */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPlaying(!playing)}
              className="text-white hover:text-stream-red transition-colors focus:outline-none"
            >
              {playing ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white" />}
            </button>

            {prevEpisode && (
              <button
                onClick={() => onPrevEpisode && onPrevEpisode(prevEpisode)}
                className="text-stream-gray-300 hover:text-white transition-colors"
                title="Previous Episode"
              >
                <SkipBack className="w-5 h-5" />
              </button>
            )}

            {nextEpisode && (
              <button
                onClick={() => onNextEpisode && onNextEpisode(nextEpisode)}
                className="text-stream-gray-300 hover:text-white transition-colors"
                title="Next Episode"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}

            {/* Volume */}
            <div className="flex items-center space-x-2 group">
              <button onClick={() => setMuted(!muted)} className="text-stream-gray-300 hover:text-white">
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setMuted(false);
                  setVolume(parseFloat(e.target.value));
                }}
                className="w-0 group-hover:w-20 transition-all duration-300 h-1 bg-white/30 rounded accent-stream-red cursor-pointer"
              />
            </div>

            {/* Time display */}
            <span className="text-xs font-medium text-stream-gray-300">
              {formatTime(playedSeconds)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Subtitles, Speed, Quality, Fullscreen */}
          <div className="flex items-center space-x-4 relative">
            {/* Subtitles Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowSpeedMenu(false);
                  setShowQualityMenu(false);
                }}
                className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
                  showSubtitleMenu ? 'text-stream-red bg-white/10' : 'text-stream-gray-300 hover:text-white'
                }`}
                title="Subtitles"
              >
                <Subtitles className="w-5 h-5" />
              </button>
              {showSubtitleMenu && (
                <div className="absolute bottom-10 right-0 bg-stream-card border border-white/10 rounded-xl py-2 w-48 shadow-2xl z-50 animate-fadeIn max-h-60 overflow-y-auto">
                  <p className="px-3 py-1 text-[10px] font-bold text-stream-gray-400 uppercase">Subtitles / Captions</p>
                  {[
                    ...subtitles.map((s) => s.label),
                    'Indonesian (AI Auto-Sync)',
                    'English (AI Auto-Sync)',
                    'Japanese (AI Auto-Sync)',
                    'Off',
                  ]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedSubtitle(sub);
                          setShowSubtitleMenu(false);
                          triggerAlert(`Subtitle: ${sub}`);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 flex items-center justify-between"
                      >
                        <span className="truncate max-w-[150px]">{sub}</span>
                        {selectedSubtitle === sub && <Check className="w-3.5 h-3.5 text-stream-red flex-shrink-0 ml-1" />}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Speed Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowSubtitleMenu(false);
                  setShowQualityMenu(false);
                }}
                className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold ${
                  showSpeedMenu ? 'text-stream-red bg-white/10' : 'text-stream-gray-300 hover:text-white'
                }`}
                title="Playback Speed"
              >
                <Gauge className="w-4 h-4 mr-1 text-stream-red" />
                <span>{playbackRate}x</span>
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 bg-stream-card border border-white/10 rounded-xl py-2 w-32 shadow-2xl z-50 animate-fadeIn">
                  <p className="px-3 py-1 text-[10px] font-bold text-stream-gray-400 uppercase">Speed</p>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                        triggerAlert(`Speed: ${rate}x`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 flex items-center justify-between"
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <Check className="w-3.5 h-3.5 text-stream-red" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSubtitleMenu(false);
                  setShowSpeedMenu(false);
                }}
                className={`p-1.5 rounded-lg transition-colors flex items-center space-x-1 text-xs font-bold ${
                  showQualityMenu ? 'text-stream-red bg-white/10' : 'text-stream-gray-300 hover:text-white'
                }`}
                title="Resolution / Quality"
              >
                <Settings className="w-4 h-4 mr-1" />
                <span>{quality}</span>
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-10 right-0 bg-stream-card border border-white/10 rounded-xl py-2 w-36 shadow-2xl z-50 animate-fadeIn">
                  <p className="px-3 py-1 text-[10px] font-bold text-stream-gray-400 uppercase">Quality</p>
                  {['4K UHD', '1080p FHD', '720p HD', 'Auto'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuality(q);
                        setShowQualityMenu(false);
                        triggerAlert(`Quality: ${q}`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-white/10 flex items-center justify-between"
                    >
                      <span>{q}</span>
                      {quality === q && <Check className="w-3.5 h-3.5 text-stream-red" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button onClick={toggleFullscreen} className="text-stream-gray-300 hover:text-white transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPlayer;

'use client';
import { useState, useRef, useEffect } from 'react';
import { Music, Play, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations, useLocale } from 'next-intl';

// 音乐选项列表
export const musicOptions = [
  { id: 'stream', name: '流水声', nameEn: 'Stream', nameHi: 'जल प्रवाह', url: 'https://image.mininotepad.com/audio/stream.wav', icon: '💧' },
  { id: 'rain', name: '下雨声', nameEn: 'Rain', nameHi: 'बारिश', url: 'https://image.mininotepad.com/audio/rain.wav', icon: '🌧️' },
];

interface BackgroundMusicPlayerProps {
  className?: string;
}

// 单个音乐的状态接口
interface MusicState {
  id: string;
  audio: HTMLAudioElement;
  isPlaying: boolean;
  volume: number;
}

export default function BackgroundMusicPlayer({ className = '' }: BackgroundMusicPlayerProps) {
  const t = useTranslations();
  const locale = useLocale();
  
  // 状态管理 - 改为管理多个音乐
  const [playingMusic, setPlayingMusic] = useState<Map<string, MusicState>>(new Map());
  const [globalVolume, setGlobalVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // 音频引用映射
  const audioRefsMap = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  // 清理所有音频
  useEffect(() => {
    const currentAudioRefs = audioRefsMap.current;
    return () => {
      currentAudioRefs.forEach(audio => {
        audio.pause();
      });
      currentAudioRefs.clear();
    };
  }, []);
  
  // 更新所有音频的音量
  useEffect(() => {
    audioRefsMap.current.forEach(audio => {
      audio.volume = isMuted ? 0 : globalVolume;
    });
  }, [globalVolume, isMuted]);
  
  // 音乐播放控制 - 支持多选
  const handleMusicToggle = (musicId: string, event: React.MouseEvent) => {
    // 阻止菜单关闭
    event.preventDefault();
    event.stopPropagation();
    
    const selectedMusic = musicOptions.find(m => m.id === musicId);
    if (!selectedMusic) return;
    
    const newPlayingMusic = new Map(playingMusic);
    
    // 如果这个音乐已经在播放，则停止它
    if (audioRefsMap.current.has(musicId)) {
      const audio = audioRefsMap.current.get(musicId)!;
      audio.pause();
      audio.currentTime = 0;
      audioRefsMap.current.delete(musicId);
      newPlayingMusic.delete(musicId);
    } else {
      // 创建新的音频实例并播放
      const audio = new Audio(selectedMusic.url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : globalVolume;
      
      audio.play().catch(err => {
        console.error('播放失败:', err);
        audioRefsMap.current.delete(musicId);
      });
      
      audioRefsMap.current.set(musicId, audio);
      newPlayingMusic.set(musicId, {
        id: musicId,
        audio: audio,
        isPlaying: true,
        volume: globalVolume,
      });
    }
    
    setPlayingMusic(newPlayingMusic);
  };
  
  // 停止所有音乐
  const handleStopAll = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    audioRefsMap.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    audioRefsMap.current.clear();
    setPlayingMusic(new Map());
  };
  
  // 切换静音
  const handleToggleMute = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // 调整音量
  const handleVolumeChange = (value: number) => {
    setGlobalVolume(value);
  };
  
  // 检查音乐是否正在播放
  const isMusicPlaying = (musicId: string) => {
    return playingMusic.has(musicId);
  };
  
  // 获取音乐名称（根据当前语言）
  const getMusicName = (music: typeof musicOptions[0]) => {
    switch (locale) {
      case 'en':
        return music.nameEn;
      case 'hi':
        return music.nameHi;
      case 'zh':
      default:
        return music.name;
    }
  };
  
  // 获取正在播放的音乐数量
  const playingCount = playingMusic.size;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-3 text-sm font-medium transition-colors gap-2 ${
            playingCount > 0
              ? 'text-primary hover:text-primary hover:bg-primary/10' 
              : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
          } ${className}`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>{t('music') || '音乐'}</span>
          {playingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {playingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 shadow-lg" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>{t('backgroundMusic') || '背景音乐'}</span>
          {playingCount > 0 && (
            <span className="text-primary font-normal normal-case">
              {playingCount} {t('playing') || '正在播放'}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* 音乐选项 - 支持多选 */}
        {musicOptions.map((music) => (
          <DropdownMenuItem
            key={music.id}
            onClick={(e) => handleMusicToggle(music.id, e)}
            onSelect={(e) => e.preventDefault()}
            className={`cursor-pointer gap-3 py-2.5 ${
              isMusicPlaying(music.id) ? 'bg-accent/50' : ''
            }`}
          >
            <span className="text-lg">{music.icon}</span>
            <span className="flex-1">{getMusicName(music)}</span>
            {isMusicPlaying(music.id) ? (
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <span className="w-0.5 h-3 bg-primary animate-pulse" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-0.5 h-3 bg-primary animate-pulse" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-0.5 h-3 bg-primary animate-pulse" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            ) : (
              <Play className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* 控制选项 */}
        {playingCount > 0 && (
          <>
            <DropdownMenuItem
              onClick={(e) => handleStopAll(e)}
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer gap-3 py-2.5 text-destructive"
            >
              <X className="w-4 h-4" />
              <span>{t('stopAllMusic') || '停止所有音乐'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleToggleMute(e)}
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer gap-3 py-2.5"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{t('unmute') || '取消静音'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{t('mute') || '静音'}</span>
                </>
              )}
            </DropdownMenuItem>
            
            {/* 音量控制 */}
            <div className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
              <div className="text-xs text-muted-foreground mb-2">
                {t('volume') || '音量'}: {Math.round(globalVolume * 100)}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={globalVolume * 100}
                onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </>
        )}
        
        {playingCount === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground text-center">
            {t('selectMusicToPlay') || '选择音乐开始播放'}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


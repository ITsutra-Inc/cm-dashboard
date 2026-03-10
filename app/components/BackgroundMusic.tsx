'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [showControls, setShowControls] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/competitive-bg.mp3')
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {showControls && isPlaying && (
        <div className="absolute bottom-14 right-0 glass rounded-xl p-3 border border-white/10 mb-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-purple-500 cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 text-center mt-1">
            {Math.round(volume * 100)}%
          </p>
        </div>
      )}

      <button
        onClick={togglePlay}
        className={`
          group relative w-12 h-12 rounded-xl flex items-center justify-center
          transition-all duration-300 shadow-lg cursor-pointer
          ${isPlaying
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-purple-500/30 hover:shadow-purple-500/50'
            : 'glass border border-white/10 hover:border-purple-500/30'
          }
        `}
        title={isPlaying ? 'Mute background music' : 'Play competitive background music'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-5 h-5 text-white" />
            <span className="absolute inset-0 rounded-xl border-2 border-purple-400/50 animate-ping" />
          </>
        ) : (
          <VolumeX className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
        )}
      </button>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Try autoplay immediately (works on refresh / if browser allows)
    audio.play().then(() => setStarted(true)).catch(() => {})

    const ensurePlaying = () => {
      if (audio.paused) {
        audio.play().then(() => setStarted(true)).catch(() => {})
      }
    }

    // If audio gets paused for any reason, restart it
    audio.addEventListener('pause', () => {
      audio.play().catch(() => {})
    })

    // Resume when tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') ensurePlaying()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const handleInteraction = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.play().then(() => setStarted(true)).catch(() => {})
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/competitive-bg.mp3"
        loop
        autoPlay
        preload="auto"
        style={{ display: 'none' }}
      />
      {/* Full-screen invisible overlay to capture first interaction */}
      {!started && (
        <div
          onClick={handleInteraction}
          onMouseMove={handleInteraction}
          onTouchStart={handleInteraction}
          onScroll={handleInteraction}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            cursor: 'default',
          }}
        />
      )}
    </>
  )
}

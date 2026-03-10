'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const audio = new Audio('/competitive-bg.mp3')
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    const startPlayback = () => {
      if (startedRef.current) return
      startedRef.current = true
      audio.play().catch(() => {})
    }

    // Try autoplay immediately
    audio.play().catch(() => {})

    // Fallback: start on first user interaction (browsers block autoplay without it)
    document.addEventListener('click', startPlayback, { once: true })
    document.addEventListener('keydown', startPlayback, { once: true })
    document.addEventListener('touchstart', startPlayback, { once: true })
    document.addEventListener('scroll', startPlayback, { once: true })
    document.addEventListener('mousemove', startPlayback, { once: true })

    return () => {
      audio.pause()
      audio.src = ''
      document.removeEventListener('click', startPlayback)
      document.removeEventListener('keydown', startPlayback)
      document.removeEventListener('touchstart', startPlayback)
      document.removeEventListener('scroll', startPlayback)
      document.removeEventListener('mousemove', startPlayback)
    }
  }, [])

  return null
}

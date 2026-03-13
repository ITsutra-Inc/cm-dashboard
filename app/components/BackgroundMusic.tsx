'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const startedRef = useRef(false)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Approach 1: Try Web Audio API — can bypass autoplay in some browsers/signage
    const tryWebAudio = async () => {
      try {
        if (ctxRef.current) return
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        ctxRef.current = ctx
        if (ctx.state === 'suspended') await ctx.resume()
        const source = ctx.createMediaElementSource(audio)
        source.connect(ctx.destination)
        await audio.play()
        startedRef.current = true
        removeListeners()
      } catch {
        // Fall through to regular play
      }
    }

    // Approach 2: Regular HTML5 audio play
    const tryPlay = async () => {
      if (startedRef.current && !audio.paused) return
      try {
        if (!ctxRef.current) await tryWebAudio()
        if (audio.paused) {
          await audio.play()
          startedRef.current = true
          removeListeners()
        }
      } catch {
        // Blocked — wait for interaction
      }
    }

    // Try immediately on mount
    tryPlay()

    // User-activation events that browsers recognize
    const activationEvents = ['click', 'pointerdown', 'mousedown', 'touchstart', 'keydown', 'keyup']

    const handleActivation = () => {
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume().catch(() => {})
      }
      tryPlay()
    }

    const removeListeners = () => {
      activationEvents.forEach(e => document.removeEventListener(e, handleActivation, true))
      clearInterval(interval)
    }

    // Capture phase on document — catches ANY interaction
    activationEvents.forEach(e => document.addEventListener(e, handleActivation, true))

    // Retry periodically
    const interval = setInterval(tryPlay, 500)

    // Keep music playing — restart if paused
    const handlePause = () => { audio.play().catch(() => {}) }
    audio.addEventListener('pause', handlePause)

    // Resume when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (ctxRef.current?.state === 'suspended') {
          ctxRef.current.resume().catch(() => {})
        }
        tryPlay()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Signage/Cast: simulate a user gesture by programmatically clicking
    // after a short delay — some cast browsers allow this
    const signageTimer = setTimeout(() => {
      if (!startedRef.current) {
        document.body.click()
        tryPlay()
      }
    }, 1000)

    return () => {
      removeListeners()
      clearTimeout(signageTimer)
      audio.removeEventListener('pause', handlePause)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

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
      {/* Hidden iframe trick — some signage browsers allow autoplay within iframes */}
      <iframe
        src="/autoplay-audio.html"
        allow="autoplay"
        style={{ display: 'none' }}
        title="audio"
      />
    </>
  )
}

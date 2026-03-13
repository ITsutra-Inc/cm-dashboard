'use client'

import { useEffect } from 'react'

export default function BackgroundMusic() {
  useEffect(() => {
    // Listen for user interaction on the main page and forward it to the iframe
    const activationEvents = ['click', 'pointerdown', 'mousedown', 'touchstart', 'keydown', 'keyup']
    const handleActivation = () => {
      const iframe = document.getElementById('bg-audio-frame') as HTMLIFrameElement
      iframe?.contentWindow?.postMessage('play', '*')
      removeListeners()
    }
    const removeListeners = () => {
      activationEvents.forEach(e => document.removeEventListener(e, handleActivation, true))
    }
    activationEvents.forEach(e => document.addEventListener(e, handleActivation, true))

    // Also try triggering after a delay for signage
    const timer = setTimeout(() => {
      const iframe = document.getElementById('bg-audio-frame') as HTMLIFrameElement
      iframe?.contentWindow?.postMessage('play', '*')
    }, 1000)

    return () => {
      removeListeners()
      clearTimeout(timer)
    }
  }, [])

  return (
    <iframe
      id="bg-audio-frame"
      src="/autoplay-audio.html"
      allow="autoplay"
      style={{ display: 'none' }}
      title="audio"
    />
  )
}

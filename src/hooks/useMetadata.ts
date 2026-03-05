import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Metadata } from '../types/metadata'

export function useMetadata() {
  const { metadata, isLoading, error, setMetadata, setLoading, setError } = useAppStore()

  useEffect(() => {
    if (metadata || isLoading) return

    setLoading(true)
    fetch('/data/metadata.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Metadata>
      })
      .then((data) => {
        setMetadata(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load metadata')
        setLoading(false)
      })
  }, [metadata, isLoading, setMetadata, setLoading, setError])

  return { metadata, isLoading, error }
}

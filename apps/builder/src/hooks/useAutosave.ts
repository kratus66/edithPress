'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface UseAutosaveOptions {
  /** ID de la página — incluido para contexto/debug */
  pageId: string
  /** Función que persiste el data en la API */
  onSave: (data: any) => Promise<void>
  /** Milisegundos de inactividad antes de guardar (default: 3000) */
  debounceMs?: number
}

interface UseAutosaveReturn {
  status: SaveStatus
  lastSaved: Date | null
  /** Guarda inmediatamente, cancelando cualquier debounce pendiente */
  saveNow: () => Promise<void>
  /**
   * Pasa esta función como prop `onChange` de Puck.
   * Recibe el nuevo data, lo almacena internamente y dispara el debounce de guardado.
   */
  onChange: (data: any) => void
}

export function useAutosave({
  onSave,
  debounceMs = 3000,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Refs para no perder valores en closures
  const dataRef = useRef<any>(null)
  const onSaveRef = useRef(onSave)
  const isSavingRef = useRef(false)
  const hasUnsavedRef = useRef(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const periodicTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Mantener onSave actualizado sin recrear executeSave
  useEffect(() => {
    onSaveRef.current = onSave
  })

  // Función de guardado real — solo llama a la API una vez aunque se llame varias veces
  const executeSave = useCallback(async () => {
    if (isSavingRef.current) return
    isSavingRef.current = true
    setStatus('saving')
    try {
      await onSaveRef.current(dataRef.current)
      setStatus('saved')
      setLastSaved(new Date())
      hasUnsavedRef.current = false
    } catch {
      setStatus('error')
      // Reintento automático una vez tras 5 segundos
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      retryTimerRef.current = setTimeout(() => {
        if (hasUnsavedRef.current) {
          void executeSave()
        }
      }, 5000)
    } finally {
      isSavingRef.current = false
    }
  }, []) // Sin dependencias: usa refs para todo

  /** Guarda inmediatamente, cancelando debounce y retry pendientes */
  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    await executeSave()
  }, [executeSave])

  /**
   * Llamar desde Puck's onChange.
   * Registra el nuevo data y programa un guardado con debounce.
   */
  const onChange = useCallback(
    (newData: any) => {
      dataRef.current = newData
      setStatus('unsaved')
      hasUnsavedRef.current = true

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        void executeSave()
      }, debounceMs)
    },
    [debounceMs, executeSave]
  )

  // Guardado periódico cada 30s si quedan cambios pendientes
  useEffect(() => {
    periodicTimerRef.current = setInterval(() => {
      if (hasUnsavedRef.current && !isSavingRef.current) {
        void executeSave()
      }
    }, 30_000)
    return () => {
      if (periodicTimerRef.current) clearInterval(periodicTimerRef.current)
    }
  }, [executeSave])

  // Prevenir salida accidental con cambios sin guardar
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      if (periodicTimerRef.current) clearInterval(periodicTimerRef.current)
    }
  }, [])

  return { status, lastSaved, saveNow, onChange }
}

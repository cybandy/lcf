import type { FilePlugin } from '../utils/types'

export function useFile() {
  const { $file } = useNuxtApp()
  return $file as FilePlugin
}

import { useLayout } from './useLayout'

export const usePosition = () => {
  return useLayout()?.value?.position
}

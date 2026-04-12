import { useQuery } from '@tanstack/react-query'

export function useMaterials() {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const res = await fetch('/api/materials')
      if (!res.ok) throw new Error('자재 목록을 불러오지 못했습니다.')
      return res.json()
    },
    staleTime: Infinity,
  })
}

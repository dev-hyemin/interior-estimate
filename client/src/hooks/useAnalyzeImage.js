import { useMutation } from '@tanstack/react-query'

export function useAnalyzeImage() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `서버 오류: ${res.status}`)
      }

      return res.json()
    },
  })
}

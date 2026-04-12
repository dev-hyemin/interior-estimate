import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function ImageUploader({ onFileSelect, isLoading }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    disabled: isLoading,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl">🏠</div>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-600 font-medium">Claude AI가 도면을 분석하고 있습니다...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600 font-medium text-lg">여기에 놓아주세요!</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium text-lg">도면 이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-gray-400 text-sm">JPG, PNG 파일 (최대 10MB)</p>
          </>
        )}
      </div>
    </div>
  )
}

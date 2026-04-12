import { useLocation, useNavigate } from 'react-router-dom'

const STEPS = [
  { path: '/', label: '업로드', step: 1 },
  { path: '/review', label: '치수 검토', step: 2 },
  { path: '/design', label: '3D 디자인', step: 3 },
  { path: '/estimate', label: '견적서', step: 4 },
]

export default function Layout({ children }) {
  const location = useLocation()
  const currentStep = STEPS.find((s) => s.path === location.pathname)?.step || 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">인테리어 견적 시스템</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((step, idx) => (
              <div key={step.path} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep > step.step
                        ? 'bg-green-500 text-white'
                        : currentStep === step.step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.step ? '✓' : step.step}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${
                      currentStep === step.step ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mb-5 transition-colors ${
                      currentStep > step.step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

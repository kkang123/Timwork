import { useMetadata } from './hooks/useMetadata'
import { Sidebar } from './components/Sidebar'
import { ContextBar } from './components/ContextBar'
import { DrawingViewer } from './components/DrawingViewer'

function App() {
  const { isLoading, error } = useMetadata()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <div className="text-center">
          <div className="text-lg mb-2">도면 데이터 로딩 중...</div>
          <div className="text-sm text-gray-500">metadata.json 불러오는 중</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-red-400">
        <div className="text-center">
          <div className="text-lg mb-2">데이터 로드 실패</div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      <ContextBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <DrawingViewer />
      </div>
    </div>
  )
}

export default App

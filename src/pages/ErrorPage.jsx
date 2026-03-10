import {useNavigate} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {AlertTriangle} from 'lucide-react'

export default function ErrorPage({error, errorInfo, onReset}) {
  const navigate = useNavigate()

  const handleGoHome = () => {
    if (onReset) onReset()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-2xl w-full">
        <div className="flex justify-center">
          <div className="p-6 rounded-2xl bg-red-50">
            <AlertTriangle className="size-16 text-red-600" strokeWidth={1.5}/>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Something Went Wrong</h2>
          <p className="text-muted-foreground">An unexpected error occurred. Please try again or go back to the home page.</p>
        </div>
        {error && (
          <div className="text-left bg-white border border-red-200 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700">{error.toString()}</p>
            {errorInfo?.componentStack && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer font-medium text-gray-600 mb-2">Component Stack</summary>
                <pre className="overflow-auto whitespace-pre-wrap break-words max-h-48 mt-2">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>Reload Page</Button>
          <Button onClick={handleGoHome}>Go to Home</Button>
        </div>
      </div>
    </div>
  )
}

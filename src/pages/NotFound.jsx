import {useNavigate} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {FileQuestion} from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 rounded-2xl bg-blue-50">
            <FileQuestion className="size-16 text-blue-600" strokeWidth={1.5}/>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    </div>
  )
}

import {useNavigate} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {Button} from '@/components/ui/button'
import {LogOut, User} from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function Layout({children}) {
  const {user, signOut} = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div
                className="text-xl font-bold text-primary cursor-pointer"
                onClick={() => navigate('/')}
              >
                Omniscience
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground"/>
                <span className="hidden sm:inline text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut className="size-4"/>
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs/>
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

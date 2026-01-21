import {useNavigate} from 'react-router-dom'
import {useAuth} from '@/contexts/AuthContext'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'

export default function Home() {
  const {user, accessToken, signOut} = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>You are successfully authenticated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Email:</span> {user?.email}
            </div>
            <div>
              <span className="font-medium">User ID:</span> {user?.id}
            </div>
            <div>
              <span className="font-medium">Created:</span>{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protected Content</CardTitle>
            <CardDescription>This page is only accessible to authenticated users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can now access all protected features of the application. This demonstrates that the
              Supabase authentication flow is working correctly.
            </p>
            <Button onClick={() => navigate('/student-classes')}>
              View Student Classes
            </Button>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Token</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="w-full wrap-anywhere">
              {accessToken}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

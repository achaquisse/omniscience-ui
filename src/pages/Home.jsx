import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {ClipboardCheck, FileBadge, FileDigit} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [showComingSoon, setShowComingSoon] = useState(false)

  const modules = [
    {
      id: 'class-attendance',
      name: 'Attendance',
      description: 'Manage student class attendance',
      icon: ClipboardCheck,
      path: '/attendance',
      color: 'text-blue-600'
    },
    {
      id: 'certificates',
      name: 'Certificates',
      description: 'Generate certificate of participation',
      icon: FileBadge,
      path: '/certificates',
      color: 'text-purple-600'
    },
    {
      id: 'grades',
      name: 'Grades',
      description: 'Student evaluations and grades',
      icon: FileDigit,
      path: '/grades',
      color: 'text-red-600',
      disabled: true
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Home</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Select a module to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon
          return (
            <Card
              key={module.id}
              className={`transition-all border-2 ${module.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer group hover:border-primary'}`}
              onClick={() => module.disabled ? setShowComingSoon(true) : navigate(module.path)}
            >
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <div
                    className={`p-4 sm:p-6 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors ${module.color}`}>
                    <IconComponent className="size-10 sm:size-12" strokeWidth={1.5}/>
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">{module.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-xs sm:text-sm">{module.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Under Development</DialogTitle>
            <DialogDescription>Coming Soon</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

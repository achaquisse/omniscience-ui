import {useNavigate} from 'react-router-dom'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {ClipboardCheck} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  const modules = [
    {
      id: 'class-attendance',
      name: 'Class Attendance',
      description: 'Manage student class attendance',
      icon: ClipboardCheck,
      path: '/student-classes',
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Home</h1>
        <p className="text-muted-foreground mt-2">Select a module to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon
          return (
            <Card
              key={module.id}
              className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary"
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <div
                    className={`p-6 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors ${module.color}`}>
                    <IconComponent className="size-12" strokeWidth={1.5}/>
                  </div>
                </div>
                <CardTitle className="text-xl">{module.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-sm">{module.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

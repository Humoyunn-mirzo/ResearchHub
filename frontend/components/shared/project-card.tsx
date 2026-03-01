import type { Project } from '@/core/domain'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Badge, Button } from '@/components/ui'
import Link from 'next/link'
import { Calendar, User, Users } from 'lucide-react'
import { format } from 'date-fns'

type ProjectCardProps = {
  project: Project
  actionSlot?: React.ReactNode
}

export function ProjectCard({ project, actionSlot }: ProjectCardProps) {
  return (
    <Card className="flex h-full flex-col transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-xl">{project.title}</CardTitle>
          <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {project.professor && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{project.professor.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{project.maxStudents ? `${project.currentStudents}/${project.maxStudents} spots` : 'Open'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {actionSlot}
      </CardFooter>
    </Card>
  )
}

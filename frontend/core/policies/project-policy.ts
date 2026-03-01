import type { User, Project } from '@/core/domain'
import { ForbiddenError } from '@/core/domain'

export class ProjectPolicy {
  static canCreate(user: User): boolean {
    return user.role === 'PROFESSOR' || user.role === 'DEVELOPER'
  }

  static canUpdate(user: User, project: Project): boolean {
    if (user.role === 'DEVELOPER') return true
    if (user.role === 'PROFESSOR' && project.professorId === user.id) return true
    return false
  }

  static canDelete(user: User, project: Project): boolean {
    return this.canUpdate(user, project)
  }

  static canManageApplications(user: User, project: Project): boolean {
    return this.canUpdate(user, project)
  }

  static canApply(user: User): boolean {
    return user.role === 'STUDENT'
  }

  static assertCanCreate(user: User): void {
    if (!this.canCreate(user)) {
      throw new ForbiddenError('You do not have permission to create projects')
    }
  }

  static assertCanUpdate(user: User, project: Project): void {
    if (!this.canUpdate(user, project)) {
      throw new ForbiddenError('You do not have permission to update this project')
    }
  }

  static assertCanDelete(user: User, project: Project): void {
    if (!this.canDelete(user, project)) {
      throw new ForbiddenError('You do not have permission to delete this project')
    }
  }
}

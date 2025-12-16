import type { Role } from '@/core/domain'

export enum Permission {
  // Projects
  BROWSE_PROJECTS = 'browse_projects',
  CREATE_PROJECT = 'create_project',
  UPDATE_PROJECT = 'update_project',
  DELETE_PROJECT = 'delete_project',
  APPLY_TO_PROJECT = 'apply_to_project',

  // Applications
  VIEW_APPLICATIONS = 'view_applications',
  MANAGE_APPLICATIONS = 'manage_applications',
  VIEW_OWN_APPLICATIONS = 'view_own_applications',

  // Users
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',

  // Admin
  MODERATE_CONTENT = 'moderate_content',
  VIEW_ANALYTICS = 'view_analytics',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  STUDENT: [
    Permission.BROWSE_PROJECTS,
    Permission.APPLY_TO_PROJECT,
    Permission.VIEW_OWN_APPLICATIONS,
  ],
  PROFESSOR: [
    Permission.BROWSE_PROJECTS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.VIEW_APPLICATIONS,
    Permission.MANAGE_APPLICATIONS,
  ],
  UNIVERSITY_ADMIN: [
    Permission.BROWSE_PROJECTS,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.MODERATE_CONTENT,
    Permission.VIEW_ANALYTICS,
  ],
  PLATFORM_ADMIN: [
    Permission.BROWSE_PROJECTS,
    Permission.CREATE_PROJECT,
    Permission.UPDATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.VIEW_APPLICATIONS,
    Permission.MANAGE_APPLICATIONS,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.MODERATE_CONTENT,
    Permission.VIEW_ANALYTICS,
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

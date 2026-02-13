import type { Application, ApplicationStatus, Project } from '@/core/domain'

type Professor = { id: string; name: string; email: string }
type Student = { id: string; name: string; email: string }

const professors: Professor[] = [
  { id: 'prof-1', name: 'Dr. Amina Karimova', email: 'amina.karimova@uni.example' },
  { id: 'prof-2', name: 'Prof. Lukas Weber', email: 'lukas.weber@uni.example' },
  { id: 'prof-3', name: 'Dr. Sofia Rossi', email: 'sofia.rossi@uni.example' },
  { id: 'prof-4', name: 'Prof. Daniel Chen', email: 'daniel.chen@uni.example' },
]

const students: Student[] = [
  { id: 'stud-1', name: 'Nargiza Akhmedova', email: 'nargiza.akhmedova@student.example' },
  { id: 'stud-2', name: 'Bekzod Rustamov', email: 'bekzod.rustamov@student.example' },
  { id: 'stud-3', name: 'Elena Petrova', email: 'elena.petrova@student.example' },
]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function includesCI(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr))
}

let projectSeq = 1000
let applicationSeq = 2000

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Machine Learning for Climate Prediction',
    description:
      'Build and evaluate ML models to forecast regional climate anomalies. Focus on feature engineering, uncertainty, and interpretability.',
    professorId: professors[0]!.id,
    status: 'OPEN',
    slots: 3,
    tags: ['Machine Learning', 'Climate', 'Forecasting', 'Python'],
    createdAt: daysAgo(2),
    professor: professors[0]!,
  },
  {
    id: 'proj-2',
    title: 'Natural Language Processing for Policy Analysis',
    description:
      'Analyze policy documents using topic modeling and retrieval. Work on dataset curation, evaluation, and a lightweight demo UI.',
    professorId: professors[1]!.id,
    status: 'OPEN',
    slots: 2,
    tags: ['NLP', 'IR', 'Policy', 'Transformers'],
    createdAt: daysAgo(6),
    professor: professors[1]!,
  },
  {
    id: 'proj-3',
    title: 'Computer Vision for Urban Mobility',
    description:
      'Detect traffic patterns and estimate flow from camera footage. Emphasis on privacy and robust deployment constraints.',
    professorId: professors[2]!.id,
    status: 'CLOSED',
    slots: 1,
    tags: ['Computer Vision', 'Mobility', 'Edge', 'Optimization'],
    createdAt: daysAgo(18),
    professor: professors[2]!,
  },
  {
    id: 'proj-4',
    title: 'Data Visualization for Regional Research Impact',
    description:
      'Design interactive visualizations and dashboards to showcase collaborations, publications, and project outcomes across institutions.',
    professorId: professors[3]!.id,
    status: 'OPEN',
    slots: 4,
    tags: ['Visualization', 'Dashboards', 'D3', 'UX'],
    createdAt: daysAgo(1),
    professor: professors[3]!,
  },
]

// Expand to a richer dataset (deterministic).
const extraTags = [
  'Biology',
  'Engineering',
  'Economics',
  'Security',
  'Distributed Systems',
  'HCI',
  'Education',
  'Statistics',
  'Data Mining',
]

for (let i = 0; i < 18; i++) {
  const prof = professors[i % professors.length]!
  const status: Project['status'] = i % 4 === 0 ? 'CLOSED' : 'OPEN'
  mockProjects.push({
    id: `proj-${5 + i}`,
    title: `Research Project ${5 + i}: ${extraTags[i % extraTags.length]!}`,
    description:
      'A sample project used for local development. Replace with real backend data when available.',
    professorId: prof.id,
    status,
    slots: 1 + ((i + 2) % 5),
    tags: unique([extraTags[i % extraTags.length]!, 'Collaboration', 'Research']),
    createdAt: daysAgo(3 + i),
    professor: prof,
  })
}

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    projectId: 'proj-1',
    studentId: students[0]!.id,
    status: 'PENDING',
    motivation: 'I have strong Python skills and have worked with time-series forecasting models.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    student: students[0]!,
    project: { id: 'proj-1', title: 'Machine Learning for Climate Prediction' },
  },
]

export function mockFetchProjects(filters: {
  search?: string
  tags?: string[]
  status?: 'OPEN' | 'CLOSED'
  professorId?: string
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest'
}) {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 12

  let list = [...mockProjects]

  if (filters.status) {
    list = list.filter((p) => p.status === filters.status)
  }

  if (filters.professorId) {
    list = list.filter((p) => p.professorId === filters.professorId)
  }

  if (filters.tags && filters.tags.length > 0) {
    const wanted = new Set(filters.tags.map((t) => t.toLowerCase()))
    list = list.filter((p) => p.tags.some((t) => wanted.has(t.toLowerCase())))
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim()
    list = list.filter((p) => {
      const prof = p.professor?.name ?? ''
      return (
        includesCI(p.title, q) ||
        includesCI(p.description, q) ||
        (prof ? includesCI(prof, q) : false) ||
        p.tags.some((t) => includesCI(t, q))
      )
    })
  }

  if (filters.sort === 'oldest') {
    list.sort((a, b) => +a.createdAt - +b.createdAt)
  } else {
    list.sort((a, b) => +b.createdAt - +a.createdAt)
  }

  const total = list.length
  const start = (page - 1) * limit
  const data = list.slice(start, start + limit)

  return { data, total, page, limit }
}

export function mockFetchProjectById(id: string) {
  return mockProjects.find((p) => p.id === id) ?? null
}

export function mockCreateProject(input: {
  title: string
  description: string
  slots: number
  tags: string[]
  professorId: string
  professor: Professor
}) {
  const project: Project = {
    id: `proj-${projectSeq++}`,
    title: input.title,
    description: input.description,
    professorId: input.professorId,
    status: 'OPEN',
    slots: input.slots,
    tags: input.tags,
    createdAt: new Date(),
    professor: input.professor,
  }
  mockProjects.unshift(project)
  return project
}

export function mockCloseProject(id: string) {
  const p = mockProjects.find((x) => x.id === id)
  if (!p) return null
  p.status = 'CLOSED'
  return p
}

export function mockFetchApplications(filters: {
  projectId?: string
  studentId?: string
  status?: ApplicationStatus
  page?: number
  limit?: number
}) {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  let list = [...mockApplications]

  if (filters.projectId) list = list.filter((a) => a.projectId === filters.projectId)
  if (filters.studentId) list = list.filter((a) => a.studentId === filters.studentId)
  if (filters.status) list = list.filter((a) => a.status === filters.status)

  list.sort((a, b) => +b.createdAt - +a.createdAt)

  const total = list.length
  const start = (page - 1) * limit
  const data = list.slice(start, start + limit)

  return { data, total, page, limit }
}

export function mockCreateApplication(input: {
  projectId: string
  studentId: string
  student: Student
  motivation: string
}) {
  const project = mockFetchProjectById(input.projectId)
  if (!project) {
    throw new Error('Project not found')
  }

  const existing = mockApplications.find(
    (a) => a.projectId === input.projectId && a.studentId === input.studentId
  )
  if (existing) {
    return existing
  }

  const now = new Date()
  const app: Application = {
    id: `app-${applicationSeq++}`,
    projectId: input.projectId,
    studentId: input.studentId,
    status: 'PENDING',
    motivation: input.motivation,
    createdAt: now,
    updatedAt: now,
    student: input.student,
    project: { id: project.id, title: project.title },
  }
  mockApplications.unshift(app)
  return app
}


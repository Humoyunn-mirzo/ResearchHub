'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, Upload } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@/components/ui'
import { ProfessorAvatar } from '@/components/professor/professor-avatar'
import {
  deleteProfessorAvatar,
  fetchProfessorById,
  updateProfessorProfile,
  uploadProfessorAvatar,
} from '@/core/services'
import type { ProfessorProfile } from '@/core/domain'
import { useAuthStore } from '@/lib/auth'
import { useTranslation } from '@/lib/i18n'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type FormState = {
  name: string
  title: string
  department: string
  fieldOfStudy: string
  officeLocation: string
  phone: string
  websiteUrl: string
  researchInterests: string
  bio: string
  universityId: string
}

const EMPTY_FORM: FormState = {
  name: '',
  title: '',
  department: '',
  fieldOfStudy: '',
  officeLocation: '',
  phone: '',
  websiteUrl: '',
  researchInterests: '',
  bio: '',
  universityId: '',
}

function toForm(professor: ProfessorProfile): FormState {
  return {
    name: professor.name ?? '',
    title: professor.title ?? '',
    department: professor.department ?? '',
    fieldOfStudy: professor.fieldOfStudy ?? '',
    officeLocation: professor.officeLocation ?? '',
    phone: professor.phone ?? '',
    websiteUrl: professor.websiteUrl ?? '',
    researchInterests: professor.researchInterests ?? '',
    bio: professor.bio ?? '',
    universityId: professor.universityId ?? '',
  }
}

export default function ProfessorProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  const professorId = user?.id ?? ''

  const {
    data: professor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['professor', professorId],
    queryFn: () => fetchProfessorById(professorId),
    enabled: !!professorId && user?.role === 'PROFESSOR',
  })

  useEffect(() => {
    if (professor) setForm(toForm(professor))
  }, [professor])

  const applyResult = (updated: ProfessorProfile) => {
    queryClient.setQueryData(['professor', professorId], updated)
    void queryClient.invalidateQueries({ queryKey: ['professor', professorId] })
  }

  const saveMutation = useMutation({
    mutationFn: () => updateProfessorProfile(professorId, form),
    onSuccess: (updated) => {
      applyResult(updated)
      updateUser({ name: updated.name })
      setNotice({ kind: 'success', text: t('professorProfile.saved') })
    },
    onError: (error: Error) =>
      setNotice({ kind: 'error', text: error.message || t('professorProfile.saveFailed') }),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProfessorAvatar(professorId, file),
    onSuccess: (updated) => {
      applyResult(updated)
      setAvatarVersion(Date.now())
      setNotice({ kind: 'success', text: t('professorProfile.saved') })
    },
    onError: (error: Error) =>
      setNotice({ kind: 'error', text: error.message || t('professorProfile.saveFailed') }),
  })

  const removeAvatarMutation = useMutation({
    mutationFn: () => deleteProfessorAvatar(professorId),
    onSuccess: (updated) => {
      applyResult(updated)
      setAvatarVersion(Date.now())
    },
    onError: (error: Error) =>
      setNotice({ kind: 'error', text: error.message || t('professorProfile.saveFailed') }),
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setNotice({ kind: 'error', text: t('professorProfile.photoWrongType') })
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setNotice({ kind: 'error', text: t('professorProfile.photoTooLarge') })
      return
    }
    setNotice(null)
    uploadMutation.mutate(file)
  }

  const setField = (field: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  if (!isAuthenticated || !user) return null

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (isError || !professor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <Link href="/dashboard/professor">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div className="rounded-lg bg-destructive/10 p-6 text-center text-destructive">
          {t('professorProfile.loadFailed')}
        </div>
      </div>
    )
  }

  const busy = uploadMutation.isPending || removeAvatarMutation.isPending

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard/professor"
          className="rounded-lg border p-2 transition-colors hover:bg-accent"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('professorProfile.title')}</h1>
          <p className="text-muted-foreground">{t('professorProfile.subtitle')}</p>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={`mb-6 rounded-lg p-4 text-sm ${
            notice.kind === 'success'
              ? 'bg-primary/10 text-primary'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {notice.text}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('professorProfile.photo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <ProfessorAvatar
              professorId={professor.id}
              name={professor.name}
              hasPicture={professor.hasProfilePicture}
              size="xl"
              version={avatarVersion}
            />
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_AVATAR_TYPES.join(',')}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadMutation.isPending
                    ? t('professorProfile.uploading')
                    : professor.hasProfilePicture
                      ? t('professorProfile.changePhoto')
                      : t('professorProfile.uploadPhoto')}
                </Button>
                {professor.hasProfilePicture && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeAvatarMutation.mutate()}
                    disabled={busy}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('professorProfile.removePhoto')}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t('professorProfile.photoHint')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{t('professorProfile.title')}</CardTitle>
            {professor.universityName && (
              <Badge variant="secondary">{professor.universityName}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setNotice(null)
              saveMutation.mutate()
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">{t('auth.fullName')}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setField('name')(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="title">{t('professorProfile.academicTitle')}</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setField('title')(e.target.value)}
                  placeholder={t('professorProfile.academicTitlePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="department">{t('professorProfile.department')}</Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => setField('department')(e.target.value)}
                  placeholder={t('professorProfile.departmentPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="fieldOfStudy">{t('professorProfile.fieldOfStudy')}</Label>
                <Input
                  id="fieldOfStudy"
                  value={form.fieldOfStudy}
                  onChange={(e) => setField('fieldOfStudy')(e.target.value)}
                  placeholder={t('professorProfile.fieldOfStudyPlaceholder')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="officeLocation">{t('professorProfile.office')}</Label>
                <Input
                  id="officeLocation"
                  value={form.officeLocation}
                  onChange={(e) => setField('officeLocation')(e.target.value)}
                  placeholder={t('professorProfile.officePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="phone">{t('professorProfile.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone')(e.target.value)}
                  placeholder={t('professorProfile.phonePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">{t('professorProfile.website')}</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => setField('websiteUrl')(e.target.value)}
                  placeholder={t('professorProfile.websitePlaceholder')}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="universityId">{t('professorProfile.universityId')}</Label>
                <Input
                  id="universityId"
                  value={form.universityId}
                  onChange={(e) => setField('universityId')(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('professorProfile.universityIdHint')}
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="researchInterests">{t('professorProfile.researchInterests')}</Label>
                <Textarea
                  id="researchInterests"
                  rows={2}
                  value={form.researchInterests}
                  onChange={(e) => setField('researchInterests')(e.target.value)}
                  placeholder={t('professorProfile.researchInterestsPlaceholder')}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="bio">{t('professorProfile.bio')}</Label>
                <Textarea
                  id="bio"
                  rows={5}
                  value={form.bio}
                  onChange={(e) => setField('bio')(e.target.value)}
                  placeholder={t('professorProfile.bioPlaceholder')}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
              <Link href="/dashboard/professor">
                <Button type="button" variant="outline">
                  {t('common.cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

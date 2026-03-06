'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/core/services'
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { X, Plus, Trash2 } from 'lucide-react'
import type { ScreeningQuestion, ScreeningQuestionType } from '@/core/domain'

export default function CreateProjectPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxStudents: 1,
  })
  const [maxStudentsInput, setMaxStudentsInput] = useState('1')
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([])

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      router.push(`/projects/${project.id}`)
    },
    onError: (error: Error) => {
      alert(error.message || 'Failed to create project')
    },
  })

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addScreeningQuestion = () => {
    setScreeningQuestions((prev) => [...prev, { question: '', type: 'text' }])
  }

  const removeScreeningQuestion = (index: number) => {
    setScreeningQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateScreeningQuestion = (index: number, updates: Partial<ScreeningQuestion>) => {
    setScreeningQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    )
  }

  const addOption = (questionIndex: number) => {
    setScreeningQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, options: [...(q.options ?? []), ''] }
          : q
      )
    )
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setScreeningQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: (q.options ?? []).map((o, j) =>
                j === optionIndex ? value : o
              ),
            }
          : q
      )
    )
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setScreeningQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, options: (q.options ?? []).filter((_, j) => j !== optionIndex) }
          : q
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tags.length === 0) {
      alert('Please add at least one tag')
      return
    }
    const parsedMax = parseInt(maxStudentsInput, 10)
    const maxStudents = Number.isNaN(parsedMax) || parsedMax < 1 ? 1 : Math.min(20, parsedMax)
    setFormData((prev) => ({ ...prev, maxStudents }))
    const validQuestions = screeningQuestions.filter(
      (q) => q.question.trim() && (q.type !== 'choice' || (q.options?.length ?? 0) > 0)
    )
    const questionsWithOptions = validQuestions.map((q) => {
      if (q.type === 'choice' && q.options) {
        return { ...q, options: q.options.filter((o) => o.trim()) }
      }
      return q
    }).filter((q) => q.type !== 'choice' || (q.options?.length ?? 0) > 0)
    createMutation.mutate({
      ...formData,
      maxStudents,
      tags,
      interviewQuestions: questionsWithOptions.length > 0 ? questionsWithOptions : undefined,
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create Research Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Machine Learning for Climate Prediction"
                required
                minLength={5}
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the research project, objectives, requirements, and expected outcomes..."
                rows={10}
                required
                minLength={20}
                maxLength={2000}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div>
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <Input
                id="maxStudents"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={maxStudentsInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setMaxStudentsInput(raw)
                  const n = raw === '' ? 1 : parseInt(raw, 10)
                  const maxStudents = Number.isNaN(n) ? 1 : Math.max(1, Math.min(20, n))
                  setFormData((prev) => ({ ...prev, maxStudents }))
                }}
                onBlur={() => {
                  const n = parseInt(maxStudentsInput, 10)
                  const valid = Number.isNaN(n) || n < 1 ? 1 : Math.min(20, n)
                  setMaxStudentsInput(String(valid))
                  setFormData((prev) => ({ ...prev, maxStudents: valid }))
                }}
                placeholder="1–20"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">Type a number between 1 and 20</p>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="e.g., Machine Learning"
                  maxLength={30}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Press Enter or click Add to add tags (max 10)
              </p>

              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Screening Questions</Label>
              <p className="mb-3 text-sm text-muted-foreground">
                Add questions applicants must answer when applying (text, yes/no, or multiple choice).
              </p>
              {screeningQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="mb-4 rounded-lg border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Question {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeScreeningQuestion(idx)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) =>
                      updateScreeningQuestion(idx, { question: e.target.value })
                    }
                    placeholder="e.g., Explain your understanding of quantum entanglement."
                    className="mb-3"
                  />
                  <div className="mb-2">
                    <Label className="text-xs">Type</Label>
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateScreeningQuestion(idx, {
                          type: e.target.value as ScreeningQuestionType,
                          options: e.target.value === 'choice' ? [''] : undefined,
                        })
                      }
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="text">Text</option>
                      <option value="yesno">Yes / No</option>
                      <option value="choice">Multiple choice</option>
                    </select>
                  </div>
                  {q.type === 'choice' && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs">Options</Label>
                      {(q.options ?? ['']).map((opt, optIdx) => (
                        <div key={optIdx} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={(e) =>
                              updateOption(idx, optIdx, e.target.value)
                            }
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(idx, optIdx)}
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                            aria-label="Remove option"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(idx)}
                      >
                        Add option
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addScreeningQuestion}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Screening Question
              </Button>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

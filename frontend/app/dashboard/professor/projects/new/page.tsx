'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject, fetchResearchTopics } from '@/core/services'
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Plus, Trash2, X } from 'lucide-react'
import type { ScreeningQuestion, ScreeningQuestionType } from '@/core/domain'

export default function CreateProjectPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedTopicNames, setSelectedTopicNames] = useState<string[]>([])

  const { data: researchTopics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['research-topics'],
    queryFn: fetchResearchTopics,
  })
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

  const toggleTopic = (name: string) => {
    setSelectedTopicNames((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    )
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
    if (selectedTopicNames.length === 0) {
      alert('Please select at least one research topic from the list.')
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
      tags: selectedTopicNames,
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
              <Label>Research topics</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose from topics approved by the platform. You cannot add custom topics.
              </p>
              {topicsLoading ? (
                <p className="mt-3 text-sm text-muted-foreground">Loading topics…</p>
              ) : researchTopics.length === 0 ? (
                <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
                  No topics are available yet. Please contact an administrator.
                </p>
              ) : (
                <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                  {researchTopics.map((topic) => {
                    const checked = selectedTopicNames.includes(topic.name)
                    return (
                      <label
                        key={topic.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input"
                          checked={checked}
                          onChange={() => toggleTopic(topic.name)}
                        />
                        <span>{topic.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
              {selectedTopicNames.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedTopicNames.length} topic{selectedTopicNames.length !== 1 ? 's' : ''} selected
                </p>
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

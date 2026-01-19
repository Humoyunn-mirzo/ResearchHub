'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/core/services'
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { X } from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slots: 1,
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tags.length === 0) {
      alert('Please add at least one tag')
      return
    }
    createMutation.mutate({ ...formData, tags })
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
              <Label htmlFor="slots">Available Slots</Label>
              <Input
                id="slots"
                type="number"
                value={formData.slots}
                onChange={(e) => setFormData({ ...formData, slots: parseInt(e.target.value) })}
                min={1}
                max={20}
                required
              />
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

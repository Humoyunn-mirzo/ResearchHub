'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  adminCreateResearchTopic,
  adminDeleteResearchTopic,
  adminUpdateResearchTopic,
  fetchResearchTopics,
} from '@/core/services'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import { Pencil, Tags, Trash2 } from 'lucide-react'

export function ResearchTopicsPanel() {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [newSort, setNewSort] = useState('0')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSort, setEditSort] = useState('0')

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['research-topics'],
    queryFn: fetchResearchTopics,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['research-topics'] })
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminCreateResearchTopic({
        name: newName.trim(),
        sortOrder: parseInt(newSort, 10) || 0,
      }),
    onSuccess: () => {
      setNewName('')
      setNewSort('0')
      invalidate()
    },
    onError: (e: Error) => alert(e.message || 'Failed to add topic'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name, sortOrder }: { id: string; name: string; sortOrder: number }) =>
      adminUpdateResearchTopic(id, { name, sortOrder }),
    onSuccess: () => {
      setEditingId(null)
      invalidate()
    },
    onError: (e: Error) => alert(e.message || 'Failed to update topic'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteResearchTopic,
    onSuccess: invalidate,
    onError: (e: Error) => alert(e.message || 'Failed to delete topic'),
  })

  const startEdit = (id: string, name: string, sortOrder: number) => {
    setEditingId(id)
    setEditName(name)
    setEditSort(String(sortOrder))
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tags className="h-5 w-5" />
          Research topics
        </CardTitle>
        <p className="text-sm font-normal text-muted-foreground">
          Professors can only assign these topics to projects. Add or remove topics here.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/20 p-3">
          <Label className="text-xs">Add topic</Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                placeholder="Topic name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="w-full sm:w-24">
              <Input
                placeholder="Order"
                inputMode="numeric"
                value={newSort}
                onChange={(e) => setNewSort(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Add
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Lower sort order appears first in lists.</p>
        </div>

        <div className="max-h-[min(50vh,420px)] space-y-2 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No topics yet.</p>
          ) : (
            topics.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-2 rounded-md border bg-card/50 p-2 sm:flex-row sm:items-center sm:justify-between"
              >
                {editingId === t.id ? (
                  <>
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" />
                      <Input
                        className="w-full sm:w-20"
                        inputMode="numeric"
                        value={editSort}
                        onChange={(e) => setEditSort(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          updateMutation.mutate({
                            id: t.id,
                            name: editName.trim(),
                            sortOrder: parseInt(editSort, 10) || 0,
                          })
                        }
                        disabled={!editName.trim() || updateMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">Order: {t.sortOrder}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        title="Edit"
                        onClick={() => startEdit(t.id, t.name, t.sortOrder)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Delete topic “${t.name}”? Projects using it must be updated first.`)) {
                            deleteMutation.mutate(t.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

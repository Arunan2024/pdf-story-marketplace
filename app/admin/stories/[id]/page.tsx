'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

interface Story {
  id: string
  title: string
  description: string
  price: number
  published: boolean
  popular: boolean
  coverImage: string | null
  pdfStorageKey: string | null
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditStoryPage({ params }: PageProps) {
  const router = useRouter()
  // Unwrap the params Promise using React.use()
  const { id: storyId } = use(params)
  
  console.log('🔍 Story ID from params:', storyId)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<Partial<Story>>({
    title: '',
    description: '',
    price: 0,
    published: false,
    popular: false,
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)

  useEffect(() => {
    if (storyId) {
      fetchStory()
    } else {
      setError('No story ID provided')
      setLoading(false)
    }
  }, [storyId])

  const fetchStory = async () => {
    try {
      console.log('📖 Fetching story with ID:', storyId)
      const response = await fetch(`/api/stories/${storyId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📖 Story data loaded:', data.title)
        setFormData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load story')
      }
    } catch (error) {
      console.error('❌ Error fetching story:', error)
      setError('Error loading story')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!storyId) {
      setError('No story ID found')
      return
    }
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      console.log('📤 Saving story with ID:', storyId)
      
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title || '')
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('price', String(formData.price || 0))
      formDataToSend.append('published', String(formData.published))
      formDataToSend.append('popular', String(formData.popular))
      
      if (pdfFile) {
        formDataToSend.append('pdf', pdfFile)
      }
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage)
      }

      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      const data = await response.json()
      console.log('📥 Response:', data)

      if (response.ok) {
        setSuccess('Story updated successfully!')
        setTimeout(() => {
          router.push('/admin/stories')
        }, 1500)
      } else {
        setError(data.error || data.details || 'Failed to update story')
      }
    } catch (error) {
      console.error('❌ Error updating story:', error)
      setError('Error updating story: ' + String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file)
      } else {
        setError('Please select a PDF file')
        e.target.value = ''
      }
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setCoverImage(file)
      } else {
        setError('Please select an image file')
        e.target.value = ''
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading story...</div>
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
        <Link
          href="/admin/stories"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Stories
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Story</h1>
        <Link
          href="/admin/stories"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Stories
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
            ✅ {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Story Title *
          </label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (USD) *
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={formData.price || 0}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New PDF File (Optional)
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty to keep current PDF</p>
          {pdfFile && (
            <p className="mt-1 text-sm text-green-600">
              ✓ {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Cover Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty to keep current cover image</p>
          {coverImage && (
            <p className="mt-1 text-sm text-green-600">
              ✓ {coverImage.name} ({(coverImage.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.published || false}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Published</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.popular || false}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">⭐ Popular</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/stories"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

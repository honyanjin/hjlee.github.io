import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  color: string
  icon?: string | null
  sort_order?: number
  created_at: string
  updated_at: string
}

interface UseCategoryManagerProps {
  tableName: string
  showSortOrder?: boolean
}

export const useCategoryManager = ({ tableName, showSortOrder = false }: UseCategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')
      
      const query = supabase
        .from(tableName)
        .select('*')
      
      if (showSortOrder) {
        query.order('sort_order', { ascending: true })
      }
      query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      setError('카테고리를 불러오는데 실패했습니다.')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveCategory = async (data: any, editingId: string | null) => {
    try {
      setError('')
      
      if (editingId) {
        // 수정
        const { error } = await supabase
          .from(tableName)
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description,
            color: data.color,
            icon: data.icon,
            ...(showSortOrder && { sort_order: data.sort_order })
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // 새로 생성
        const { error } = await supabase
          .from(tableName)
          .insert([data])

        if (error) throw error
      }

      await fetchCategories()
    } catch (err: any) {
      setError('카테고리 저장에 실패했습니다.')
      console.error('Error saving category:', err)
      throw err
    }
  }

  const deleteCategory = async (id: string, confirmMessage?: string) => {
    const defaultMessage = '정말로 이 카테고리를 삭제하시겠습니까?'
    if (!confirm(confirmMessage || defaultMessage)) return

    try {
      setError('')
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCategories()
    } catch (err: any) {
      setError('카테고리 삭제에 실패했습니다.')
      console.error('Error deleting category:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [tableName])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    saveCategory,
    deleteCategory
  }
}

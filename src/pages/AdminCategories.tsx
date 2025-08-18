import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import CategoryManager from '../components/admin/CategoryManager'
import { useCategoryManager } from '../hooks/useCategoryManager'

const AdminCategories = () => {
  const [searchParams] = useSearchParams()
  
  const {
    categories,
    loading,
    error,
    fetchCategories,
    saveCategory,
    deleteCategory
  } = useCategoryManager({
    tableName: 'categories',
    showSortOrder: false
  })

  // URL 파라미터에서 new=true인 경우 새 카테고리 폼 자동 열기
  if (searchParams.get('new') === 'true') {
    // CategoryManager에서 자동으로 처리하도록 개선 필요
  }

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id)
  }

  return (
    <AdminLayout>
      <CategoryManager
        title="포스트 카테고리 관리"
        description="블로그 포스트의 카테고리를 관리합니다."
        tableName="categories"
        categories={categories}
        loading={loading}
        error={error}
        onFetchCategories={fetchCategories}
        onSaveCategory={saveCategory}
        onDeleteCategory={handleDeleteCategory}
        showSortOrder={false}
      />
    </AdminLayout>
  )
}

export default AdminCategories 
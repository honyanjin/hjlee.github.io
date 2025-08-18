import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import CategoryManager from '../components/admin/CategoryManager'
import { useCategoryManager } from '../hooks/useCategoryManager'

const AdminProjectCategories = () => {
  const [searchParams] = useSearchParams()
  
  const {
    categories,
    loading,
    error,
    fetchCategories,
    saveCategory,
    deleteCategory
  } = useCategoryManager({
    tableName: 'project_categories',
    showSortOrder: true
  })

  // URL 파라미터에서 new=true인 경우 새 카테고리 폼 자동 열기
  if (searchParams.get('new') === 'true') {
    // CategoryManager에서 자동으로 처리하도록 개선 필요
  }

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id, '정말로 이 카테고리를 삭제하시겠습니까? 이 카테고리를 사용하는 프로젝트들은 카테고리가 해제됩니다.')
  }

  return (
    <AdminLayout>
      <CategoryManager
        title="프로젝트 카테고리 관리"
        description="프로젝트의 카테고리를 관리합니다."
        tableName="project_categories"
        categories={categories}
        loading={loading}
        error={error}
        onFetchCategories={fetchCategories}
        onSaveCategory={saveCategory}
        onDeleteCategory={handleDeleteCategory}
        showSortOrder={true}
      />
    </AdminLayout>
  )
}

export default AdminProjectCategories 
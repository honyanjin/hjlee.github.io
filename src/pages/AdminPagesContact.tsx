import Breadcrumb from '../components/Breadcrumb'

const AdminPagesContact = () => {
  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: '페이지 관리', href: '/admin/pages/contact' }, { label: 'Contact' }]} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact 페이지 관리</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-gray-600 dark:text-gray-300">구성 예정</div>
      </main>
    </div>
  )
}

export default AdminPagesContact




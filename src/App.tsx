import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            HJLEE Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            풀스택 개발자 포트폴리오
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              안녕하세요! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              저는 풀스택 개발자입니다. React, TypeScript, Node.js를 주로 사용하며,
              사용자 경험을 중시하는 웹 애플리케이션을 개발합니다.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setCount((count) => count + 1)}
                className="btn-primary"
              >
                카운터: {count}
              </button>
              <button className="btn-secondary">
                프로젝트 보기
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                기술 스택
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">React & TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Node.js & Express</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">PostgreSQL & Prisma</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                연락처
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  📧 email@example.com
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  💼 GitHub: github.com/hjlee
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  🔗 LinkedIn: linkedin.com/in/hjlee
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App

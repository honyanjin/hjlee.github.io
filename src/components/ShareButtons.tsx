import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle,
  Mail
} from 'lucide-react'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
  size?: 'sm' | 'md'
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, description, size = 'md' }) => {
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const shareData = {
    title,
    text: description || title,
    url
  }

  const shareButtons = [
    {
      name: '카카오톡',
      icon: MessageCircle,
      color: 'bg-yellow-400 hover:bg-yellow-500',
      onClick: () => {
        const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        window.open(kakaoUrl, '_blank')
      }
    },
    {
      name: '트위터',
      icon: Twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      onClick: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        window.open(twitterUrl, '_blank')
      }
    },
    {
      name: '페이스북',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        window.open(facebookUrl, '_blank')
      }
    },
    {
      name: '링크드인',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      onClick: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        window.open(linkedinUrl, '_blank')
      }
    },
    {
      name: '이메일',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => {
        const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${description || ''}\n\n${url}`)}`
        window.open(emailUrl)
      }
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('클립보드 복사 실패:', err)
      // 폴백: 텍스트 영역 생성 후 복사
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('공유 실패:', err)
        setShowShareMenu(true)
      }
    } else {
      setShowShareMenu(true)
    }
  }

  return (
    <div className="relative">
      {/* 메인 공유 버튼 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNativeShare}
        className={`flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
          size === 'sm' 
            ? 'px-2 py-1 text-xs' 
            : 'px-4 py-2'
        }`}
      >
        <Share2 size={size === 'sm' ? 14 : 20} />
        {size === 'md' && <span>공유하기</span>}
      </motion.button>

      {/* 공유 메뉴 (네이티브 공유가 지원되지 않을 때) */}
      {showShareMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-[280px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              공유하기
            </h3>
            <button
              onClick={() => setShowShareMenu(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* 소셜 미디어 버튼들 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {shareButtons.map((button) => (
              <motion.button
                key={button.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={button.onClick}
                className={`flex items-center gap-2 text-white px-3 py-2 rounded-lg transition-colors ${button.color}`}
              >
                <button.icon size={16} />
                <span className="text-sm">{button.name}</span>
              </motion.button>
            ))}
          </div>

          {/* 링크 복사 */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyToClipboard}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>복사</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 배경 오버레이 */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  )
}

export default ShareButtons 
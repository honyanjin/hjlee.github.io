import { useEffect, useState, Fragment } from 'react'
import Breadcrumb from '../components/Breadcrumb'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Save, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

type ContactSettingsT = {
  id: string
  show_hero: boolean
  hero_title: string | null
  hero_description: string | null
  hero_bg_image_url: string | null
  hero_cta_label: string | null
  hero_cta_url: string | null
  show_form: boolean
  show_info: boolean
  show_socials: boolean
  show_hours: boolean
  success_message: string | null
  updated_at: string
}

type ContactInfoT = {
  id: string
  type: string
  label: string | null
  value: string | null
  link: string | null
  icon: string | null
  display_order: number
  created_at: string
  updated_at: string
}

type SocialT = {
  id: string
  name: string
  url: string
  icon: string | null
  color: string | null
  display_order: number
  created_at: string
  updated_at: string
}

type HourT = {
  id: string
  label: string
  time: string
  note: string | null
  display_order: number
  created_at: string
  updated_at: string
}

const settingsSchema = z.object({
  show_hero: z.boolean(),
  hero_title: z.string().optional(),
  hero_description: z.string().optional(),
  hero_bg_image_url: z.string().url().optional().or(z.literal('')),
  hero_cta_label: z.string().optional(),
  hero_cta_url: z.string().url().optional().or(z.literal('')),
  show_form: z.boolean(),
  show_info: z.boolean(),
  show_socials: z.boolean(),
  show_hours: z.boolean(),
  success_message: z.string().optional(),
})
type SettingsForm = z.infer<typeof settingsSchema>

const DEFAULT_SETTINGS: SettingsForm = {
  show_hero: true,
  hero_title: 'Contact Me',
  hero_description: '프로젝트나 협업에 관심이 있으시다면 언제든 연락주세요! 새로운 아이디어나 기술에 대한 이야기를 나누고 싶습니다.',
  hero_bg_image_url: '',
  hero_cta_label: '',
  hero_cta_url: '',
  show_form: true,
  show_info: true,
  show_socials: true,
  show_hours: true,
  success_message: '메시지가 성공적으로 전송되었습니다! 곧 답변드리겠습니다.',
}

const AdminPagesContact = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [settingsExpanded, setSettingsExpanded] = useState<boolean>(() => JSON.parse(localStorage.getItem('contactSettingsExpanded') || 'true'))
  const [heroExpanded, setHeroExpanded] = useState<boolean>(() => JSON.parse(localStorage.getItem('contactHeroExpanded') || 'true'))
  const [infoExpanded, setInfoExpanded] = useState<boolean>(() => JSON.parse(localStorage.getItem('contactInfoExpanded') || 'true'))
  const [socialsExpanded, setSocialsExpanded] = useState<boolean>(() => JSON.parse(localStorage.getItem('contactSocialsExpanded') || 'false'))
  const [hoursExpanded, setHoursExpanded] = useState<boolean>(() => JSON.parse(localStorage.getItem('contactHoursExpanded') || 'false'))

  const [infos, setInfos] = useState<ContactInfoT[]>([])
  const [socials, setSocials] = useState<SocialT[]>([])
  const [hours, setHours] = useState<HourT[]>([])

  const { register, handleSubmit, reset } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data: s, error: se } = await supabase
          .from('contact_page_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle()
        if (se) throw se
        if (s) {
          reset({
            show_hero: s.show_hero ?? true,
            hero_title: s.hero_title ?? DEFAULT_SETTINGS.hero_title,
            hero_description: s.hero_description ?? DEFAULT_SETTINGS.hero_description,
            hero_bg_image_url: s.hero_bg_image_url ?? '',
            hero_cta_label: s.hero_cta_label ?? '',
            hero_cta_url: s.hero_cta_url ?? '',
            show_form: s.show_form ?? true,
            show_info: s.show_info ?? true,
            show_socials: s.show_socials ?? true,
            show_hours: s.show_hours ?? true,
            success_message: s.success_message ?? DEFAULT_SETTINGS.success_message,
          })
        }

        const { data: infosData } = await supabase
          .from('contact_info')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
        setInfos(infosData ?? [])

        const { data: socialsData } = await supabase
          .from('contact_socials')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
        setSocials(socialsData ?? [])

        const { data: hoursData } = await supabase
          .from('contact_hours')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })
        setHours(hoursData ?? [])
      } catch (e: any) {
        setError(e.message || '설정을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [reset])

  const onSubmit = async (data: SettingsForm) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        id: 'default',
        show_hero: data.show_hero,
        hero_title: data.hero_title || null,
        hero_description: data.hero_description || null,
        hero_bg_image_url: data.hero_bg_image_url || null,
        hero_cta_label: data.hero_cta_label || null,
        hero_cta_url: data.hero_cta_url || null,
        show_form: data.show_form,
        show_info: data.show_info,
        show_socials: data.show_socials,
        show_hours: data.show_hours,
        success_message: data.success_message || null,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('contact_page_settings')
        .upsert(payload, { onConflict: 'id' })
      if (error) throw error
      setSuccess('설정을 저장했습니다.')
    } catch (e: any) {
      setError(e.message || '설정 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: '페이지 관리', path: '/admin/pages/contact' }, { label: 'Contact' }]} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact 페이지 관리</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-gray-600 dark:text-gray-300">불러오는 중...</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {/* 섹션 표시 토글 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => { const n = !settingsExpanded; setSettingsExpanded(n); localStorage.setItem('contactSettingsExpanded', JSON.stringify(n)) }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">섹션 표시 설정</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">히어로/폼/연락처/소셜/업무시간 섹션을 켜고 끌 수 있습니다.</p>
                  </div>
                  <button type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={settingsExpanded ? '접기' : '펼치기'}>
                    {settingsExpanded ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
              {settingsExpanded && (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between gap-4"><span className="text-sm text-gray-900 dark:text-white">Hero 표시</span><input type="checkbox" className="h-5 w-5" {...register('show_hero')} /></label>
                  <label className="flex items-center justify-between gap-4"><span className="text-sm text-gray-900 dark:text-white">폼 표시</span><input type="checkbox" className="h-5 w-5" {...register('show_form')} /></label>
                  <label className="flex items-center justify-between gap-4"><span className="text-sm text-gray-900 dark:text-white">연락처 표시</span><input type="checkbox" className="h-5 w-5" {...register('show_info')} /></label>
                  <label className="flex items-center justify-between gap-4"><span className="text-sm text-gray-900 dark:text-white">소셜 링크 표시</span><input type="checkbox" className="h-5 w-5" {...register('show_socials')} /></label>
                  <label className="flex items-center justify-between gap-4"><span className="text-sm text-gray-900 dark:text-white">업무 가능 시간 표시</span><input type="checkbox" className="h-5 w-5" {...register('show_hours')} /></label>
                </div>
              )}
            </section>

            {/* Hero 설정 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => { const n = !heroExpanded; setHeroExpanded(n); localStorage.setItem('contactHeroExpanded', JSON.stringify(n)) }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hero 설정</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">타이틀/설명/배경 이미지/CTA 버튼을 설정합니다.</p>
                  </div>
                  <button type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={heroExpanded ? '접기' : '펼치기'}>
                    {heroExpanded ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
              {heroExpanded && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">타이틀</label>
                      <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('hero_title')} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">배경 이미지 URL</label>
                      <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('hero_bg_image_url')} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">설명</label>
                      <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('hero_description')} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">CTA 레이블</label>
                      <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('hero_cta_label')} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">CTA URL</label>
                      <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" {...register('hero_cta_url')} />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 연락처 카드 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div
                className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => { const n = !infoExpanded; setInfoExpanded(n); localStorage.setItem('contactInfoExpanded', JSON.stringify(n)) }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">연락처 카드</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">type/label/value/link/icon을 관리합니다. (type→아이콘 자동 매핑 가능)</p>
                  </div>
                  <button type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={infoExpanded ? '접기' : '펼치기'}>
                    {infoExpanded ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
              {infoExpanded && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setInfos(prev => [...prev, { id: `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, type: '', label: '', value: '', link: '', icon: '', display_order: prev.length, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={16}/> 연락처 추가</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">label</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">value</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">link</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">icon</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">순서</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {infos.map((item, idx) => (
                          <Fragment key={item.id}>
                          <tr key={`${item.id}-row1`}>
                            <td className="px-3 py-2">
                              <select
                                value={item.type}
                                onChange={(e)=>{
                                  const value = e.target.value
                                  const iconMap: Record<string, string> = { email: 'Mail', phone: 'Phone', location: 'MapPin', custom: (item.icon ?? '') }
                                  const autoIcon = value === 'custom' ? (item.icon ?? '') : (iconMap[value] || 'Mail')
                                  const updated = [...infos]
                                  updated[idx] = { ...item, type: value, icon: autoIcon }
                                  setInfos(updated)
                                }}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                              >
                                <option value="">타입 선택</option>
                                <option value="email">이메일</option>
                                <option value="phone">전화번호</option>
                                <option value="location">위치</option>
                                <option value="custom">커스텀</option>
                              </select>
                            </td>
                            <td className="px-3 py-2"><input value={item.label ?? ''} onChange={(e)=>{const u=[...infos]; u[idx]={...item,label:e.target.value}; setInfos(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="이메일"/></td>
                            <td className="px-3 py-2"><input value={item.value ?? ''} onChange={(e)=>{const u=[...infos]; u[idx]={...item,value:e.target.value}; setInfos(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="email@example.com"/></td>
                            <td className="px-3 py-2"><input value={item.link ?? ''} onChange={(e)=>{const u=[...infos]; u[idx]={...item,link:e.target.value}; setInfos(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="mailto:email@example.com"/></td>
                            <td className="px-3 py-2"><input value={item.icon ?? ''} onChange={(e)=>{const u=[...infos]; u[idx]={...item,icon:e.target.value}; setInfos(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="Mail/Phone/MapPin... (타입에 따라 자동 선택)"/></td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={()=>{if(idx===0) return; const u=[...infos]; [u[idx-1],u[idx]]=[u[idx],u[idx-1]]; u.forEach((e,i)=>e.display_order=i); setInfos(u)}} className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded">↑</button>
                                <button type="button" onClick={()=>{if(idx===infos.length-1) return; const u=[...infos]; [u[idx+1],u[idx]]=[u[idx],u[idx+1]]; u.forEach((e,i)=>e.display_order=i); setInfos(u)}} className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded">↓</button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={async ()=>{try{setSaving(true); const payload={ type:item.type.trim(), label:(item.label??'').trim()||null, value:(item.value??'').trim()||null, link:(item.link??'').trim()||null, icon:(item.icon??'').trim()||null, display_order:idx }; if(item.id.startsWith('local-')){const {error}=await supabase.from('contact_info').insert([payload]); if(error) throw error;} else {const {error}=await supabase.from('contact_info').update(payload).eq('id', item.id); if(error) throw error;} const {data}=await supabase.from('contact_info').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:true}); setInfos(data??[]); setSuccess('연락처가 저장되었습니다.')}catch(e:any){setError(e.message||'저장 실패')}finally{setSaving(false)}}} className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">저장</button>
                                <button type="button" onClick={async ()=>{if(!item.id.startsWith('local-')){try{setSaving(true); const {error}=await supabase.from('contact_info').delete().eq('id', item.id); if(error) throw error;}catch(e:any){setError(e.message||'삭제 실패')}finally{setSaving(false)}} setInfos(prev=>prev.filter((_,i)=>i!==idx).map((e,i)=>({...e,display_order:i})))} } className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"><Trash2 size={14}/> 삭제</button>
                              </div>
                            </td>
                          </tr>
                          <tr key={`${item.id}-row2`}>
                            <td className="px-3 pb-4 pt-0" colSpan={7}>
                              <p className="text-xs text-gray-500 dark:text-gray-400">비고/설명은 필요 시 value에 포함하세요. type에 따라 아이콘 자동 매핑이 가능합니다.</p>
                            </td>
                          </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* 소셜 링크 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" onClick={() => { const n = !socialsExpanded; setSocialsExpanded(n); localStorage.setItem('contactSocialsExpanded', JSON.stringify(n)) }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">소셜 링크</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">플랫폼/URL/아이콘/색상(Tailwind 클래스) 관리</p>
                  </div>
                  <button type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={socialsExpanded ? '접기' : '펼치기'}>
                    {socialsExpanded ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
              {socialsExpanded && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setSocials(prev => [...prev, { id:`local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, name:'', url:'', icon:'', color:'', display_order: prev.length, created_at:new Date().toISOString(), updated_at:new Date().toISOString() }])} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={16}/> 소셜 추가</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">플랫폼</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">URL</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">아이콘</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">색상 클래스</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">순서</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {socials.map((s, idx) => (
                          <Fragment key={s.id}>
                          <tr key={`${s.id}-row1`}>
                            <td className="px-3 py-2"><input value={s.name} onChange={(e)=>{const u=[...socials]; u[idx]={...s,name:e.target.value}; setSocials(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="GitHub"/></td>
                            <td className="px-3 py-2"><input value={s.url} onChange={(e)=>{const u=[...socials]; u[idx]={...s,url:e.target.value}; setSocials(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="https://github.com/username"/></td>
                            <td className="px-3 py-2"><input value={s.icon ?? ''} onChange={(e)=>{const u=[...socials]; u[idx]={...s,icon:e.target.value}; setSocials(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="Github/Linkedin/Twitter..."/></td>
                            <td className="px-3 py-2"><input value={s.color ?? ''} onChange={(e)=>{const u=[...socials]; u[idx]={...s,color:e.target.value}; setSocials(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="hover:bg-gray-900"/></td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={()=>{if(idx===0) return; const u=[...socials]; [u[idx-1],u[idx]]=[u[idx],u[idx-1]]; u.forEach((e,i)=>e.display_order=i); setSocials(u)}} className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded">↑</button>
                                <button type="button" onClick={()=>{if(idx===socials.length-1) return; const u=[...socials]; [u[idx+1],u[idx]]=[u[idx],u[idx+1]]; u.forEach((e,i)=>e.display_order=i); setSocials(u)}} className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded">↓</button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={async ()=>{try{setSaving(true); const payload={ name:s.name.trim(), url:s.url.trim(), icon:(s.icon??'').trim()||null, color:(s.color??'').trim()||null, display_order:idx }; if(s.id.startsWith('local-')){const {error}=await supabase.from('contact_socials').insert([payload]); if(error) throw error;} else {const {error}=await supabase.from('contact_socials').update(payload).eq('id', s.id); if(error) throw error;} const {data}=await supabase.from('contact_socials').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:true}); setSocials(data??[]); setSuccess('소셜 링크가 저장되었습니다.')}catch(e:any){setError(e.message||'저장 실패')}finally{setSaving(false)}}} className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">저장</button>
                                <button type="button" onClick={async ()=>{if(!s.id.startsWith('local-')){try{setSaving(true); const {error}=await supabase.from('contact_socials').delete().eq('id', s.id); if(error) throw error;}catch(e:any){setError(e.message||'삭제 실패')}finally{setSaving(false)}} setSocials(prev=>prev.filter((_,i)=>i!==idx).map((e,i)=>({...e,display_order:i})))} } className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"><Trash2 size={14}/> 삭제</button>
                              </div>
                            </td>
                          </tr>
                          <tr key={`${s.id}-row2`}>
                            <td className="px-3 pb-4 pt-0" colSpan={6}>
                              <p className="text-xs text-gray-500 dark:text-gray-400">플랫폼에 맞는 색상 클래스를 Tailwind로 지정하세요. 예: hover:bg-gray-900, hover:bg-blue-700</p>
                            </td>
                          </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* 업무 가능 시간 */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" onClick={() => { const n = !hoursExpanded; setHoursExpanded(n); localStorage.setItem('contactHoursExpanded', JSON.stringify(n)) }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">업무 가능 시간</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">라벨/시간/비고로 다건 관리</p>
                  </div>
                  <button type="button" className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={hoursExpanded ? '접기' : '펼치기'}>
                    {hoursExpanded ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
              {hoursExpanded && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setHours(prev => [...prev, { id:`local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, label:'', time:'', note:'', display_order: prev.length, created_at:new Date().toISOString(), updated_at:new Date().toISOString() }])} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={16}/> 항목 추가</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-64">라벨</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">시간</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">비고</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">순서</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">작업</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {hours.map((h, idx) => (
                          <Fragment key={h.id}>
                          <tr key={`${h.id}-row1`}>
                            <td className="px-3 py-2"><input value={h.label} onChange={(e)=>{const u=[...hours]; u[idx]={...h,label:e.target.value}; setHours(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="월요일 - 금요일"/></td>
                            <td className="px-3 py-2"><input value={h.time} onChange={(e)=>{const u=[...hours]; u[idx]={...h,time:e.target.value}; setHours(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="09:00 - 18:00"/></td>
                            <td className="px-3 py-2"><input value={h.note ?? ''} onChange={(e)=>{const u=[...hours]; u[idx]={...h,note:e.target.value}; setHours(u)}} className="w-full px-3 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800" placeholder="* 긴급 문의는 언제든지 연락"/></td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={()=>{if(idx===0) return; const u=[...hours]; [u[idx-1],u[idx]]=[u[idx],u[idx-1]]; u.forEach((e,i)=>e.display_order=i); setHours(u)}} className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded">↑</button>
                                <button type="button" onClick={()=>{if(idx===hours.length-1) return; const u=[...hours]; [u[idx+1],u[idx]]=[u[idx],u[idx+1]]; u.forEach((e,i)=>e.display_order=i); setHours(u)}} className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded">↓</button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="inline-flex gap-2">
                                <button type="button" onClick={async ()=>{try{setSaving(true); const payload={ label:h.label.trim(), time:h.time.trim(), note:(h.note??'').trim()||null, display_order:idx }; if(h.id.startsWith('local-')){const {error}=await supabase.from('contact_hours').insert([payload]); if(error) throw error;} else {const {error}=await supabase.from('contact_hours').update(payload).eq('id', h.id); if(error) throw error;} const {data}=await supabase.from('contact_hours').select('*').order('display_order',{ascending:true}).order('created_at',{ascending:true}); setHours(data??[]); setSuccess('업무 시간이 저장되었습니다.')}catch(e:any){setError(e.message||'저장 실패')}finally{setSaving(false)}}} className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">저장</button>
                                <button type="button" onClick={async ()=>{if(!h.id.startsWith('local-')){try{setSaving(true); const {error}=await supabase.from('contact_hours').delete().eq('id', h.id); if(error) throw error;}catch(e:any){setError(e.message||'삭제 실패')}finally{setSaving(false)}} setHours(prev=>prev.filter((_,i)=>i!==idx).map((e,i)=>({...e,display_order:i})))} } className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"><Trash2 size={14}/> 삭제</button>
                              </div>
                            </td>
                          </tr>
                          <tr key={`${h.id}-row2`}>
                            <td className="px-3 pb-4 pt-0" colSpan={5}>
                              <p className="text-xs text-gray-500 dark:text-gray-400">라벨/시간/비고는 자유 텍스트입니다.</p>
                            </td>
                          </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Save size={16}/> {saving ? '저장 중...' : '설정 저장'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

export default AdminPagesContact


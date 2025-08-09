import { supabase } from './supabase'

export interface StorageListOptions {
  prefix?: string
  limit?: number
  offset?: number
  sortBy?: { column: 'name' | 'updated_at' | 'created_at' | 'size'; order: 'asc' | 'desc' }
}

export interface StorageFileItem {
  name: string
  id?: string
  updated_at?: string
  created_at?: string
  last_accessed_at?: string
  metadata?: { size?: number; mimetype?: string } | null
  publicUrl?: string
}

export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

const sanitize = (input: string): string => input.normalize('NFKC')

export const sanitizeFileName = (name: string): string => {
  const sanitized = sanitize(name)
    .toLowerCase()
    .replace(/\\/g, '/')
    .split('/')
    .pop() || 'file'
  const parts = sanitized.split('.')
  const ext = parts.length > 1 ? parts.pop()! : ''
  const base = parts.join('.') || 'file'
  const safeBase = base
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 60) || 'file'
  const safeExt = (ext || '').replace(/[^a-z0-9]/g, '').slice(0, 10)
  return safeExt ? `${safeBase}.${safeExt}` : safeBase
}

export const sanitizePrefix = (prefix: string): string => {
  const p = sanitize(prefix)
    .replace(/\\/g, '/')
    .replace(/\.+/g, '.')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9/_-]/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')
  // 금지: 경로 역참조
  if (p === '..' || p.includes('/../') || p.startsWith('../') || p.endsWith('/..')) return ''
  return p
}

export const listFiles = async (
  bucket: string,
  options: StorageListOptions = {}
): Promise<StorageFileItem[]> => {
  const { limit = 40, offset = 0, sortBy } = options
  const safePrefix = sanitizePrefix(options.prefix || '')
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(safePrefix, {
      limit,
      offset,
      sortBy: sortBy ? { column: sortBy.column as any, order: sortBy.order as any } : { column: 'name', order: 'desc' as const },
    })

  if (error) throw error

  const files: StorageFileItem[] = (data || []).map((item: any) => {
    const publicUrl = getPublicUrl(bucket, safePrefix ? `${safePrefix}/${item.name}` : item.name)
    return {
      name: safePrefix ? `${safePrefix}/${item.name}` : item.name,
      id: item.id,
      updated_at: item.updated_at,
      created_at: item.created_at,
      last_accessed_at: item.last_accessed_at,
      metadata: item.metadata,
      publicUrl,
    }
  })

  return files
}

export const uploadFile = async (
  bucket: string,
  file: File,
  targetDir: string = ''
): Promise<string> => {
  const baseName = sanitizeFileName(file.name)
  const parts = baseName.split('.')
  const ext = parts.length > 1 ? parts.pop()! : 'bin'
  const base = (parts.join('.') || 'file')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
  const timeTag = Date.now().toString(36)
  const randomTag = Math.random().toString(36).slice(2, 6)
  const safeName = `${base}-${timeTag}-${randomTag}.${ext}`
  const safeDir = sanitizePrefix(targetDir)
  const path = safeDir ? `${safeDir}/${safeName}` : safeName
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return path
}

export const removeFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export const moveFile = async (
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> => {
  // supabase-js supports move; fallback to copy+remove if needed
  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath)
  if (error) throw error
}

export const copyFile = async (
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath)
  if (error) throw error
}

export const isImage = (name: string): boolean => {
  return /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)$/i.test(name)
}

export const createSignedUrl = async (
  bucket: string,
  path: string,
  expiresInSeconds: number
): Promise<string> => {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}



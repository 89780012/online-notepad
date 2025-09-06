/**
 * 生成唯一ID的工具函数
 * 在客户端使用 crypto.randomUUID()，在服务端使用 nanoid
 */

import { nanoid } from 'nanoid';

/**
 * 生成唯一ID，SSR安全
 */
export function generateId(): string {
  // 在客户端使用 crypto.randomUUID()
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return crypto.randomUUID();
  }
  
  // 在服务端或不支持 crypto.randomUUID 的环境使用 nanoid
  return nanoid();
}

/**
 * 生成分享链接的随机后缀
 */
export function generateShareSlug(): string {
  return generateId();
}

/**
 * 生成笔记ID
 */
export function generateNoteId(): string {
  return generateId();
}

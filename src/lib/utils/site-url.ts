// ============================================================
// RAILREADY — Résolution de l'URL du site (auth emails)
// Ordre de priorité :
// 1. NEXT_PUBLIC_APP_URL (si défini ET différent de localhost)
// 2. window.location.origin (navigateur — toujours correct en prod)
// 3. NEXT_PUBLIC_VERCEL_URL (fallback côté serveur sur Vercel)
// 4. http://localhost:3000 (dev)
// ============================================================

export function getSiteURL(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  const isProdEnvUrl = envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')

  // En production déployée, l'URL canonique configurée prime
  if (isProdEnvUrl) return envUrl.replace(/\/$/, '')

  // Côté navigateur : l'origine réelle est toujours fiable
  if (typeof window !== 'undefined') return window.location.origin

  // Côté serveur sur Vercel
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, '')}`

  return 'http://localhost:3000'
}

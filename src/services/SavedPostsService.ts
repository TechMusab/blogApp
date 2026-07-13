const STORAGE_KEY = 'folio:saved-post-ids'

export const SavedPostsService = {
  getSavedPosts(): string[] {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
    } catch { return [] }
  },
  toggleSaved(postId: string, savedPostIds: string[]): string[] {
    const next = savedPostIds.includes(postId) ? savedPostIds.filter((id) => id !== postId) : [...savedPostIds, postId]
    this.save(next)
    return next
  },
  clearSaved(): void { this.save([]) },
  save(savedPostIds: string[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPostIds)) } catch { /* storage unavailable */ }
  },
}

import type { ThemePostsItem } from 'vuepress-theme-plume/shared';

export function categoryOf(post: ThemePostsItem): string {
  return post.categoryList?.[0]?.name || '未分类';
}

export function isPinned(post: ThemePostsItem): boolean {
  return post.sticky === true || (typeof post.sticky === 'number' && post.sticky >= 0);
}

export function sortPosts(posts: ThemePostsItem[]): ThemePostsItem[] {
  return posts.filter(post => !post.draft).sort((a, b) => {
    const priority = (post: ThemePostsItem) => isPinned(post)
      ? (typeof post.sticky === 'number' ? post.sticky : 0) : -1;
    return priority(b) - priority(a) || b.createTime.localeCompare(a.createTime);
  });
}

export function pageNumber(value: unknown, totalPages: number): number {
  const parsed = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(parsed) ? Math.max(1, Math.min(parsed, Math.max(1, totalPages))) : 1;
}

export function summaryOf(post: ThemePostsItem, summaries: Record<string, string>): string {
  if (post.encrypt) return '这篇文章已加密，请输入密码后阅读。';
  const filename = decodeURIComponent(post.path).split('/').pop()?.replace(/\.html$/, '') || '';
  return summaries[post.title] || summaries[filename]
    || post.excerpt?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    || `阅读「${post.title}」的学习记录与实践笔记。`;
}

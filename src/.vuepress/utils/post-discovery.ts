import type { ThemePostsItem } from 'vuepress-theme-plume/shared';

export function chronologicalPosts(posts: ThemePostsItem[]) {
  return posts.filter(post => !post.draft).sort((a, b) => b.createTime.localeCompare(a.createTime));
}

export function categoryGroups(posts: ThemePostsItem[]) {
  const groups = new Map<string, { id: string; name: string; depth: number; parent?: string; posts: ThemePostsItem[] }>();
  for (const post of chronologicalPosts(posts)) {
    post.categoryList?.forEach((category, depth, path) => {
      if (!groups.has(category.id)) groups.set(category.id, { id: category.id, name: category.name, depth, parent: path[depth - 1]?.id, posts: [] });
      groups.get(category.id)!.posts.push(post);
    });
  }
  return [...groups.values()];
}

export function tagGroups(posts: ThemePostsItem[]) {
  const groups = new Map<string, ThemePostsItem[]>();
  for (const post of chronologicalPosts(posts)) {
    for (const tag of new Set(post.tags || [])) {
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag)!.push(post);
    }
  }
  return [...groups].map(([name, posts]) => ({ name, posts })).sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, 'zh-CN'));
}

export function postDate(post: ThemePostsItem) {
  return post.createTime.split(/[T\s]/)[0].replaceAll('/', '-');
}

export function archiveGroups(posts: ThemePostsItem[]) {
  const months = new Map<string, { key: string; year: string; month: number; posts: ThemePostsItem[] }>();
  for (const post of chronologicalPosts(posts)) {
    const [year, month] = postDate(post).split('-');
    const key = `${year}-${month}`;
    if (!months.has(key)) months.set(key, { key, year, month: Number(month), posts: [] });
    months.get(key)!.posts.push(post);
  }
  return [...months.values()];
}

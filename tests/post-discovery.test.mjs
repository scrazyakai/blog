import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/.vuepress/utils/post-discovery.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { categoryGroups, tagGroups, archiveGroups, chronologicalPosts } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const posts = [
  { title: 'Older pinned', path: '/old', createTime: '2025/12/01 00:00:00', sticky: true, tags: ['Vue', 'Vue'], categoryList: [{ id: 'front', name: '前端' }, { id: 'vue', name: 'Vue' }] },
  { title: 'Recent', path: '/recent', createTime: '2026/09/25 00:00:00', tags: ['Vue', 'React'], categoryList: [{ id: 'front', name: '前端' }, { id: 'react', name: 'React' }] },
  { title: 'Draft', path: '/draft', createTime: '2026/09/26 00:00:00', draft: true, tags: ['Hidden'], categoryList: [{ id: 'hidden', name: 'Hidden' }] },
];
test('category grouping preserves parent and child deep-link IDs without double-counting root posts', () => {
  const groups = categoryGroups(posts);
  assert.deepEqual(groups.find(g => g.id === 'front').posts.map(p => p.title), ['Recent', 'Older pinned']);
  assert.equal(groups.find(g => g.id === 'react').parent, 'front');
  assert.equal(groups.find(g => g.id === 'react').depth, 1);
  assert.equal(groups.find(g => g.id === 'vue').posts.length, 1);
  assert.equal(groups.some(g => g.id === 'hidden'), false);
});
test('tags count each article once, retain every tag, and exclude drafts', () => {
  const groups = tagGroups(posts);
  assert.deepEqual(groups.map(g => [g.name, g.posts.length]), [['Vue', 2], ['React', 1]]);
  assert.deepEqual(tagGroups([]), []);
});
test('archive chronology ignores pinned order and produces correct year/month boundaries without mutation', () => {
  const original = [...posts];
  const groups = archiveGroups(posts);
  assert.deepEqual(groups.map(g => [g.key, g.year, g.month, g.posts.length]), [['2026-09', '2026', 9, 1], ['2025-12', '2025', 12, 1]]);
  assert.equal(chronologicalPosts(posts)[0].title, 'Recent');
  assert.deepEqual(posts, original);
  assert.deepEqual(archiveGroups([]), []);
});

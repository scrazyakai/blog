import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Run against the source helpers on every supported Node version, including
// Node 20, which cannot import TypeScript directly.
const source = await readFile(new URL('../src/.vuepress/utils/posts-index.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { categoryOf, isPinned, pageNumber, sortPosts, summaryOf } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);

function post(title, overrides = {}) {
  return {
    title,
    path: `/posts/${encodeURIComponent(title)}.html`,
    createTime: '2026/09/26 00:00:00',
    excerpt: '',
    lang: 'zh-CN',
    ...overrides,
  };
}

test('sortPosts excludes drafts, puts higher-priority pinned articles first, then sorts by date', () => {
  const input = [
    post('recent', { createTime: '2026/09/26 12:00:00' }),
    post('old', { createTime: '2025/01/01 00:00:00' }),
    post('pinned', { sticky: true, createTime: '2024/01/01 00:00:00' }),
    post('priority', { sticky: 5, createTime: '2023/01/01 00:00:00' }),
    post('draft', { sticky: 99, draft: true }),
    post('zero-priority', { sticky: 0, createTime: '2025/01/01 00:00:00' }),
    post('negative-priority', { sticky: -1, createTime: '2026/09/26 10:00:00' }),
  ];
  const before = [...input];
  assert.deepEqual(sortPosts(input).map(item => item.title), [
    'priority', 'zero-priority', 'pinned', 'recent', 'negative-priority', 'old',
  ]);
  assert.deepEqual(input, before, 'sorting must not mutate shared theme data');
  assert.deepEqual(sortPosts([]), []);
  assert.equal(isPinned(post('not-pinned', { sticky: false })), false);
});

test('pageNumber accepts page queries and clamps them to the available result pages', () => {
  assert.equal(pageNumber('3', 8), 3);
  assert.equal(pageNumber('0', 8), 1);
  assert.equal(pageNumber('99', 8), 8);
  assert.equal(pageNumber('99', 0), 1, 'empty result sets still have a valid first-page state');
  assert.equal(pageNumber('3', 1), 1, 'filtering down to one page clamps a stale page query');
});

test('pageNumber rejects malformed, ambiguous, fractional, and unsafe page queries', () => {
  for (const value of [undefined, null, '', 'abc', '-1', '2.5', '1e2', 'Infinity', ['2', '3'], {}, '9007199254740992']) {
    assert.equal(pageNumber(value, 10), 1, `expected the first page for ${JSON.stringify(value)}`);
  }
});

test('summaryOf protects encrypted article text before consulting summaries or excerpts', () => {
  const protectedPost = post('protected', {
    encrypt: true,
    path: '/posts/secret-file.html',
    excerpt: '<p>private body text</p>',
  });
  const result = summaryOf(protectedPost, {
    protected: 'private title summary',
    'secret-file': 'private filename summary',
  });
  assert.equal(result, '这篇文章已加密，请输入密码后阅读。');
  assert.doesNotMatch(result, /private/);
});

test('summaryOf resolves title and decoded filename summaries, then plain-text excerpts and fallback copy', () => {
  const article = post('display-title', { path: '/posts/%E5%AD%97%E5%85%B8%E6%A0%91.html' });
  assert.equal(summaryOf(article, { 'display-title': 'Title summary', 字典树: 'Filename summary' }), 'Title summary');
  assert.equal(summaryOf(article, { 字典树: 'Filename summary' }), 'Filename summary');
  assert.equal(summaryOf(post('excerpt', { excerpt: '<p>Learn <strong>React</strong></p>\n<p>state</p>' }), {}), 'Learn React state');
  assert.equal(summaryOf(post('empty', { excerpt: '<p> \n </p>' }), {}), '阅读「empty」的学习记录与实践笔记。');
});

test('categoryOf uses the top-level directory category and handles uncategorized articles', () => {
  assert.equal(categoryOf(post('react', {
    categoryList: [{ id: 'front', name: '前端', sort: 0 }, { id: 'react', name: 'React', sort: 1 }],
  })), '前端');
  assert.equal(categoryOf(post('uncategorized')), '未分类');
  assert.equal(categoryOf(post('empty-category', { categoryList: [] })), '未分类');
});

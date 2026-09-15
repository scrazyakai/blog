import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const login = process.env.GITHUB_LOGIN || "scrazyakai";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const outputPath = resolve("src/.vuepress/data/github-contributions.ts");

const query = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

async function hasCachedData() {
  try {
    await readFile(outputPath, "utf8");
    return true;
  } catch {
    return false;
  }
}

if (!token) {
  if (await hasCachedData()) {
    console.log("未设置 GITHUB_TOKEN，使用仓库中的 GitHub 贡献缓存。");
    process.exit(0);
  }
  throw new Error("未设置 GITHUB_TOKEN，且没有可用的贡献缓存。");
}

try {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "scrazyakai-blog-build",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ query, variables: { login } }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar?.weeks?.length) {
    throw new Error(`没有找到 GitHub 用户 ${login} 的贡献数据`);
  }

  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const data = {
    login,
    totalContributions: calendar.totalContributions,
    from: days[0].date,
    to: days.at(-1).date,
    weeks: calendar.weeks,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `// 此文件由 scripts/fetch-github-contributions.mjs 自动生成。\nexport const githubContributions = ${JSON.stringify(data, null, 2)} as const;\n`,
  );
  console.log(`已更新 ${login} 的 GitHub 贡献数据，共 ${data.totalContributions} 次贡献。`);
} catch (error) {
  if (!(await hasCachedData())) throw error;
  console.warn(`GitHub 贡献数据更新失败，继续使用仓库缓存：${error.message}`);
}

const axios = require('axios');
const fs = require('fs');
// 配置
const USERNAME = 'longxiao7'; // 替换为你的用户名
const TOKEN = process.env.GITHUB_TOKEN; // 通过环境变量传入，避免硬编码
const OUTPUT_FILE = 'starred_repos.json'; // 输出文件名，可以放在项目根目录或者docs目录下
// 每页数量，最大100
const PER_PAGE = 100;
// 获取所有starred项目
async function fetchAllStarredRepos() {
  let page = 1;
  let repos = [];
  let hasMore = true;
  while (hasMore) {
    try {
      const response = await axios.get(`https://api.github.com/users/${USERNAME}/starred`, {
        headers: {
          Authorization: `token ${TOKEN}`,
        },
        params: {
          per_page: PER_PAGE,
          page: page,
        },
      });
      if (response.data.length === 0) {
        hasMore = false;
      } else {
        repos = repos.concat(response.data);
        page++;
      }
    } catch (error) {
      console.error('Error fetching starred repos:', error);
      hasMore = false;
    }
  }
  return repos;
}
// 主函数
async function main() {
  try {
    const starredRepos = await fetchAllStarredRepos();
    // 只保存我们需要的信息，减少文件大小
    const simplifiedRepos = starredRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      language: repo.language,
    }));
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(simplifiedRepos, null, 2));
    console.log(`Successfully saved ${simplifiedRepos.length} starred repos to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error:', error);
  }
}
main();
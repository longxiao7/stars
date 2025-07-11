const { writeFileSync } = require('fs');

const USERNAME = process.env.GH_UNAME;
const TOKEN = process.env.GH_TOKEN;
const OUTPUT_FILE = './data/starred_repos.json';

async function fetchAllStarredRepos(page = 1, allRepos = []) {
  try {
    const response = await fetch(`https://api.github.com/users/${USERNAME}/starred?page=${page}&per_page=100`, {
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const repos = await response.json();
    
    // 调试用：保存原始数据
    //writeFileSync(`all${page}`, JSON.stringify(repos));

    if (Array.isArray(repos)) {
      const filteredRepos = repos.map(repo => ({
        id: repo.id,
        html_url: repo.html_url,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        language: repo.language
      }));
      
      allRepos.push(...filteredRepos);
      
      // 检查是否有下一页
      const linkHeader = response.headers.get('link');
      const hasNextPage = linkHeader && linkHeader.includes('rel="next"');
      
      if (hasNextPage) {
        await fetchAllStarredRepos(page + 1, allRepos);
      } else {
        writeFileSync(OUTPUT_FILE, JSON.stringify(allRepos, null, 2));
        console.log(`已保存 ${allRepos.length} 个项目到 ${OUTPUT_FILE}`);
      }
    } else {
      console.error('返回的数据不是数组:', repos);
    }
  } catch (err) {
    console.error('请求失败:', err);
  }
}

fetchAllStarredRepos();
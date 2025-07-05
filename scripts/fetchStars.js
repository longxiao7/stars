const https = require('https');
const fs = require('fs');

const USERNAME = 'longxiao7';
const TOKEN = process.env.GITHUB_TOKEN;
const OUTPUT_FILE = '/data/starred_repos.json';

function fetchAllStarredRepos(page = 1, allRepos = []) {
  const options = {
    hostname: 'api.github.com',
    path: `/users/${USERNAME}/starred?page=${page}&per_page=100`,
    headers: {
      'User-Agent': 'Node.js',
      'Authorization': `token ${TOKEN}`
    }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const repos = JSON.parse(data);
        if (Array.isArray(repos)) {

          const filteredRepos = repos.map(repo => ({
            id: repo.id,
            html_url: repo.html_url,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description
          }));
          allRepos.push(...filteredRepos);
          const linkHeader = res.headers.link;
          const hasNextPage = linkHeader && linkHeader.includes('rel="next"');
          if (hasNextPage) {
            fetchAllStarredRepos(page + 1, allRepos);
          } else {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allRepos, null, 2));
            console.log(`已保存 ${allRepos.length} 个项目到 ${OUTPUT_FILE}`);
          }
        } else {
          console.error('返回的数据不是数组:', repos);
        }
      } catch (err) {
        console.error('解析 JSON 失败:', err);
      }
    });
  }).on('error', (err) => {
    console.error('请求失败:', err);
  });
}

fetchAllStarredRepos();
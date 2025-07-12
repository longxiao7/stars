### stars
给自己star的项目写备注

### 原理
1. 利用 github pages 做前端展示
2. star 数据通过 github workflow 从API拉取 （默认一天拉一次）
3. 备注数据保存使用浏览器的 IndexedDB 也可以导出到本地 json 文件
4. 除了从本地 json 文件导入备注，还可以网络远程载入（导出json文件上传到 repo 里 /data/notes.json 文件）


### 部署方法

1. clone 此项目，不要使用fork，否则我每天更新自己的数据（主要是data目录）会影响你用。 
2. 打开 https://github.com/settings/personal-access-tokens 选择 Generate new token ，随便起一个名称，Expiration 选择 No Expiration ，Repository access 选择 Only select repositories ，然后 选择自己刚刚第1步 建立的 项目; Permissions 设置一下 Repository permissions 里面全设置成 Read and write ;Account permissions 里面只需要开 Starring ，最后生成的 token 保存一下 ，如果没保存之后就再也找不到了
3. 打开第1步的项目 选择 Settings - Secrets and variables - Actions , 新建两个 Repository secrets 
    * GH_TOKEN 这个值是第2步创建的token
    * GH_UNAME 这个值是你的github用户名（不是邮箱）
4. 回到你fork的项目 打开 Actions 选 左侧列表里的  “获取star的项目”  - Run workflow - 创建一个任务，看看能不能执行成功 （这一步是拉取你的star项目列表，默认是我的，只有执行成功才会变成你的）
5. 打开项目的 Settings - Pages 给项目开启 github pages

### 使用
打开项目的 pages 地址即可使用，导出数据到文件后 可以上传到项目的 /data/notes.json 覆盖文件 ，就可以使用 `从repo载入数据` 按钮，注意 导入数据和载入数据都会先清空浏览器已经有的数据。
# Study Studio · 学习与创作

个人雅思学习与作品集网站，使用原生 JavaScript 和 Vite，适配手机与桌面。

## 开发

需要 Node.js 22.12+，当前验证版本为 24.19.0。

```sh
npm ci
npm run dev
```

默认开发端口为 5173。`npm test` 运行数据模型测试；`npm run build` 生成 `dist/`；`npm run preview` 检查生产构建。

## 功能

- 学习概览：今日与累计时长、学习天数、考试倒计时。
- 雅思学习：设置目标、管理任务、记录听说读写练习。
- 作品集：添加、编辑、删除作品，自定义分类筛选，关联作品链接。
- JSON 备份导出和导入（导入会替换现有数据）。

数据存储在当前浏览器的 localStorage，不含账号、云同步或后端数据库；清除站点数据会删除记录，请定期导出备份。可将 `dist/` 部署到静态网站托管平台，发布网站不会同步浏览器中的私人学习记录。

## 云环境

使用已有 `/workspace/mine` checkout，无需创建 worktree。安装命令为 `npm ci`；新任务需要运行网站时，应重新执行 `npm run dev -- --port 5173`，环境快照不保留运行中的服务。

## GitHub Pages

项目的静态资源路径已设为 `/mine/`。运行 `npm ci`、`npm test` 和 `npm run build` 后，将 `dist/` 内容发布到 `gh-pages` 分支根目录，同时添加空的 `.nojekyll` 文件。

在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中，将 Source 设为 **Deploy from a branch**，选择 **gh-pages** 分支和 **/ (root)**，然后保存。预期网址为 `https://r0177.github.io/mine/`，以 GitHub Pages 页面显示的实际地址为准。

修改网站后需要重新构建并更新发布分支。该网站不包含服务端，学习数据保存在访问者自己的浏览器中，不会随代码上传。仓库须具备 GitHub Pages 使用资格，通常可使用公开仓库。

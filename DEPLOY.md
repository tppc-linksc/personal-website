# 阿里云部署完整教程

## 目录
1. [服务器购买与配置](#1-服务器购买与配置)
2. [域名与 DNS 解析](#2-域名与-dns-解析)
3. [ICP 备案](#3-icp-备案)
4. [环境安装](#4-环境安装)
5. [项目部署](#5-项目部署)
6. [HTTPS 与自动续期](#6-https-与自动续期)
7. [日常维护](#7-日常维护)
8. [二级域名规划](#8-二级域名规划)

---

## 1. 服务器购买与配置

### 1.1 购买 ECS

阿里云控制台 → 云服务器 ECS → 创建实例：

| 配置项 | 建议 |
|--------|------|
| 地域 | 国内（备案需要） |
| 实例规格 | 2vCPU / 2GB 内存（最低 88元/年） |
| 系统镜像 | Ubuntu 22.04 LTS 或 CentOS 7.9 |
| 系统盘 | 40GB ESSD |
| 带宽 | 按流量计费，1-5Mbps |

> 新人首次购买有优惠，选择**轻量应用服务器**也可以，自带应用镜像更省事。

### 1.2 安全组配置

ECS 控制台 → 安全组 → 添加规则：

| 端口 | 协议 | 用途 |
|------|------|------|
| 22 | TCP | SSH 远程连接 |
| 80 | TCP | HTTP（网站访问） |
| 443 | TCP | HTTPS（SSL 加密） |

### 1.3 SSH 连接服务器

```bash
# macOS/Linux 终端
ssh root@你的服务器公网IP

# 首次连接会提示，输入 yes
```

---

## 2. 域名与 DNS 解析

### 2.1 添加 DNS 解析

阿里云控制台 → 域名 → 解析设置：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 服务器公网IP | 600 |
| A | www | 服务器公网IP | 600 |

> `@` 代表 yourdomain.com 本身，`www` 代表 www.yourdomain.com

### 2.2 验证解析

```bash
# 等几分钟后验证
ping yourdomain.com
nslookup yourdomain.com
```

---

## 3. ICP 备案

### 3.1 备案前提

- 域名已实名认证（购买域名时需操作）
- 服务器在国内机房
- 个人身份证明

### 3.2 备案流程

1. 阿里云控制台 → **ICP 备案** → 开始备案
2. 按提示填写：
   - 主体信息（姓名、身份证号）
   - 网站信息（网站名称、网站描述）
3. 上传身份证正反面、手持证件照
4. 阿里云初审（1个工作日）
5. 工信部短信核验
6. 管局终审（5-20个工作日）
7. 备案成功后会收到备案号，需挂在网站底部

### 3.3 备案注意事项

- 备案期间网站不能访问（关闭 80/443 端口）
- 备案号需要放在网站底部：`<a href="https://beian.miit.gov.cn">浙ICP备XXXXXXXX号</a>`
- 个人备案网站不能涉及商业、论坛、交互内容（简单提示"留言功能需备案"即可）

---

## 4. 环境安装

### 4.1 基础软件（Ubuntu）

```bash
# 更新系统
apt update && apt upgrade -y

# 安装必要工具
apt install -y curl wget git unzip build-essential

# better-sqlite3 需要 native module 构建环境
apt install -y python3

# 生产排障和数据校验会用到 sqlite3 CLI
apt install -y sqlite3
```

### 4.2 安装 Node.js 20

```bash
# 使用 NodeSource 官方源
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 4.3 安装 nginx

```bash
apt install -y nginx

# 启动并设置开机自启
systemctl start nginx
systemctl enable nginx

# 验证（浏览器访问服务器IP，看到 nginx 欢迎页即可）
```

### 4.4 安装 PM2

```bash
npm install -g pm2

# 设置开机自启
pm2 startup systemd
# 执行提示的命令

pm2 save
```

### 4.5 安装 certbot（SSL 证书）

```bash
apt install -y certbot python3-certbot-nginx
```

---

## 5. 项目部署

### 5.1 拉取代码

```bash
# 方法一：从 GitHub 克隆（无需 SSH key，公开仓库用 https）
git clone https://github.com/yourusername/your-repo.git /home/website
cd /home/website

# 方法二：从本地上传（如果 GitHub 下载慢）
# 本地执行: scp -r ./personal-website root@服务器IP:/home/
```

### 5.2 配置环境变量

```bash
cd /home/website

# 复制示例配置
cp .env.example .env

# 编辑配置
vim .env
```

填入：
```env
# 必填：管理员登录密码
STUDIO_ADMIN_TOKEN=你的密码

# 必填：生产运行时数据目录（SQLite 数据库会写到这里）
PORTFOLIO_DATA_DIR=/var/lib/personal-website

# 可选
STUDIO_OWNER_NAME=你的名字        # 留言作者标识
STUDIO_SESSION_TTL_SECONDS=259200  # 会话有效期（秒）

# 以下两项为高级配置，不填也行，会自动用 STUDIO_ADMIN_TOKEN 代替
# STUDIO_SESSION_SECRET=随机字符串  # cookie 加密密钥
# STUDIO_ADMIN_TOKEN_HASH=sha256:盐:哈希值  # 密码哈希版，比明文更安全
```

### 5.3 创建运行时数据目录

运行时数据不要放在项目目录里。SQLite 数据库、WAL 文件和后续上传目录统一放到 `/var/lib/personal-website`：

```bash
sudo mkdir -p /var/lib/personal-website/uploads
sudo chown -R $USER:$USER /var/lib/personal-website
chmod 700 /var/lib/personal-website
```

当前第一阶段运行时数据：

| 数据 | 存储位置 |
|------|----------|
| 留言 | `/var/lib/personal-website/portfolio.sqlite` |
| 访问计数 | `/var/lib/personal-website/portfolio.sqlite` |
| 首页内容 | `/var/lib/personal-website/portfolio.sqlite` |
| 限流记录 | `/var/lib/personal-website/portfolio.sqlite` |

### 5.4 安装依赖、构建并迁移数据

```bash
# 确保当前 shell 带有生产数据目录
export PORTFOLIO_DATA_DIR=/var/lib/personal-website

# 推荐生产使用 npm ci
npm ci
npm run build

# 首次迁移旧 JSON 数据到 SQLite；如果没有旧数据，也可以执行，脚本会跳过空数据
node scripts/migrate-json-to-sqlite.mjs
```

### 5.5 配置 nginx 反向代理

```bash
vim /etc/nginx/sites-available/personal-website
```

写入：
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 日志
    access_log /var/log/nginx/personal-website-access.log;
    error_log /var/log/nginx/personal-website-error.log;

    # 静态资源缓存
    location /_next/static/ {
        alias /home/website/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # 其他所有请求代理到 Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件大小限制
    client_max_body_size 10m;
}
```

启用站点：
```bash
ln -s /etc/nginx/sites-available/personal-website /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 5.6 启动应用

```bash
cd /home/website

# 确保 PM2 进程继承生产数据目录
export PORTFOLIO_DATA_DIR=/var/lib/personal-website

# PM2 启动
pm2 start npm --name "personal-website" -- start

# 查看状态
pm2 status

# 保存进程列表（重启后自动恢复）
pm2 save
```

如果你使用 PM2 ecosystem 文件，建议在 `env` 中固定：

```js
env: {
  NODE_ENV: "production",
  PORTFOLIO_DATA_DIR: "/var/lib/personal-website"
}
```

修改环境变量后重启：

```bash
pm2 restart personal-website --update-env
pm2 save
```

### 5.7 验证

浏览器访问 `http://yourdomain.com`，应该能看到网站首页。

检查 SQLite：

```bash
sqlite3 /var/lib/personal-website/portfolio.sqlite ".tables"
sqlite3 /var/lib/personal-website/portfolio.sqlite "select * from metrics;"
```

---

## 6. HTTPS 与自动续期

### 6.1 申请 SSL 证书

```bash
# 确保 DNS 解析已生效，80 端口已开放
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 按提示输入邮箱，选择是否重定向 HTTP 到 HTTPS（选 2）
```

### 6.2 验证自动续期

```bash
# 模拟续期测试
certbot renew --dry-run

# certbot 已自动配置定时任务，每天会检查一次证书
```

---

## 7. 日常维护

### 7.1 更新代码

```bash
cd /home/website

# 拉取最新代码
git pull

# 重新构建
export PORTFOLIO_DATA_DIR=/var/lib/personal-website
npm ci
npm run build

# 如果本次更新包含数据迁移脚本变化，执行一次迁移脚本
node scripts/migrate-json-to-sqlite.mjs

# 重启应用
pm2 restart personal-website --update-env
```

### 7.2 查看日志

```bash
# 应用日志
pm2 logs personal-website

# nginx 日志
tail -f /var/log/nginx/personal-website-access.log
tail -f /var/log/nginx/personal-website-error.log
```

### 7.3 备份数据

运行时数据在项目目录外，优先备份 SQLite 数据目录：

```bash
# 服务器上先生成归档
tar -czf /tmp/personal-website-data-$(date +%Y%m%d-%H%M%S).tar.gz /var/lib/personal-website

# 本地拉取备份
scp root@服务器IP:/tmp/personal-website-data-*.tar.gz ./backup/
```

项目静态数据仍在代码里，尤其是 `lib/projects.ts`，正常通过 Git 管理即可。

上传文件存储在 `/var/lib/personal-website/uploads/`，已包含在上面的数据目录备份中。

### 7.4 添加备案号

首页底部需要显示备案号。在 `/content` 页面中，底部描述可以添加备案号文字。

---

## 8. 多服务部署（二级域名）

当服务器上有多个项目时，用 nginx 按域名转发到不同端口。

### 8.1 添加子域名 DNS 记录

```
例：要部署 blog.yourdomain.com

DNS 控制台 → 添加记录：
  主机记录: blog
  记录类型: A
  记录值: 服务器IP
```

### 8.2 nginx 按域名转发

```nginx
# 项目A：个人网站 → 端口 3000
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 项目B：博客 → 端口 4000
server {
    listen 80;
    server_name blog.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 项目C：API → 端口 5000
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 8.3 端口规划建议

为避免冲突，提前规划各服务的端口：

| 端口范围 | 用途 |
|---------|------|
| 3000-3999 | 前端/网站项目 |
| 4000-4999 | 后端/API 项目 |
| 5000-5999 | 工具/辅助服务 |
| 6000-6999 | 实验/测试项目 |

### 8.4 PM2 管理多服务

```bash
# 每个服务单独命名
pm2 start npm --name "website" -- start
pm2 start npm --name "blog" -- start
pm2 start node --name "api" -- server.js

# 查看所有服务
pm2 status

# 统一保存
pm2 save
```

### 8.5 SSL 证书批量申请

```bash
# 为多个域名同时申请证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d blog.yourdomain.com -d api.yourdomain.com
```

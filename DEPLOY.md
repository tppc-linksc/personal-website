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

> `@` 代表 tppc.top 本身，`www` 代表 www.tppc.top

### 2.2 验证解析

```bash
# 等几分钟后验证
ping tppc.top
nslookup tppc.top
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
git clone https://github.com/tppc-linksc/personal-website.git /home/personal-website
cd /home/personal-website

# 方法二：从本地上传（如果 GitHub 下载慢）
# 本地执行: scp -r ./personal-website root@服务器IP:/home/
```

### 5.2 配置环境变量

```bash
cd /home/personal-website

# 复制示例配置
cp .env.example .env

# 编辑配置
vim .env
```

填入：
```env
STUDIO_ADMIN_TOKEN=你的管理员密码
STUDIO_SESSION_SECRET=随机字符串用于会话加密
STUDIO_OWNER_NAME=你的名字
```

### 5.3 安装依赖并构建

```bash
npm install
npm run build
```

### 5.4 配置 nginx 反向代理

```bash
vim /etc/nginx/sites-available/personal-website
```

写入：
```nginx
server {
    listen 80;
    server_name tppc.top www.tppc.top;

    # 日志
    access_log /var/log/nginx/personal-website-access.log;
    error_log /var/log/nginx/personal-website-error.log;

    # 上传图片和静态资源
    location /uploads/ {
        alias /home/personal-website/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 静态资源缓存
    location /_next/static/ {
        alias /home/personal-website/.next/static/;
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

### 5.5 启动应用

```bash
cd /home/personal-website

# PM2 启动
pm2 start npm --name "personal-website" -- start

# 查看状态
pm2 status

# 保存进程列表（重启后自动恢复）
pm2 save
```

### 5.6 验证

浏览器访问 `http://tppc.top`，应该能看到网站首页。

---

## 6. HTTPS 与自动续期

### 6.1 申请 SSL 证书

```bash
# 确保 DNS 解析已生效，80 端口已开放
certbot --nginx -d tppc.top -d www.tppc.top

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
cd /home/personal-website

# 拉取最新代码
git pull

# 重新构建
npm install
npm run build

# 重启应用
pm2 restart personal-website
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

网站所有数据都在项目中，备份整个目录即可：

```bash
# 备份到本地
scp -r root@服务器IP:/home/personal-website/data ./backup/
scp root@服务器IP:/home/personal-website/lib/projects.ts ./backup/
```

### 7.4 添加备案号

首页底部需要显示备案号。在 `/content` 页面中，底部描述可以添加备案号文字。

---

## 8. 二级域名规划

### 8.1 当前网站

| 子域名 | 用途 |
|--------|------|
| `tppc.top` | 主域名，个人作品集网站 |
| `www.tppc.top` | 同上（301 重定向到主域） |

### 8.2 推荐的二级域名

| 子域名 | 用途 | 技术栈建议 |
|--------|------|-----------|
| `blog.tppc.top` | 博客（开发笔记/踩坑记录） | Next.js + MDX |
| `lab.tppc.top` | 实验室（AI 小工具/Demo） | 任意前端框架 |
| `api.tppc.top` | API 服务 | Express/Fastify |
| `status.tppc.top` | 服务状态监控 | Uptime Kuma |
| `img.tppc.top` | 图床服务 | Chevereto 自建 |
| `links.tppc.top` | 友链/书签导航 | 静态页面 |
| `tools.tppc.top` | 开发小工具集 | React/Next.js |
| `admin.tppc.top` | 统一管理后台 | 集成各服务入口 |

### 8.3 如何添加二级域名

每次添加新服务只需两步 DNS 记录：

```bash
# 例：添加 blog.tppc.top
# DNS 控制台 → 添加记录 → 主机记录: blog, 类型: A, 值: 服务器IP

# 对应 nginx 配置：
server {
    listen 80;
    server_name blog.tppc.top;
    location / {
        proxy_pass http://127.0.0.1:4000;
    }
}
```

### 8.4 多服务端口规划

| 服务 | 端口 |
|------|------|
| 个人网站 | 3000 |
| 博客 | 4000 |
| API | 5000 |
| 工具集 | 6000 |
| 实验室 | 7000 |

每个服务用 PM2 管理，nginx 按域名转发到对应端口。

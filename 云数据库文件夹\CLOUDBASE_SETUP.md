# 打卡APP - CloudBase 云环境重建指南

## 一、环境信息

| 配置项 | 值 |
|--------|-----|
| 云平台 | 腾讯云 CloudBase（云开发） |
| 环境ID | `punch-clock-d0gf4qatw6ea7beae` |
| 区域 | ap-shanghai |
| 认证方式 | 匿名登录（Anonymous Sign-in） |
| SDK | cloudbase-js-sdk（CDN加载） |

---

## 二、数据库集合

### 集合名：`attendance`

### 文档结构

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `_id` | String | 文档ID，格式 `{syncCode}_{date}` | `WANGGUOQING_2026-05-21` |
| `syncCode` | String | 同步码，用于多设备数据隔离 | `WANGGUOQING` |
| `date` | String | 打卡日期，格式 `YYYY-MM-DD` | `2026-05-21` |
| `in` | String | 上班打卡时间，格式 `HH:MM`，可为null | `09:30` |
| `out` | String | 下班打卡时间，格式 `HH:MM`，可为null | `18:00` |
| `note` | String | 备注 | `加班` |
| `status` | String | 状态（leave=请假 / out=外出 / null=正常） | `null` |
| `hours` | Number | 工时（小时），自动计算 | `8.5` |
| `isDeleted` | Boolean | 软删除标记 | `false` |
| `updatedAt` | Number | 更新时间戳（毫秒） | `1750000000000` |

### 创建集合

登录腾讯云开发控制台 → 数据库 → 新建集合 → 名称填 `attendance` → 权限选"所有用户可读写"

---

## 三、认证配置

### 3.1 开启匿名登录

CloudBase 控制台 → 环境设置 → 登录授权 → 开启"匿名登录"

### 3.2 Publishable Key（可选）

如果需要通过 HTTP API 直接访问数据库（而非 SDK），需在 CloudBase 控制台创建 Publishable Key：
- 控制台 → API 密钥 → 创建 Publishable Key
- 将 Key 填入前端 `sync_cloud.py` 模块（如使用 Python 客户端）

---

## 四、EdgeOne Pages 部署

### 4.1 上传前端文件

将 `本地文件夹/` 下所有文件上传到 EdgeOne Pages：
- `index.html`
- `manifest-v3.json`
- `sw.js`
- `icon-192.png`
- `icon-512.png`
- `icon-v2-finger.svg`

### 4.2 配置边缘函数

将 `云数据库文件夹/edge-functions/` 部署到 EdgeOne Pages 边缘函数：

| 函数 | 路径 | 作用 |
|------|------|------|
| `auth.js` | `/api/auth` | 代理 CloudBase 匿名登录 & Token 刷新 |
| `db.js` | `/api/db` | 代理 CloudBase 数据库读写（read/add/update） |

---

## 五、重建步骤清单

1. [ ] 腾讯云 CloudBase 新建环境（或使用已有环境 `punch-clock-d0gf4qatw6ea7beae`）
2. [ ] 开启匿名登录认证
3. [ ] 创建数据库集合 `attendance`
4. [ ] （可选）创建 Publishable Key
5. [ ] EdgeOne Pages 上传前端文件
6. [ ] 部署边缘函数 `auth.js` 和 `db.js`
7. [ ] 修改 `index.html` 中的 `ENV_ID` 为新环境ID（如换环境）
8. [ ] 修改 `edge-functions/api/*.js` 中的 `ENV_ID`（如换环境）

---

## 六、注意事项

- 同步码 `WANGGUOQING` 硬编码在 `index.html` 第616行，如需更换请修改
- 工时标准为 8.75 小时（525分钟），定义在 `index.html` 的 `WORK_MINUTES` 变量
- Service Worker 缓存策略为优先网络，离线时回退缓存
- 软删除记录（`isDeleted: true`）超过7天自动清理

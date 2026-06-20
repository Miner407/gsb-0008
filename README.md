# 会议纪要任务追踪器

基于 React + TypeScript + Express + SQLite 构建的会议管理与待办追踪系统。

## 技术栈

### 前端
- **框架**: React 18.3 + TypeScript 5.8
- **构建工具**: Vite 6
- **路由**: React Router v7
- **状态管理**: Zustand 5
- **样式**: Tailwind CSS 3.4
- **图标**: Lucide React

### 后端
- **框架**: Express.js 4.21
- **数据库**: SQLite（better-sqlite3 驱动）
- **开发工具**: Nodemon、Concurrently

## 启动方式

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发环境（前后端同时启动）

```bash
npm run dev
```

- 前端地址: http://localhost:5173
- 后端地址: http://localhost:3001

### 单独启动

```bash
# 仅启动前端
npm run client:dev

# 仅启动后端
npm run server:dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npm run check
```

## 主要功能

### 1. 会议管理
- 创建、编辑、删除会议
- 记录会议标题、日期、地点、结论
- 管理参会人员（姓名、角色）
- 管理会议议题（标题、描述、讨论内容）
- 会议详情页查看完整信息

### 2. 待办事项管理
- 每个会议可关联多个待办事项
- 待办支持：标题、描述、负责人、截止日期、状态、完成备注
- 状态类型：待处理 (pending)、进行中 (in_progress)、已完成 (completed)、已取消 (cancelled)
- 支持按负责人、状态、是否逾期筛选
- **批量操作**：批量修改状态、批量设置负责人、批量删除

### 3. 会议纪要导出（新增）
- 会议详情页支持一键导出 Markdown 格式会议纪要
- 导出内容包含：
  - 会议标题、日期、地点
  - 参会人员列表
  - 议题及讨论内容
  - 会议结论
  - 待办事项表格（含负责人、截止日期、状态、完成备注、关联议题）

### 4. 待办提醒视图（新增）
- 独立的提醒视图页面（导航栏"待办提醒"入口）
- 按以下分组展示待办：
  - **今日到期**：截止日期为今天的未完成待办
  - **三天内到期**：明天至第三天到期的未完成待办
  - **已逾期**：截止日期已过的未完成待办
  - **已完成**：最近完成的待办（最多 50 条）
- 每个待办项可直接跳转回对应会议详情页

### 5. 首页统计仪表盘（新增）
首页展示以下统计信息：
- **会议总数**：系统中所有会议数量
- **待办总数**：所有待办事项数量
- **已完成待办数**：状态为 completed 的待办数量
- **进行中待办数**：未完成的待办数量
- **逾期待办数**：截止日期已过且未完成的待办数量
- **近 7 天会议数量**：柱状图展示最近 7 天每天的会议数量
- **按负责人统计待办**：进度条图表展示各负责人的待办总数、已完成数、未完成数、逾期数

## API 路径

### 健康检查
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务健康检查 |

### 会议管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/meetings` | 获取会议列表（分页） |
| GET | `/api/meetings/:id` | 获取单个会议详情（含参会人、议题、待办） |
| POST | `/api/meetings` | 创建新会议 |
| PUT | `/api/meetings/:id` | 更新会议 |
| DELETE | `/api/meetings/:id` | 删除会议 |
| GET | `/api/meetings/:id/export?format=markdown` | 导出会议纪要（Markdown） |

### 待办事项
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/todos` | 获取待办列表（支持筛选、分页） |
| GET | `/api/todos/:id` | 获取单个待办详情 |
| PUT | `/api/todos/:id` | 更新待办事项 |
| PATCH | `/api/todos/:id/status` | 更新待办状态 |
| DELETE | `/api/todos/:id` | 删除待办事项 |
| POST | `/api/todos/batch-update-status` | 批量修改状态 |
| POST | `/api/todos/batch-update-assignee` | 批量设置负责人 |
| POST | `/api/todos/batch-delete` | 批量删除待办 |

#### 待办筛选参数 (GET `/api/todos`)
- `assignee`: 按负责人筛选
- `status`: 按状态筛选 (pending / in_progress / completed / cancelled)
- `meeting_id`: 按会议 ID 筛选
- `overdue=true`: 仅显示逾期未完成的待办
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）

#### 批量操作请求体示例

**批量修改状态**:
```json
{
  "ids": [1, 2, 3],
  "status": "completed",
  "completion_note": "已全部完成"
}
```

**批量设置负责人**:
```json
{
  "ids": [1, 2, 3],
  "assignee": "张三"
}
```

**批量删除**:
```json
{
  "ids": [1, 2, 3]
}
```

### 统计 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/dashboard` | 获取仪表盘统计数据 |
| GET | `/api/stats/todo-reminders` | 获取分组待办提醒数据 |

#### 仪表盘响应结构
```json
{
  "success": true,
  "data": {
    "totalMeetings": 10,
    "totalTodos": 25,
    "completedTodos": 15,
    "pendingTodos": 10,
    "overdueTodos": 3,
    "todosByAssignee": [
      { "assignee": "张三", "total": 8, "completed": 5, "pending": 3, "overdue": 1 }
    ],
    "meetingsLast7Days": [
      { "date": "2025-01-14", "count": 2 }
    ]
  }
}
```

#### 待办提醒响应结构
```json
{
  "success": true,
  "data": {
    "today": [...],
    "inThreeDays": [...],
    "overdue": [...],
    "completed": [...]
  }
}
```

## 验证步骤

### 验证一：会议纪要导出验证

**前置条件**: 系统中已创建至少一个包含参会人、议题、待办的会议

**操作步骤**:
1. 启动项目：`npm run dev`
2. 浏览器打开 http://localhost:5173
3. 在首页会议列表中点击任意一个会议进入详情页
4. 点击页面右上角的"导出 Markdown"按钮
5. 浏览器触发 `.md` 文件下载

**验证要点**:
- ✅ 文件成功下载，文件名格式为 `会议纪要_{会议标题}_{会议日期}.md`
- ✅ 使用文本编辑器打开下载的文件，内容包含：
  - 一级标题：会议标题
  - 基本信息：日期、地点
  - 参会人员：有序列表展示，含角色
  - 议题：每个议题有描述和讨论内容
  - 会议结论
  - 待办事项：Markdown 表格，包含序号、待办事项、负责人、截止日期、状态、完成备注、关联议题
- ✅ 状态显示为中文（待处理/进行中/已完成/已取消）
- ✅ 日期格式为 YYYY/MM/DD

**API 直接验证**:
```bash
curl -O -J http://localhost:3001/api/meetings/1/export
```

---

### 验证二：提醒与统计 API 验证

**前置条件**: 系统中存在多个会议和待办事项，待办设置不同的截止日期（今天、近 3 天、已逾期）和不同的负责人

**操作步骤**:

**2.1 仪表盘统计验证**:
1. 打开浏览器访问 http://localhost:5173（首页）
2. 观察顶部统计卡片区域
3. 查看"近 7 天会议数量"柱状图
4. 查看"按负责人待办统计"进度条图表

**API 直接验证**:
```bash
curl http://localhost:3001/api/stats/dashboard
```

**验证要点**:
- ✅ 返回 `totalMeetings`、`totalTodos`、`completedTodos`、`pendingTodos`、`overdueTodos` 数值正确
- ✅ `todosByAssignee` 数组按负责人分组统计正确
- ✅ `meetingsLast7Days` 包含完整 7 天数据，无会议的日期 count 为 0

**2.2 待办提醒视图验证**:
1. 点击导航栏的"待办提醒"（铃铛图标），或直接访问 http://localhost:5173/reminders
2. 页面显示四个分组区域

**API 直接验证**:
```bash
curl http://localhost:3001/api/stats/todo-reminders
```

**验证要点**:
- ✅ "今日到期"分组：仅显示截止日期为今天且未完成的待办
- ✅ "三天内到期"分组：显示明天至第 3 天到期且未完成的待办
- ✅ "已逾期"分组：显示截止日期早于今天且未完成的待办，标红提示
- ✅ "已完成"分组：显示最近完成的待办（最多 50 条）
- ✅ 每个待办项显示待办标题、负责人、截止日期、所属会议
- ✅ 点击待办项的"查看会议"链接，正确跳转到对应会议详情页

---

### 验证三：批量待办操作验证

**前置条件**: 待办列表中存在至少 3 条待办事项

**操作步骤**:
1. 打开 http://localhost:5173/todos 进入待办列表页
2. 勾选表格第一列的复选框，选择 2-3 条待办（支持全选框批量勾选）
3. 观察到列表上方出现蓝色批量操作工具栏

**3.1 批量修改状态**:
1. 在工具栏的"设置状态"下拉框中选择"已完成"
2. 点击"应用状态"按钮
3. 确认操作后列表刷新

**验证要点**:
- ✅ 所选待办的状态全部变更为"已完成"
- ✅ 首页仪表盘"已完成待办数"相应增加
- ✅ 待办提醒视图的"已完成"分组中出现这些待办

**3.2 批量设置负责人**:
1. 重新勾选 2-3 条待办
2. 在工具栏的"设置负责人"下拉框选择已有负责人，或输入新负责人名称
3. 点击"应用"按钮

**验证要点**:
- ✅ 所选待办的负责人全部更新
- ✅ 首页仪表盘"按负责人待办统计"数据相应变化

**3.3 批量删除**:
1. 勾选 1-2 条待办（建议选择测试数据）
2. 点击工具栏的"删除"按钮
3. 在确认弹窗中点击"确认删除"

**验证要点**:
- ✅ 所选待办从列表中消失
- ✅ 首页仪表盘"待办总数"相应减少
- ✅ 通过详情接口确认已删除：`curl http://localhost:3001/api/todos/{已删除的id}` 返回 404

---

## 项目结构

```
gsb-0008/
├── api/                      # 后端 Express 服务
│   ├── routes/
│   │   ├── auth.ts          # 认证路由（占位）
│   │   ├── meetings.ts      # 会议 CRUD + 导出
│   │   ├── todos.ts         # 待办 CRUD + 批量操作
│   │   └── stats.ts         # 统计 API
│   ├── app.ts               # 后端入口
│   └── db.ts                # SQLite 数据库初始化
├── src/                      # 前端 React 应用
│   ├── components/          # 可复用组件
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx         # 首页（含仪表盘）
│   │   ├── MeetingDetail.tsx # 会议详情（含导出）
│   │   ├── TodoList.tsx     # 待办列表（含批量操作）
│   │   └── TodoReminders.tsx # 待办提醒视图
│   ├── services/            # API 服务层
│   ├── store/               # Zustand 状态管理
│   └── types/               # TypeScript 类型定义
├── data/                     # SQLite 数据文件目录（自动生成）
├── vite.config.ts
├── eslint.config.js
├── tailwind.config.js
└── package.json
```

## 数据库结构

使用 SQLite，数据库文件自动生成在 `data/database.sqlite`。

### 表结构

- **meetings**: id, title, meeting_date, location, conclusion, created_at, updated_at
- **participants**: id, meeting_id, name, role
- **topics**: id, meeting_id, title, description, discussion, sort_order
- **todo_items**: id, meeting_id, topic_id, title, description, assignee, due_date, status, completion_note, created_at, updated_at

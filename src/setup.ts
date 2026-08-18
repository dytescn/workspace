const API_URL = "http://127.0.0.1:44944/database";
const ROUTER_DB = "./router";     // 路由数据库路径
const PROJECT_DB = "./project";   // 项目业务数据库路径
const design_DB = "./design";     // 设计文件业务数据库路径

// ---------- 清理旧路由 ----------
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_insert",
    },
    body: JSON.stringify({
        path: ROUTER_DB,
        sql: "DELETE FROM routers WHERE id IN (100, 200) OR parent_id IN (100, 200)",
    }),
});
console.log("旧工作区路由清理完成");

// ---------- 插入项目父路由（固定 ID 100） ----------
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_insert",
    },
    body: JSON.stringify({
        path: ROUTER_DB,
        sql: `
            INSERT INTO routers (id, title, icon, hide, path, parent_id, level)
            VALUES (100, '项目', 'ic-project', 0, '/project', 0, 1)
        `,
    }),
});
console.log("项目父路由插入成功");

// ---------- 插入项目子路由（parent_id = 100） ----------
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_insert",
    },
    body: JSON.stringify({
        path: ROUTER_DB,
        sql: `
            INSERT INTO routers (id, title, icon, hide, path, url, show, parent_id, level)
            VALUES (101, 'project', '', 0, '/project/list', '/workspace/project.js', 1, 100, 2)
        `,
    }),
});
console.log("项目子路由插入成功");

// ---------- 插入工作区父路由（固定 ID 200） ----------
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_insert",
    },
    body: JSON.stringify({
        path: ROUTER_DB,
        sql: `
            INSERT INTO routers (id, title, icon, hide, path, parent_id, level)
            VALUES (200, '工作区', 'ic-project', 1, '/workspace', 0, 1)
        `,
    }),
});
console.log("工作区父路由插入成功");

// ---------- 插入工作区文件子路由（parent_id = 200） ----------
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_insert",
    },
    body: JSON.stringify({
        path: ROUTER_DB,
        sql: `
            INSERT INTO routers (id, title, icon, hide, path, url, show, parent_id, level)
            VALUES (201, '工作区文件', '', 1, '/workspace', '/workspace/workspace.js', 1, 200, 2)
        `,
    }),
});

// ---------- 插入工作区设置子路由（parent_id = 200） ----------
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_insert",
    },
    body: JSON.stringify({
        path: ROUTER_DB,
        sql: `
            INSERT INTO routers (id, title, icon, hide, path, url, show, parent_id, level)
            VALUES (202, '工作区设置', '', 1, '/workspace/setting', '/workspace/setting.js', 1, 200, 2)
        `,
    }),
});
console.log("工作区子路由插入成功");

// ==================== 创建项目相关数据库表 ====================
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        table: "projects",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            organ_uid TEXT,
            create_by TEXT,
            pro_tpl_uid TEXT,
            cover TEXT,
            name TEXT,
            description TEXT,
            sort INTEGER,
            schedule TEXT,
            is_private INTEGER DEFAULT 0,
            is_archived INTEGER DEFAULT 0,
            archive_time TEXT,
            open_begin_time TEXT,
            open_task_private INTEGER DEFAULT 0,
            begin_time TEXT,
            end_time TEXT,
            recycle_time TEXT,
            is_recycled INTEGER DEFAULT 0,
            auto_update_schedule INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime')),
            deleted_at TEXT
        `,
    }),
});
console.log("表 projects 创建成功");

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        table: "project_features",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            project_uid TEXT,
            name TEXT,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime'))
        `,
    }),
});
console.log("表 project_features 创建成功");

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        table: "project_versions",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            project_uid TEXT,
            name TEXT,
            description TEXT,
            start_time TEXT,
            publish_time TEXT,
            plan_publish_time TEXT,
            schedule INTEGER,
            status INTEGER,
            features_uid TEXT,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime'))
        `,
    }),
});
console.log("表 project_versions 创建成功");

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        table: "project_version_logs",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            staff_uid TEXT,
            content TEXT,
            remark TEXT,
            log_type TEXT,
            task_uid TEXT,
            project_uid TEXT,
            features_uid TEXT,
            created_at TEXT DEFAULT (datetime('now','localtime'))
        `,
    }),
});
console.log("表 project_version_logs 创建成功");

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        table: "project_logs",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            project_uid TEXT,
            task_uid TEXT,
            staff_uid TEXT,
            content TEXT,
            remark TEXT,
            log_type TEXT,
            action_type TEXT,
            to_staff_uid TEXT,
            is_comment INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now','localtime'))
        `,
    }),
});
console.log("表 project_logs 创建成功");

// ==================== 创建设计文件相关数据库表 ====================
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: design_DB,
        table: "design_files",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            project_uid TEXT,
            organ_uid TEXT,
            flow_uid TEXT,
            type_uid TEXT,
            name TEXT,
            description TEXT,
            create_by TEXT,
            cover TEXT,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime'))
        `,
    }),
});
console.log("表 design_files 创建成功");

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: design_DB,
        table: "design_types",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            type_name TEXT,
            icon TEXT,
            extra TEXT,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime'))
        `,
    }),
});
console.log("表 design_types 创建成功");

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_create",
    },
    body: JSON.stringify({
        path: design_DB,
        table: "design_versions",
        schema: `
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            cover TEXT,
            design_uid TEXT,
            child_uid TEXT,
            soft_ver TEXT,
            name TEXT,
            logs TEXT,
            fuid TEXT,
            create_by TEXT,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            updated_at TEXT DEFAULT (datetime('now','localtime'))
        `,
    }),
});
console.log("表 design_versions 创建成功");

// ==================== 创建项目相关索引（逐条提交） ====================
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_projects_organ_uid ON projects(organ_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_projects_create_by ON projects(create_by)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_projects_pro_tpl_uid ON projects(pro_tpl_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_features_project_uid ON project_features(project_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_versions_project_uid ON project_versions(project_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_versions_features_uid ON project_versions(features_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_version_logs_staff_uid ON project_version_logs(staff_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_version_logs_task_uid ON project_version_logs(task_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_version_logs_project_uid ON project_version_logs(project_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_version_logs_features_uid ON project_version_logs(features_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_logs_project_uid ON project_logs(project_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_logs_task_uid ON project_logs(task_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_logs_staff_uid ON project_logs(staff_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: PROJECT_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_project_logs_to_staff_uid ON project_logs(to_staff_uid)",
    }),
});

// ==================== 创建设计相关索引（逐条提交） ====================
await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_files_project_uid ON design_files(project_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_files_organ_uid ON design_files(organ_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_files_flow_uid ON design_files(flow_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_files_type_uid ON design_files(type_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_files_create_by ON design_files(create_by)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_versions_design_uid ON design_versions(design_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_versions_child_uid ON design_versions(child_uid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_versions_fuid ON design_versions(fuid)",
    }),
});

await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/libary",
        "FFI-Symbol": "db_update",
    },
    body: JSON.stringify({
        path: design_DB,
        sql: "CREATE INDEX IF NOT EXISTS idx_design_versions_create_by ON design_versions(create_by)",
    }),
});

console.log("所有索引创建完成");
console.log("全部项目初始化任务完成！");
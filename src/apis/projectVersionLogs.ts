// src/apis/projectVersionLogs.ts
const API_URL = "http://127.0.0.1:44944/database";
const PROJECT_DB = "./project";

const dbFetch = async (symbol: string, body: any) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/libary',
      'FFI-Symbol': symbol,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const dbQuery = async (sql: string, path: string = PROJECT_DB) => {
  const raw = await dbFetch('db_query', { path, sql });
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return raw;
};

const dbInsert = (sql: string, path: string = PROJECT_DB) => dbFetch('db_insert', { path, sql });
const dbUpdate = (sql: string, path: string = PROJECT_DB) => dbFetch('db_update', { path, sql });
const dbDelete = (sql: string, path: string = PROJECT_DB) => dbFetch('db_delete', { path, sql });

// 新增日志
export const insertProjectVersionLog = async (data: any) => {
  const sql = `
    INSERT INTO project_version_logs (
      uuid, staff_uid, content, remark, log_type, task_uid,
      project_uid, features_uid, created_at
    ) VALUES (
      '${data.uuid || ''}', '${data.staff_uid || ''}', '${data.content || ''}',
      '${data.remark || ''}', '${data.log_type || ''}', '${data.task_uid || ''}',
      '${data.project_uid || ''}', '${data.features_uid || ''}',
      datetime('now','localtime')
    )
  `;
  return await dbInsert(sql);
};

// 删除日志
export const deleteProjectVersionLog = async (id: number) => {
  const sql = `DELETE FROM project_version_logs WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 按 id 查询
export const getProjectVersionLogById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM project_version_logs WHERE id = ${id}`);
  return rows?.[0] || null;
};

// 按项目查询所有版本日志
export const getProjectVersionLogsByProject = async (projectUid: string) => {
  return await dbQuery(`SELECT * FROM project_version_logs WHERE project_uid = '${projectUid}' ORDER BY id DESC`);
};

// 按版本库查询
export const getProjectVersionLogsByFeatures = async (featuresUid: string) => {
  return await dbQuery(`SELECT * FROM project_version_logs WHERE features_uid = '${featuresUid}' ORDER BY id DESC`);
};
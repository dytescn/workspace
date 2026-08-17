// src/apis/projectLogs.ts
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
export const insertProjectLog = async (data: any) => {
  const sql = `
    INSERT INTO project_logs (
      uuid, project_uid, task_uid, staff_uid, content, remark,
      log_type, action_type, to_staff_uid, is_comment, created_at
    ) VALUES (
      '${data.uuid || ''}', '${data.project_uid || ''}', '${data.task_uid || ''}',
      '${data.staff_uid || ''}', '${data.content || ''}', '${data.remark || ''}',
      '${data.log_type || ''}', '${data.action_type || ''}', '${data.to_staff_uid || ''}',
      ${data.is_comment ? 1 : 0}, datetime('now','localtime')
    )
  `;
  return await dbInsert(sql);
};

// 删除日志
export const deleteProjectLog = async (id: number) => {
  const sql = `DELETE FROM project_logs WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 按 id 查询
export const getProjectLogById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM project_logs WHERE id = ${id}`);
  return rows?.[0] || null;
};

// 按项目查询日志
export const getProjectLogsByProject = async (projectUid: string) => {
  return await dbQuery(`SELECT * FROM project_logs WHERE project_uid = '${projectUid}' ORDER BY id DESC`);
};

// 按任务查询日志
export const getProjectLogsByTask = async (taskUid: string) => {
  return await dbQuery(`SELECT * FROM project_logs WHERE task_uid = '${taskUid}' ORDER BY id DESC`);
};

// 按员工查询日志
export const getProjectLogsByStaff = async (staffUid: string) => {
  return await dbQuery(`SELECT * FROM project_logs WHERE staff_uid = '${staffUid}' ORDER BY id DESC`);
};
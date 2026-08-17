// src/apis/projectFeatures.ts
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

// 新增
export const insertProjectFeature = async (data: any) => {
  const sql = `
    INSERT INTO project_features (
      uuid, project_uid, name, description, created_at, updated_at
    ) VALUES (
      '${data.uuid || ''}', '${data.project_uid || ''}', '${data.name || ''}',
      '${data.description || ''}', datetime('now','localtime'), datetime('now','localtime')
    )
  `;
  return await dbInsert(sql);
};

// 更新
export const updateProjectFeature = async (id: number, data: any) => {
  const allowed = ['uuid', 'project_uid', 'name', 'description'];
  const setFields = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const val = typeof data[key] === 'string' ? `'${data[key]}'` : data[key];
      setFields.push(`${key} = ${val}`);
    }
  }
  if (setFields.length === 0) throw new Error('No fields to update');
  setFields.push(`updated_at = datetime('now','localtime')`);
  const sql = `UPDATE project_features SET ${setFields.join(', ')} WHERE id = ${id}`;
  return await dbUpdate(sql);
};

// 删除
export const deleteProjectFeature = async (id: number) => {
  const sql = `DELETE FROM project_features WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 按 id 查询
export const getProjectFeatureById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM project_features WHERE id = ${id}`);
  return rows?.[0] || null;
};

// 按项目查询
export const getProjectFeaturesByProject = async (projectUid: string) => {
  return await dbQuery(`SELECT * FROM project_features WHERE project_uid = '${projectUid}'`);
};
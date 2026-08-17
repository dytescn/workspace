// src/apis/projects.ts
// 完全自包含，使用 db_insert, db_update, db_delete, db_query

const API_URL = "http://127.0.0.1:44944/database";
const PROJECT_DB = "./project";

// ---------- 基础数据库操作 ----------
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
  if (raw?.data && Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw;
};

const dbInsert = (sql: string, path: string = PROJECT_DB) => {
  return dbFetch('db_insert', { path, sql });
};

const dbUpdate = (sql: string, path: string = PROJECT_DB) => {
  return dbFetch('db_update', { path, sql });
};

const dbDelete = (sql: string, path: string = PROJECT_DB) => {
  return dbFetch('db_delete', { path, sql });
};

// ---------- 项目 CRUD ----------
// 1. 新增项目
export const insertProject = async (data: any) => {
  const sql = `
    INSERT INTO projects (
      uuid, organ_uid, create_by, pro_tpl_uid, cover, name, description,
      sort, schedule, is_private, is_archived, archive_time, open_begin_time,
      open_task_private, begin_time, end_time, recycle_time, is_recycled,
      auto_update_schedule, created_at, updated_at, deleted_at
    ) VALUES (
      '${data.uuid || ''}', '${data.organ_uid || ''}', '${data.create_by || ''}',
      '${data.pro_tpl_uid || ''}', '${data.cover || ''}', '${data.name || ''}',
      '${data.description || ''}', ${data.sort || 0}, '${data.schedule || ''}',
      ${data.is_private ? 1 : 0}, ${data.is_archived ? 1 : 0},
      '${data.archive_time || ''}', '${data.open_begin_time || ''}',
      ${data.open_task_private ? 1 : 0}, '${data.begin_time || ''}',
      '${data.end_time || ''}', '${data.recycle_time || ''}',
      ${data.is_recycled ? 1 : 0}, ${data.auto_update_schedule ? 1 : 0},
      datetime('now','localtime'), datetime('now','localtime'), NULL
    )
  `;
  return await dbInsert(sql);
};

// 2. 更新项目（按 id）
export const updateProject = async (id: number, data: any) => {
  const setFields: string[] = [];
  const allowed = [
    'uuid','organ_uid','create_by','pro_tpl_uid','cover','name','description',
    'sort','schedule','is_private','is_archived','archive_time','open_begin_time',
    'open_task_private','begin_time','end_time','recycle_time','is_recycled',
    'auto_update_schedule'
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      let val;
      if (typeof data[key] === 'string') {
        val = `'${data[key]}'`;
      } else if (typeof data[key] === 'boolean') {
        val = data[key] ? 1 : 0;
      } else {
        val = data[key];
      }
      setFields.push(`${key} = ${val}`);
    }
  }
  if (setFields.length === 0) throw new Error('No fields to update');
  setFields.push(`updated_at = datetime('now','localtime')`);
  const sql = `UPDATE projects SET ${setFields.join(', ')} WHERE id = ${id}`;
  return await dbUpdate(sql);
};

// 3. 软删除（设置 deleted_at）
export const softDeleteProject = async (id: number) => {
  const sql = `UPDATE projects SET deleted_at = datetime('now','localtime') WHERE id = ${id}`;
  return await dbUpdate(sql);
};

// 4. 物理删除
export const deleteProject = async (id: number) => {
  const sql = `DELETE FROM projects WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 5. 按 id 查询单个（未删除）
export const getProjectById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM projects WHERE id = ${id} AND deleted_at IS NULL`);
  return rows?.[0] || null;
};

// 6. 通用查询列表
export const getProjects = async (where: string = '', order: string = 'id DESC', limit?: number) => {
  let sql = `SELECT * FROM projects WHERE deleted_at IS NULL`;
  if (where) sql += ` AND ${where}`;
  sql += ` ORDER BY ${order}`;
  if (limit) sql += ` LIMIT ${limit}`;
  return await dbQuery(sql);
};

// 7. 按组织查询
export const getProjectsByOrgan = async (organUid: string) => {
  return await getProjects(`organ_uid = '${organUid}'`);
};

// 8. 按创建人查询
export const getProjectsByCreator = async (createBy: string) => {
  return await getProjects(`create_by = '${createBy}'`);
};
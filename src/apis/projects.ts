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

// 查询
const dbQuery = async (sql: string, path: string = PROJECT_DB) => {
  const raw = await dbFetch('db_query', { path, sql });
  if (raw?.data && Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw;
};

// 插入
const dbInsert = (sql: string, path: string = PROJECT_DB) => {
  return dbFetch('db_insert', { path, sql });
};

// 更新
const dbUpdate = (sql: string, path: string = PROJECT_DB) => {
  return dbFetch('db_update', { path, sql });
};

// 删除
const dbDelete = (sql: string, path: string = PROJECT_DB) => {
  return dbFetch('db_delete', { path, sql });
};

// ---------- 项目 CRUD ----------
// 1. 新增项目
export const insertProject = async (data: any) => {
  const sql = `
    INSERT INTO project (
      uuid, organ_uid, create_by, pro_tpl_uid, cover, name, description,
      sort, schedule, private, archive, archive_time, open_begin_time,
      open_task_private, begin_time, end_time, recycle_time, is_recycle,
      auto_update_schedule, created_at, updated_at
    ) VALUES (
      '${data.uuid || ''}', '${data.organ_uid || ''}', '${data.create_by || ''}',
      '${data.pro_tpl_uid || ''}', '${data.cover || ''}', '${data.name || ''}',
      '${data.description || ''}', ${data.sort || 0}, '${data.schedule || ''}',
      ${data.private || 0}, ${data.archive || 2}, '${data.archive_time || ''}',
      '${data.open_begin_time || ''}', '${data.open_task_private || ''}',
      '${data.begin_time || ''}', '${data.end_time || ''}', '${data.recycle_time || ''}',
      ${data.is_recycle || 2}, ${data.auto_update_schedule || 0},
      datetime('now'), datetime('now')
    )
  `;
  return await dbInsert(sql);
};

// 2. 更新项目（按 id）
export const updateProject = async (id: number, data: any) => {
  const setFields: string[] = [];
  const allowed = [
    'uuid','organ_uid','create_by','pro_tpl_uid','cover','name','description',
    'sort','schedule','private','archive','archive_time','open_begin_time',
    'open_task_private','begin_time','end_time','recycle_time','is_recycle',
    'auto_update_schedule'
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const val = typeof data[key] === 'string' ? `'${data[key]}'` : data[key];
      setFields.push(`${key} = ${val}`);
    }
  }
  if (setFields.length === 0) throw new Error('No fields to update');
  setFields.push(`updated_at = datetime('now')`);
  const sql = `UPDATE project SET ${setFields.join(', ')} WHERE id = ${id}`;
  return await dbUpdate(sql);
};

// 3. 软删除（设置 deleted_at）
export const softDeleteProject = async (id: number) => {
  const sql = `UPDATE project SET deleted_at = datetime('now') WHERE id = ${id}`;
  return await dbUpdate(sql);  // 实际上也是更新，使用 dbUpdate
};

// 4. 物理删除
export const deleteProject = async (id: number) => {
  const sql = `DELETE FROM project WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 5. 按 id 查询单个
export const getProjectById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM project WHERE id = ${id} AND deleted_at IS NULL`);
  return rows?.[0] || null;
};

// 6. 通用查询列表
export const getProjects = async (where: string = '', order: string = 'id DESC', limit?: number) => {
  let sql = `SELECT * FROM project WHERE deleted_at IS NULL`;
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
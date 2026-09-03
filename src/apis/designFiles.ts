// src/apis/designFiles.ts
const API_URL = "http://127.0.0.1:44944/database";
const DESIGN_DB = "./design";

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

const dbQuery = async (sql: string, path: string = DESIGN_DB) => {
  const raw = await dbFetch('db_query', { path, sql });
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return raw;
};

const dbInsert = (sql: string, path: string = DESIGN_DB) => dbFetch('db_insert', { path, sql });
const dbUpdate = (sql: string, path: string = DESIGN_DB) => dbFetch('db_update', { path, sql });
const dbDelete = (sql: string, path: string = DESIGN_DB) => dbFetch('db_delete', { path, sql });

// 新增设计文件
export const insertDesignFile = async (data: any) => {
  const sql = `
    INSERT INTO design_files (
      uuid, project_uid, organ_uid, flow_uid, type_uid, name,
      description, create_by, cover, created_at, updated_at
    ) VALUES (
      '${data.uuid || ''}', '${data.project_uid || ''}', '${data.organ_uid || ''}',
      '${data.flow_uid || ''}', '${data.type_uid || ''}', '${data.name || ''}',
      '${data.description || ''}', '${data.create_by || ''}', '${data.cover || ''}',
      datetime('now','localtime'), datetime('now','localtime')
    )
  `;
  return await dbInsert(sql);
};

// 更新设计文件
export const updateDesignFile = async (id: number, data: any) => {
  const allowed = ['uuid','project_uid','organ_uid','flow_uid','type_uid','name','description','create_by','cover'];
  const setFields = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const val = typeof data[key] === 'string' ? `'${data[key]}'` : data[key];
      setFields.push(`${key} = ${val}`);
    }
  }
  if (setFields.length === 0) throw new Error('No fields to update');
  setFields.push(`updated_at = datetime('now','localtime')`);
  const sql = `UPDATE design_files SET ${setFields.join(', ')} WHERE id = ${id}`;
  return await dbUpdate(sql);
};

// 删除设计文件
export const deleteDesignFile = async (id: number) => {
  const sql = `DELETE FROM design_files WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 按 id 查询
export const getDesignFileById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM design_files WHERE id = ${id}`);
  return rows?.[0] || null;
};

// 按项目查询设计文件
export const getDesignFilesByProject = async (projectUid: string) => {
  return await dbQuery(`SELECT * FROM design_files WHERE project_uid = '${projectUid}' ORDER BY id DESC`);
};

// 按类型查询
export const getDesignFilesByType = async (typeUid: string) => {
  return await dbQuery(`SELECT * FROM design_files WHERE type_uid = '${typeUid}' ORDER BY id DESC`);
};

// src/apis/designFiles.ts（新增）

/**
 * 按 uuid 查询设计文件
 * @param uuid 设计文件唯一标识
 * @returns 设计文件对象或 null
 */
export const getDesignFileByUuid = async (uuid: string) => {
  const rows = await dbQuery(`SELECT * FROM design_files WHERE uuid = '${uuid}'`);
  return rows?.[0] || null;
};
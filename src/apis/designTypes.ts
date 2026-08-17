// src/apis/designTypes.ts
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

// 新增类型
export const insertDesignType = async (data: any) => {
  const sql = `
    INSERT INTO design_types (uuid, type_name, icon, extra, created_at, updated_at)
    VALUES (
      '${data.uuid || ''}', '${data.type_name || ''}', '${data.icon || ''}',
      '${data.extra || ''}', datetime('now','localtime'), datetime('now','localtime')
    )
  `;
  return await dbInsert(sql);
};

// 更新类型
export const updateDesignType = async (id: number, data: any) => {
  const allowed = ['uuid','type_name','icon','extra'];
  const setFields = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const val = typeof data[key] === 'string' ? `'${data[key]}'` : data[key];
      setFields.push(`${key} = ${val}`);
    }
  }
  if (setFields.length === 0) throw new Error('No fields to update');
  setFields.push(`updated_at = datetime('now','localtime')`);
  const sql = `UPDATE design_types SET ${setFields.join(', ')} WHERE id = ${id}`;
  return await dbUpdate(sql);
};

// 删除类型
export const deleteDesignType = async (id: number) => {
  const sql = `DELETE FROM design_types WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 按 id 查询
export const getDesignTypeById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM design_types WHERE id = ${id}`);
  return rows?.[0] || null;
};

// 获取所有类型
export const getAllDesignTypes = async () => {
  return await dbQuery(`SELECT * FROM design_types ORDER BY id ASC`);
};
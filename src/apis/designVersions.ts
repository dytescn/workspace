// src/apis/designVersions.ts
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

// 新增设计文件版本
export const insertDesignVersion = async (data: any) => {
  const sql = `
    INSERT INTO design_versions (
      uuid, cover, design_uid, child_uid, soft_ver, name, logs, fuid, create_by, created_at, updated_at
    ) VALUES (
      '${data.uuid || ''}', '${data.cover || ''}', '${data.design_uid || ''}',
      '${data.child_uid || ''}', '${data.soft_ver || ''}', '${data.name || ''}',
      '${data.logs || ''}', '${data.fuid || ''}', '${data.create_by || ''}',
      datetime('now','localtime'), datetime('now','localtime')
    )
  `;
  return await dbInsert(sql);
};

// 更新版本
export const updateDesignVersion = async (id: number, data: any) => {
  const allowed = ['uuid','cover','design_uid','child_uid','soft_ver','name','logs','fuid','create_by'];
  const setFields = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const val = typeof data[key] === 'string' ? `'${data[key]}'` : data[key];
      setFields.push(`${key} = ${val}`);
    }
  }
  if (setFields.length === 0) throw new Error('No fields to update');
  setFields.push(`updated_at = datetime('now','localtime')`);
  const sql = `UPDATE design_versions SET ${setFields.join(', ')} WHERE id = ${id}`;
  return await dbUpdate(sql);
};

// 删除版本
export const deleteDesignVersion = async (id: number) => {
  const sql = `DELETE FROM design_versions WHERE id = ${id}`;
  return await dbDelete(sql);
};

// 按 id 查询
export const getDesignVersionById = async (id: number) => {
  const rows = await dbQuery(`SELECT * FROM design_versions WHERE id = ${id}`);
  return rows?.[0] || null;
};

// 按设计文件查询所有版本
export const getDesignVersionsByDesign = async (designUid: string) => {
  return await dbQuery(`SELECT * FROM design_versions WHERE design_uid = '${designUid}' ORDER BY id DESC`);
};

// 按节点查询
export const getDesignVersionsByChild = async (childUid: string) => {
  return await dbQuery(`SELECT * FROM design_versions WHERE child_uid = '${childUid}' ORDER BY id DESC`);
};
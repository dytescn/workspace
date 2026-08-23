// src/apis/save_file.ts

import { insertDesignFile } from "./designFiles.ts";
import { generateUUID } from "../utils/uuid.ts";
import { getCurrentDir } from "../utils/sysinfo.ts";

// ---------- 通用 FFI 调用 ----------
async function callFFI<T = any>(
  symbol: string,
  body: Record<string, unknown>,
  endpoint: string = "http://127.0.0.1:44944/sysinfo"
): Promise<{ code: number; data: T; msg: string }> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/libary",
      "FFI-Symbol": symbol,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ---------- 工作区管理 ----------
export async function ensureWorkspace(): Promise<string> {
  const createRes = await callFFI<{ path: string }>("create_dir", { dir_name: "workspace" });
  if (createRes.code !== 200) {
    throw new Error(`创建/获取 workspace 目录失败: ${createRes.msg}`);
  }
  return createRes.data.path;
}

// ---------- 获取当前设计信息 ----------
export interface DesignInfo {
  filePath: string;
  puid: string | null;
  uuid: string | null;
}

export async function getCurrentDesignInfo(ver: string = "26"): Promise<DesignInfo> {
  const res = await fetch("http://127.0.0.1:44944/cdrimex", {
    method: "POST",
    headers: {
      "Content-Type": "application/libary",
      "FFI-Symbol": "current_file_path",
    },
    body: JSON.stringify({ ver }),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();

  console.log("getCurrentDesignInfo 响应:", json);

  let filePath: string | null = null;
  if (json.code === 200 && json.data?.file_path !== undefined) {
    filePath = json.data.file_path;
  } else if (json.code === 200 && json.data?.path !== undefined) {
    filePath = json.data.path;
  } else if (json.data?.file_path !== undefined) {
    filePath = json.data.file_path;
  } else if (json.data?.path !== undefined) {
    filePath = json.data.path;
  } else if (json.file_path !== undefined) {
    filePath = json.file_path;
  } else if (json.path !== undefined) {
    filePath = json.path;
  } else if (json.data && typeof json.data === 'string') {
    filePath = json.data;
  }

  if (filePath === "") {
    return { filePath: "", puid: null, uuid: null };
  }

  if (filePath == null) {
    console.error("无法解析文件路径，完整响应:", json);
    throw new Error("无法从响应中解析文件路径");
  }

  const parts = filePath.split(/[\\/]/);
  const fileName = parts[parts.length - 1] || "";
  if (!fileName) {
    return { filePath, puid: null, uuid: null };
  }

  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const underscoreIndex = baseName.indexOf("_");
  if (underscoreIndex === -1) {
    return { filePath, puid: null, uuid: null };
  }

  const puid = baseName.slice(0, underscoreIndex);
  const uuid = baseName.slice(underscoreIndex + 1);
  if (!puid || !uuid) {
    return { filePath, puid: null, uuid: null };
  }

  return { filePath, puid, uuid };
}

// ---------- 导出文件与封面 ----------
export async function exportDesignFile(targetPath: string, ver: string = "26"): Promise<any> {
  const result = await callFFI(
    "export_file",
    { file_src: targetPath, ver },
    "http://127.0.0.1:44944/cdrimex"
  );
  if (result.code !== 200) throw new Error(`保存文件失败: ${result.msg}`);
  return result;
}

export async function exportCover(coverPath: string, ver: string = "26"): Promise<any> {
  const result = await callFFI(
    "export_cover",
    { cover_src: coverPath, ver },
    "http://127.0.0.1:44944/cdrimex"
  );
  if (result.code !== 200) throw new Error(`导出封面失败: ${result.msg}`);
  return result;
}

// ---------- 通用保存（覆盖已有文件） ----------
export async function do_save_file(options: { filePath: string; puid?: string | null; uuid?: string | null }): Promise<any> {
  return await exportDesignFile(options.filePath);
}

// ---------- 高级封装 ----------
interface SaveToWorkspaceOptions {
  projectUid: string;
  fileName?: string;
  puid?: string;
  uuid?: string;
  ver?: string;
}

export async function saveCurrentDesignToWorkspace(options: SaveToWorkspaceOptions): Promise<any> {
  const { projectUid, ver = "26" } = options;

  const workspaceDir = await ensureWorkspace();
  const currentDir = await getCurrentDir();
  const assetsDir = `${currentDir}/web/assets`;

  let puid = options.puid;
  let uuid = options.uuid;
  if (!puid || !uuid) {
    try {
      const info = await getCurrentDesignInfo(ver);
      if (info.puid && info.uuid) {
        puid = info.puid;
        uuid = info.uuid;
      } else {
        puid = puid || projectUid;
        uuid = uuid || generateUUID();
      }
    } catch {
      puid = puid || projectUid;
      uuid = uuid || generateUUID();
    }
  }

  const fileName = options.fileName || `${puid}_${uuid}.cdr`;
  const targetPath = `${workspaceDir}/${fileName}`;
  await exportDesignFile(targetPath, ver);

  // 生成封面编号，并加上 .png 扩展名存储到数据库
  const coverId = generateUUID().replace(/-/g, "").slice(0, 16);
  const coverFileName = `${coverId}.png`; // 完整文件名
  const coverFullPath = `${assetsDir}/${coverFileName}`;
  await exportCover(coverFullPath, ver);

  const insertData = {
    uuid,
    project_uid: projectUid,
    name: fileName,
    cover: coverFileName, // 存储完整文件名（含扩展名）
    organ_uid: "",
    flow_uid: "",
    type_uid: "",
    create_by: "",
    description: "",
  };
  return await insertDesignFile(insertData);
}
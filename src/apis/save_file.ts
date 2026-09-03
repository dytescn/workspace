// src/apis/save_file.ts

import { insertDesignFile, updateDesignFile, getDesignFileByUuid } from "./designFiles.ts";
import { insertDesignVersion } from "./designVersions.ts";
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

// ---------- 目录管理 ----------
export async function ensureWorkspace(): Promise<string> {
  const createRes = await callFFI<{ path: string }>("create_dir", { dir_name: "workspace" });
  if (createRes.code !== 200) {
    throw new Error(`创建/获取 workspace 目录失败: ${createRes.msg}`);
  }
  const path = createRes.data.path.replace(/\//g, '\\');
  console.log("ensureWorkspace 返回路径:", path);
  return path;
}

async function ensureVersionsDir(): Promise<string> {
  const currentDir = await getCurrentDir();
  const versionsDir = `${currentDir}\\workspace\\versions`;
  console.log("准备创建版本目录:", versionsDir);
  const createRes = await callFFI<{ path: string }>("create_dir", { dir_name: versionsDir });
  if (createRes.code !== 200) {
    throw new Error(`创建版本目录失败: ${createRes.msg}`);
  }
  return versionsDir;
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

  // ✅ 过滤版本文件
  if (filePath && (filePath.includes('workspace\\versions') || filePath.includes('workspace/versions'))) {
    console.log("检测到版本文件，视为新文件");
    return { filePath: "", puid: null, uuid: null };
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
  const fixedPath = targetPath.replace(/\//g, '\\');
  console.log("exportDesignFile 路径:", fixedPath);
  const result = await callFFI(
    "export_file",
    { file_src: fixedPath, ver },
    "http://127.0.0.1:44944/cdrimex"
  );
  console.log("exportDesignFile 结果:", result);
  if (result.code !== 200) throw new Error(`保存文件失败: ${result.msg}`);
  return result;
}

export async function exportCover(coverPath: string, ver: string = "26"): Promise<any> {
  const fixedPath = coverPath.replace(/\//g, '\\');
  console.log("exportCover 路径:", fixedPath);
  const result = await callFFI(
    "export_cover",
    { cover_src: fixedPath, ver },
    "http://127.0.0.1:44944/cdrimex"
  );
  console.log("exportCover 结果:", result);
  if (result.code !== 200) throw new Error(`导出封面失败: ${result.msg}`);
  return result;
}

// ---------- 通用保存（覆盖已有文件，不处理版本） ----------
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

  console.log("saveCurrentDesignToWorkspace 开始，选项:", options);

  // 1. 确保目录存在
  const workspaceDir = await ensureWorkspace();
  const versionsDir = await ensureVersionsDir();
  const currentDir = await getCurrentDir();
  const assetsDir = `${currentDir}\\web\\assets`;
  console.log("工作目录:", workspaceDir);
  console.log("版本目录:", versionsDir);
  console.log("assets 目录:", assetsDir);

  // 2. 获取或生成 puid / uuid
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
  console.log("最终 puid:", puid, "uuid:", uuid);

  // 3. 主文件名和路径
  const fileName = options.fileName || `${puid}_${uuid}.cdr`;
  const targetPath = `${workspaceDir}\\${fileName}`;
  console.log("主文件保存路径:", targetPath);

  // 4. 导出设计文件
  await exportDesignFile(targetPath, ver);

  // 5. 导出封面
  const coverId = generateUUID().replace(/-/g, "").slice(0, 16);
  const coverFileName = `${coverId}.png`;
  const coverFullPath = `${assetsDir}\\${coverFileName}`;
  console.log("封面保存路径:", coverFullPath);
  await exportCover(coverFullPath, ver);

  // 6. 检查设计是否已存在
  const existingDesign = await getDesignFileByUuid(uuid);
  if (existingDesign) {
    console.log("设计已存在，ID:", existingDesign.id);
    await updateDesignFile(existingDesign.id, { cover: coverFileName });
  } else {
    console.log("插入新设计记录");
    await insertDesignFile({
      uuid,
      project_uid: projectUid,
      name: fileName,
      cover: coverFileName,
      organ_uid: "",
      flow_uid: "",
      type_uid: "",
      create_by: "",
      description: "",
    });
  }

  // 7. 保存版本文件（每次都新增）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const versionFileName = `${uuid}_${timestamp}.cdr`;
  const versionPath = `${versionsDir}\\${versionFileName}`;
  console.log("版本文件保存路径:", versionPath);
  await exportDesignFile(versionPath, ver);

  // 8. 插入版本记录
  const versionUuid = generateUUID();
  await insertDesignVersion({
    uuid: versionUuid,
    design_uid: uuid,
    child_uid: "",
    soft_ver: ver,
    name: `v${timestamp}`,
    logs: "自动保存",
    fuid: versionPath,
    cover: coverFileName,
    create_by: "",
  });

  console.log("保存完成");
  return { uuid, puid, fileName, versionPath };
}
// src/route/workspace_list.ts
import { workspace_design_card_tpl } from "../view/card.ts";
import { getDesignFilesByProject } from "../apis/designFiles.ts";
import { getDesignIconByExtension } from "../view/icons.ts"; // 改为扩展名匹配
import {
  getCurrentDesignInfo,
  do_save_file,
  saveCurrentDesignToWorkspace,
} from "../apis/save_file.ts";
import { dialog_alert_tpl, dialog_input_tpl } from "../view/dialog.ts";
import type { Tpl } from "@funxdata/pages/tplstype";

const TplToHtml = (globalThis as any)["TplToHtml"] as Tpl;

// ---------- 确认对话框（无输入） ----------
function showConfirm(message: string, title: string = "提示"): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.getElementById("popup");
    if (!container) {
      console.error("未找到 #popup，无法显示对话框");
      resolve(false);
      return;
    }
    container.innerHTML = TplToHtml.renderString(dialog_alert_tpl, { name: title, message });
    const confirmBtn = container.querySelector("#define") as HTMLElement;
    const cancelBtn = container.querySelector("#cancel") as HTMLElement;
    const cleanup = () => {
      confirmBtn?.removeEventListener("click", onConfirm);
      cancelBtn?.removeEventListener("click", onCancel);
    };
    const onConfirm = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };
    confirmBtn?.addEventListener("click", onConfirm);
    cancelBtn?.addEventListener("click", onCancel);
  });
}

// ---------- 输入对话框（带输入框） ----------
function showInputDialog(
  message: string,
  title: string = "输入",
  defaultValue: string = ""
): Promise<string | null> {
  return new Promise((resolve) => {
    const container = document.getElementById("popup");
    if (!container) {
      console.error("未找到 #popup，无法显示输入对话框");
      resolve(null);
      return;
    }
    container.innerHTML = TplToHtml.renderString(dialog_input_tpl, {
      info: {
        title,
        placeholder: message,
      },
    });
    const input = container.querySelector("#dialog-input input") as HTMLInputElement;
    if (input && defaultValue) {
      input.value = defaultValue;
    }
    const confirmBtn = container.querySelector("#define") as HTMLElement;
    const cancelBtn = container.querySelector("#cancel") as HTMLElement;

    const cleanup = () => {
      confirmBtn?.removeEventListener("click", onConfirm);
      cancelBtn?.removeEventListener("click", onCancel);
    };
    const onConfirm = () => {
      cleanup();
      const val = input ? input.value.trim() : "";
      resolve(val || null);
    };
    const onCancel = () => {
      cleanup();
      resolve(null);
    };

    confirmBtn?.addEventListener("click", onConfirm);
    cancelBtn?.addEventListener("click", onCancel);
  });
}

// ---------- 渲染设计文件列表 ----------
async function renderDesignFiles(container: HTMLElement, projectUid: string) {
  try {
    const designfiles = await getDesignFilesByProject(projectUid);
    if (!designfiles || designfiles.length === 0) {
      container.innerHTML = `<div class="empty-state">暂无设计文件</div>`;
      return;
    }
    const processedFiles = designfiles.map((file: any) => {
      // 根据文件名（含扩展名）获取图标 SVG
      const svg = getDesignIconByExtension(file.name); // 使用扩展名判断
      // 注意：不需要转义为 data URI，直接使用 SVG 字符串
      return {
        ...file,
        icon_svg: svg, // 直接放 SVG 字符串
        updated_at_display: file.updated_at
          ? new Date(file.updated_at.replace(" ", "T")).toLocaleString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
      };
    });
    container.innerHTML = TplToHtml.renderString(workspace_design_card_tpl, {
      designfiles: processedFiles,
    });
  } catch (error) {
    console.error("加载设计文件失败:", error);
    container.innerHTML = `<div class="error">加载失败，请刷新重试</div>`;
  }
}

// ---------- 主入口 ----------
export const workspace_list = async (projectUid: string) => {
  const container = document.getElementById("design-files");
  if (!container) return;

  const addBtn = document.getElementById("design_file_add") as HTMLElement;
  addBtn.addEventListener("click", () => designfile_add(projectUid));

  await renderDesignFiles(container, projectUid);
};

// ---------- 点击“添加设计文件” ----------
const designfile_add = async (projectUid: string) => {
  console.log("设计文件添加按钮被点击");

  try {
    const info = await getCurrentDesignInfo();

    // 1. 文件未保存（空路径）
    if (!info.filePath) {
      const fileName = await showInputDialog("请输入文件名（不含扩展名）", "保存文件", "未命名");
      if (fileName) {
        // 清空弹框（关闭对话框）
        const popup = document.getElementById("popup");
        if (popup) popup.innerHTML = "";
        const fullFileName = fileName.endsWith(".cdr") ? fileName : `${fileName}.cdr`;
        await saveCurrentDesignToWorkspace({ projectUid, fileName: fullFileName });
        await renderDesignFiles(document.getElementById("design-files")!, projectUid);
      }
      return;
    }

    // 2. 文件已存在且命名规范
    if (info.puid && info.uuid) {
      console.log(`文件已存在：${info.filePath}，puid=${info.puid}，uuid=${info.uuid}`);
      await do_save_file({ filePath: info.filePath });
      // 可考虑提示保存成功
      return;
    }

    // 3. 文件名不规范
    const userFileName = await showInputDialog("请输入文件名（不含扩展名）", "保存文件", "");
    if (userFileName) {
      // 清空弹框
      const popup = document.getElementById("popup");
      if (popup) popup.innerHTML = "";
      const fullFileName = userFileName.endsWith(".cdr") ? userFileName : `${userFileName}.cdr`;
      await saveCurrentDesignToWorkspace({ projectUid, fileName: fullFileName });
      await renderDesignFiles(document.getElementById("design-files")!, projectUid);
    }
  } catch (error) {
    console.error("获取设计文件信息失败:", error);
    await showConfirm("请先打开设计软件(CorelDRAW)并确保服务已启动。", "软件未打开");
  }
};
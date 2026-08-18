import { workspace_design_card_tpl } from "../view/card.ts";
import { getDesignFilesByProject } from "../apis/designFiles.ts";
import type { Tpl } from "@funxdata/pages/tplstype";

const TplToHtml = (globalThis as any)["TplToHtml"] as Tpl;

export const workspace_list = async (projectUid: string) => {
  const container = document.getElementById("design-files");
  if (!container) return;

  try {
    const designfiles = await getDesignFilesByProject(projectUid);

    if (!designfiles || designfiles.length === 0) {
      container.innerHTML = `<div class="empty-state">暂无设计文件</div>`;
      return;
    }

    // 预处理时间字段，避免模板中复杂表达式
    const processedFiles = designfiles.map((file: any) => ({
      ...file,
      updated_at_display: file.updated_at
        ? new Date(file.updated_at.replace(" ", "T")).toLocaleString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "",
    }));

    container.innerHTML = await TplToHtml.renderString(workspace_design_card_tpl, {
      designfiles: processedFiles,
    });
  } catch (error) {
    console.error("加载设计文件失败:", error);
    container.innerHTML = `<div class="error">加载失败，请刷新重试</div>`;
  }
};
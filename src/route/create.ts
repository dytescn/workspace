// create_project.ts
import { create_project_tpl } from "../view/create.ts";
import { insertProject } from "../apis/projects.ts";
import { generateUUID } from "../utils/uuid.ts";

export const create_project = () => {
  const popup_node = document.getElementById("popup");
  if (popup_node) {
    popup_node.innerHTML = create_project_tpl;
    cancel_project(popup_node);
    submit_project(popup_node);
  }
};

const cancel_project = (node: HTMLElement) => {
  const cancel_btn = node.querySelector("#cancel");
  if (cancel_btn) {
    cancel_btn.addEventListener("click", () => {
      node.innerHTML = "";
    });
  }
};

const submit_project = (node: HTMLElement) => {
  const submit_btn = node.querySelector("#define");
  if (submit_btn) {
    submit_btn.addEventListener("click", async () => {
      const input = node.querySelector("#name_dom input") as HTMLInputElement;
      const name = input?.value?.trim();
      const errorTip = node.querySelector("#name_dom .error-tip") as HTMLElement;

      errorTip.textContent = "";
      errorTip.className = "error-tip";

      if (!name) {
        errorTip.textContent = "请输入项目名称";
        errorTip.classList.add("error");
        return;
      }

      const uuid = generateUUID();

      try {
        const result = await insertProject({ uuid, name });
        if (result && result.code === 200) {
          node.innerHTML = "";
          // 刷新当前页面（URL 保持不变）
          globalThis.location.reload();
        } else {
          errorTip.textContent = "创建失败: " + (result?.msg || "未知错误");
          errorTip.classList.add("error");
        }
      } catch (error: any) {
        errorTip.textContent = "请求失败: " + error.message;
        errorTip.classList.add("error");
      }
    });
  }
};
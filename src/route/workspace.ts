import { workspace_tpl } from "../view/app.ts";
export const workspace_init = () => {
  const workspace_node = document.getElementById("app") as HTMLElement;
  if (!workspace_node) {
        return;
  }
  workspace_node.innerHTML = workspace_tpl
};

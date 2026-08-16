import { app_tpl } from "../view/app.ts";
import { create_project } from "./create.ts";
export const app_init = () => {
  const app_node = document.getElementById("app") as HTMLElement;
  if (app_node) {
    app_node.innerHTML = app_tpl;
  }
  const create_btn = app_node.querySelector("#add_project") as HTMLElement;
  create_btn.addEventListener("click", create_project);
};

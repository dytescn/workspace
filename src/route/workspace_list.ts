import { workspace_design_card_tpl } from "../view/card.ts"

export const workspace_list = ()=>{
    const workspace_design_node = document.getElementById("design-files");
    if(!workspace_design_node){
        return;
    }

    workspace_design_node.innerHTML = workspace_design_card_tpl

}
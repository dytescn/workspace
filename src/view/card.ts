export const workspace_design_card_tpl = `
<% it.designfiles.forEach(function(rowitem){ %>
    <div class="vg-cards cards-content-img">
        <div class="cards-img-images" style="background-image: url('<%= rowitem.cover || '/assets/imgs/default-cover.png' %>');">
            <div class="applogo vg-avatar-bg avatar-size-sm not-bg" style="background-image: url('<%= rowitem.type_icon || '' %>');"></div>
        </div>
        <div class="cards-img-name">
            <p class="name"><%= rowitem.name %></p>
            <p class="span ">更新于：<span><%= rowitem.updated_at_display %></span></p>
        </div>
        <div class="link-button row align-center justify-center w-auto">
            <div class="row rowcolumn w-auto h-auto gap-12">
                <button class="vg-btn btn-type-info hide" fxtag="viewImage">查看视图</button>
                <button class="vg-btn btn-type-info hide" fxtag="viewSteps">查看流程</button>
            </div>
        </div>
    </div>
<% }) %>
`;
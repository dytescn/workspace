export const workspace_design_card_tpl = `
<div class="vg-cards cards-content-img" data-uuid="{{uuid}}">
    <div class="cards-img-images" style="background-image: url('{{coverUrl}}');">
        <div class="applogo vg-avatar-bg avatar-size-sm not-bg" style="background-image: url('{{type}}');"></div>
    </div>
    <div class="cards-img-name">
        <p class="name">{{name}}</p>
        <p class="span mb-2">创建人：<span>{{createName}}</span></p>
        <p class="span ">更新于：<span>{{time}}</span></p>
    </div>
	<div class="link-button row align-center justify-center w-auto">
		<div class="row rowcolumn w-auto h-auto gap-12">
			<button class="vg-btn btn-type-info hide" fxtag="viewImage">查看视图</button>
			<button class="vg-btn btn-type-info hide" fxtag="viewSteps">查看流程</button>
		</div>
	</div>
</div>
`
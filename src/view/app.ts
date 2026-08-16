export const app_tpl = `
<div class="vg-mains flex1 row" id="main">
   <div class="pages-project-myproject row rowcolumn flex1">
       <div class="row align-center prow-16 pcol-20 color-gray-800 h-60">
           <h5 class="h5 flex1 font-weight-lg text-left">所有项目</h5>
              <div class="row align-center w-auto gap-12">
                 <div class="vg-dropdowns-modules dropdowns-width-lg" id="select_manage">
                    <div class="vg-dropdowns-title" id="select_title">
                        <button class="vg-btn btn-block btn-size-sm">
                           <p class="mr-4 flex1 text-overflow">全部分类</p><i class="vg-icon ic-down"></i>
                        </button>
                     </div>
                     <ul class="vg-dropdowns-content hide"></ul>
                  </div>
                  <div class="vg-searchs searchs-size-sm">
                     <div class="search-icons">
                       <i class="vg-icon ic-search"></i>
                     </div>
                     <input placeholder="搜索项目" id="search_manage">
                  </div>
                  <div class="vg-dropdowns-title">
                      <button class="vg-btn btn-block btn-size-sm">
                        <p class="mr-4 flex1 text-overflow">已归档</p>
                      </button>
                   </div>
                 </div>
                 <div class="vg-paginations" id="member_pagination"></div>
               </div>
               <div class="vg-card-tables row rowcolumn flex1 bg-gray-50 gap-10">
                 <div class="pages-project-module row rowcolumn flex1 bg-white pcol-16 pb-16 border-radius-lg">
                   <div class="pages-project-body row rowcolumn flex1" id="project_all">
                      <div class="pages-project-addproject vg-card" id="add_project">
                      <div class="addproject-container">
                      <i class="vg-icon ic-plus"></i>
                      <p class="text mt-8">创建项目</p>
                      </div>
                    </div>
                </div>
           </div>
      </div>
  </div>
</div>
`;

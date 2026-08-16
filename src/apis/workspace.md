type Project  {
	UUID                 string    `json:"uuid" gorm:"comment:'编号'"`
	OrganUID             string    `json:"ouid" gorm:"column:organ_uid;comment:'所属组织uid'"`
	CreateBy             string    `json:"create_by" gorm:"column:create_by;comment:'项目创建人'"`
	ProTplUID            string    `json:"pro_tpl_uid" gorm:"column:pro_tpl_uid;comment:'项目模板uid'"`
	Cover                string    `json:"cover" gorm:"column:cover;comment:'封面'"`
	Name                 string    `json:"name" gorm:"column:name;comment:'名称'"`
	Description          string    `json:"description" gorm:"column:description;comment:'描述'"`
	Order                int       `json:"sort" gorm:"column:sort;comment:'排序'"`
	Schedule             string    `json:"schedule" gorm:"comment:'进度'"`
	Private              int       `json:"private" gorm:"comment:'是否私有'"`
	Archive              int       `json:"archive" gorm:"default:2;comment:'是否归档,1为归档2未归档'"`
	Archive_time         time.Time `json:"archive_time" gorm:"default:null;comment:'归档时间'"`
	OpenBeginTime        time.Time `json:"open_begin_time" gorm:"default:null;comment:'是否开启任务开始时间'"`
	Open_task_private    time.Time `json:"open_task_private" gorm:"default:null;comment:'是否开启新任务默认开启隐私模式'"`
	BeginTime            time.Time `json:"begin_time" gorm:"default:null;comment:'项目开始日期'"`
	EndTime              time.Time `json:"end_time" gorm:"default:null;comment:'项目截止日期'"`
	RecycleTime          time.Time `json:"recycle_time" gorm:"default:null;comment:'回收时间'"`
	IsRecycle            int       `json:"is_recycle" gorm:"default:2;comment:'是否已回收1 为未回收2为回收'"`
	IsFollow             int       `json:"is_follow" gorm:"-"` // 1为已关注，0为未关注
	Auto_update_schedule int       `json:"auto_update_schedule" gorm:"comment:'自动更新项目进度'"`
}

type ProjectFeatures struct {
	UUID        string `json:"uuid" gorm:"comment:'编号'"`
	ProUID      string `json:"pro_uid" gorm:"comment:'项目编号'"`
	Name        string `json:"name" gorm:"comment:'名称'"`
	Description string `json:"description" gorm:"comment:'描述'"`
}

type ProjectVersion struct {
	UUID            string     `json:"uuid" gorm:"comment:'编号'"`
	Name            string     `json:"name" gorm:"comment:'名称'"`
	Description     string     `json:"description" gorm:"comment:'描述'"`
	StartTime       time.Timer `json:"start_time" gorm:"comment:'开始时间'"`
	PublishTime     time.Timer `json:"publish_time" gorm:"comment:'发布时间'"`
	PlanPublishTime time.Timer `json:"plan_publish_time" gorm:"comment:'计划发布时间'"`
	Schedule        int        `json:"schedule" gorm:"comment:'进度百分比'"`
	Status          int        `json:"status" gorm:"comment:'状态.0:未开始 2:延期发布 3:已发布 '"`
	FeaturesUID     string     `json:"features_uid" gorm:"comment:'版本库编号'"`
}

type ProjectVersionLog struct {
	UUID        string `json:"uuid" gorm:"comment:'编号'"`
	StaffUID    string `json:"staff_uid" gorm:"comment:'员工uid'"`
	Content     string `json:"content" gorm:"comment:'操作内容描述'"`
	Remark      string `json:"remark" gorm:"comment:'日志描述'"`
	LogType     string `json:"log_type" gorm:"comment:'操作类型'"`
	TaskUID     string `json:"task_uid" gorm:"comment:'task_uid'"`
	PROUID      string `json:"项目id" gorm:"comment:'项目id'"`
	FeaturesUid string `json:"features_uid" gorm:"comment:'版本库编号'"`
}

type ProjectLog struct {
	UUID       string `json:"uuid" gorm:"comment:'编号'"`
	PROUID     string `json:"项目id" gorm:"comment:'项目id'"`
	TaskUID    string `json:"task_uid" gorm:"comment:'任务uid'"`
	StaffUID   string `json:"staff_uid" gorm:"comment:'员工id'"`
	Content    string `json:"content" gorm:"comment:'操作内容'"`
	Remark     string `json:"remark" gorm:"comment:'备注'"`
	LogType    string `json:"log_type" gorm:"comment:'日志类型'"`
	ActionType string `json:"action_type" gorm:"comment:'场景类型'"`
	ToStaffUID string `json:"to_staff_uid" gorm:"comment:'员工uid'"`
	IsComment  int    `json:"is_comment" gorm:"comment:'是否是评论'"`
}
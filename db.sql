
create database if not exists itschool default charset utf8 collate utf8_unicode_ci;


use itschool;


-- -----------------------------------------------------
-- 系统通用配置相关
-- -----------------------------------------------------
drop table if exists `syscnf`;
create table `syscnf`(
	`id` int not null primary key,
	`intv0` int not null default 0,
	`intv1` int not null default 0,
	`strv0` varchar(8192) not null default '',
	`strv1` varchar(8192) not null default ''
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `admin_users` 管理后台-用户表
-- -----------------------------------------------------
drop table if exists admin_users;
create table admin_users(
	`uid` varchar(128) not null primary key,-- 用户名
	`pass` varchar(255) not null default '',-- 密码
	`cdate` bigint not null default 0,-- 创建时间
	`lstlogin` bigint not null default 0,-- 最后登录时间
	`state` tinyint not null default 1-- 用户状态：1.可用(默认) 0.不可用
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;
insert into admin_users values('root', 'F83EBAED9633F0DD6BDA1638A953710ED3C66671', 20180618204758, 20180618204758, 1);


-- -----------------------------------------------------
-- Table `admin_permissions` 管理后台-权限表
-- -----------------------------------------------------
drop table if exists admin_permissions;
create table admin_permissions(
    `name` varchar(128) not null primary key, -- 权限名称
    `info` varchar(512) not null default '' -- 说明
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `admin_roles` 管理后台-角色表
-- -----------------------------------------------------
drop table if exists admin_roles;
create table admin_roles(
    `name` varchar(128) not null primary key, -- 角色名称
    `info` varchar(512) not null default '' -- 说明
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;



-- -----------------------------------------------------
-- Table `admin_role_permission` 管理后台-角色与权限对应表
-- -----------------------------------------------------
drop table if exists admin_role_permission;
create table admin_role_permission(
    `role_name` varchar(128) not null, -- 角色名称
    `permission_name` varchar(128) not null default '', -- 权限名称
    primary key (`role_name`, `permission_name`)
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;



-- -----------------------------------------------------
-- Table `admin_role_user` 管理后台-角色与用户对应表
-- -----------------------------------------------------
drop table if exists admin_role_user;
create table admin_role_user(
    `role_name` varchar(128) not null, -- 角色名称
    `user_name` varchar(128) not null default '', -- 用户名称
    primary key (`role_name`, `user_name`),
    CONSTRAINT `fk_username_adminusers_uid` FOREIGN KEY (`user_name`) REFERENCES `admin_users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `users` 用户表
-- -----------------------------------------------------
drop table if exists users;
create table `users` (
  `plat` smallint NOT NULL, -- 平台ID。1:QQ；2:微信
  `openid` varchar(128) NOT NULL, -- 平台分配的OpenID,
  `id` int not null default 0, -- 由系统生成的唯一识别码，最小是1000，用来做“邀请”等行为。
  `beinvite` int not null default 0, -- 是被谁邀请的。没果没有邀请人，则默认为0
  `nname` varchar(128) NOT NULL DEFAULT '', -- 用户昵称，不可重复
  `avatar` varchar(512) NOT NULL DEFAULT '', -- 用户头像URL,
  `ctime` bigint NOT NULL DEFAULT 0, -- 创建时间, yyyyMMddhhmmss
  `lstlogin` bigint NOT NULL DEFAULT 0, -- 最后登录时间', yyyyMMddhhmmss
  `sitename` varchar(32) NOT NULL DEFAULT '', -- 主页名，只可是英文字符和数字，不可重复
  `sitetit` varchar(128) NOT NULL DEFAULT '', -- 主页标题
  `coin` int NOT NULL DEFAULT 0, -- 账户余额，可提现
  `state` tinyint not null default 1, -- 状态，1:可用（默认）；0:不可用
  unique index `users_nname_idx` (`nname`),
  unique index `users_sitename_idx` (`sitename`),
  unique index `users_id_idx` (`id`),
  index `users_state_idx` (`state`),
  index `users_beinvite_idx` (`beinvite`),
  PRIMARY KEY (`plat`, `openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `speeches` 文章（课程、Blog、作品）
-- -----------------------------------------------------
drop table if exists speeches;
create table speeches(
	`id` int not null primary key auto_increment, -- 主键，自增
	`uid` smallint not null, -- 用户唯一ID
    `ty` smallint not null default 0, -- 种类。0:未定义；1:课程；2:blog；3:作品
	`tit` varchar(128) not null default '', -- 课程名称
	`kind` smallint not null default 0, -- 如果是课程和Blog，则这里　0:原创；1:转载；3:翻译。否则无意义
    `img` varchar(512) not null default '', -- 如果是课程或作品，这里是图标URL，否则无意义
	`cate` smallint not null default 0, -- 类别，对应 SiteConfig.js 中的 cate
	`subcate` smallint not null default 0, -- 子类别，对应:SiteConfig.js 中的 cate -> subcate
	`freen` smallint not null default 0, -- 如果是课程，则这里表示前多少章免费。否则此字段为0，无意义
	`content` longtext not null, -- 如果是课程，则这里是课程简介（前言）；如果是Blog，则这里是Blog的正文；如果是作品，则这里是作品的描述
	`state` smallint not null default 1, -- 状态。1:正常；2:删除；3:
	`surl` varchar(512) not null default '', -- 如果是课程或Blog，并且是转载，则此字段用来存源URL。如果是作品，则此字段用来存作品的URL
	`sauthor` varchar(128) not null default '', -- 如果是转载，此字段用来存源作者名
	`ssite` varchar(128) not null default '', -- 如果是转载，此字段用来存源网站名
	`idx` int not null default 0, -- 排序字段，值越大越靠前
	`cdate` bigint not null default 0, -- 创建时间。yyyyMMddhhmmss
	`ldate` bigint not null default 0, -- 最后编辑时间。yyyyMMddhhmmss
	`liken` int not null default 0, -- 被“赞”的次数（含在章节上的“赞”）
	`likenlst` int not null default 0, -- 最近（一周）被“赞”的次数（含在章节上的“赞”）
	`rewardn` int not null default 0, -- 被“打赏”的次数（含在章节上的“打赏”）
	`rewardnlst` int not null default 0, -- 最近（一周）被“打赏”的次数（含在章节上的“打赏”）
	`rewardm` int not null default 0, -- 被“打赏”的金额累计（含在章节上的“打赏”）
	`rewardmlst` int not null default 0, -- 最近（一周）被“打赏”的金额累计（含在章节上的“打赏”）
	index `courses_uid_state_ty_idx` (`uid`, `state`, `ty`),
	index `courses_idx_idx` (`idx`)
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `course_chapter` 课程章节
-- -----------------------------------------------------
drop table if exists course_chapter;
create table course_chapter(
	`id` int not null primary key auto_increment, -- 主键，自增
	`parentid` int not null default 0, -- 上一级章节的ID。如果为0，表示是根章节
	`courseid` int not null, -- 所属课程的ID
    `tit` varchar(128) not null default '', -- 章节标题
	`content` longtext not null, -- 章节内容
	`state` smallint not null default 1, -- 状态。1:正常；2:删除；3:未发布
    `idx` int not null default 0, -- 排序字段，值越大越靠前
	`cdate` bigint not null default 0, -- 创建时间。yyyyMMddhhmmss
	`ldate` bigint not null default 0, -- 最后编辑时间。yyyyMMddhhmmss
	`liken` int not null default 0, -- 被“赞”的次数（含在章节上的“赞”）
	`likenlst` int not null default 0, -- 最近（一周）被“赞”的次数（含在章节上的“赞”）
	`rewardn` int not null default 0, -- 被“打赏”的次数（含在章节上的“打赏”）
	`rewardnlst` int not null default 0, -- 最近（一周）被“打赏”的次数（含在章节上的“打赏”）
	`rewardm` int not null default 0, -- 被“打赏”的金额累计（含在章节上的“打赏”）
	`rewardmlst` int not null default 0, -- 最近（一周）被“打赏”的金额累计（含在章节上的“打赏”）
	index `coursechapter_courseid_state_idx` (`courseid`, `state`),
	index `coursechapter_idx_idx` (`idx`),
	index `coursechapter_parentid_state_idx` (`parentid`, `state`)
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `userlog` 用户行为相关的记录，“赞”、“打赏”、“收藏”、“购买”的记录
-- -----------------------------------------------------
drop table if exists userlog;
create table userlog(
	`uid` smallint not null, -- 用户唯一ID
	`y` smallint not null, -- 日期-年，yyyy
	`m` smallint not null, -- 日期-月
	`d` smallint not null, -- 日期-日
    `h` smallint not null, -- 日期-时
	`ty` smallint not null default 0, -- 0:赞；1:打赏；2:收藏；3:交年费；4:拜师费；
	`toty` smallint not null default 0, -- 0:未定义；1:课程；2:blog；3:作品
    `toid` int not null, -- 如果目标是课程，则此字段表示课程的ID；如果目标是blog，则此字段表示blog的ID；如果目标是作品，则此字段表示作品的ID；如果是交年费，则表示用户是在此目标上交年费的；
	`tosubid` int not null, -- 如果目标是课程，则此字段表示章节的ID，如果是在目录上操作，则此字段为0；如果目标是blog或作品，则此字段为0；如果是交年费，则表示用户是在此目标上交年费的；
    `val` int not null default 0, -- 如果是“赞”，则此字段无意义；如果是“打赏”，则此字段表示打赏金额；如果是“交年费”，则此字段表示所交的金额；如果是“拜师”，则此字段表示拜师所交的金额；
    `intv0` int not null default 0, -- 保留字段。如果是“拜师”，则此字段表示被拜师者的唯一ID；
    `strv0` varchar(2048) not null default '', -- 保留字段
	`cdate` bigint not null default 0, -- 时间。yyyyMMddhhmmss
    primary key (`uid`, `y`, `m`, `d`, `ty`, `toty`, `toid`, `tosubid`),
    index `userlog_y_m_d_ty_toty_toid_tosubid_idx` (`y`, `m`, `d`, `ty`, `toty`, `toid`, `tosubid`),
	index `userlog_ty_toty_toid_tosubid_idx` (`ty`, `toty`, `toid`, `tosubid`)
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `speeche_tag` 文章（课程章节、Blog、作品）与标签的对应表
-- -----------------------------------------------------
drop table if exists speeche_tag;
create table speeche_tag(
    `spid` int not null, -- 文章（课程章节、Blog、作品）的ID。如果是课程章节，则与表 course_chapter 中的 id 对应，如果是Blog或作品，则与表 speeches 中的 id 对应
    `parentid` int not null default 0, -- 如果是课程章节，则这里存的是所属课程的ID；如果是Blog，则此字段无意义
    `tag` int not null default 0, -- 对应 SiteConfig.js 中的 cate -> tags
    primary key (`spid`, `parentid`),
    index `speechetag_tag_idx` (`tag`)
) engine=InnoDB default charset=utf8 collate=utf8_unicode_ci;
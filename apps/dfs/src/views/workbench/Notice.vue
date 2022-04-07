<template>
  <div class="notice g-panel-container ws-main-container fs-8" v-if="$route.query.id == 8">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>Tapdata Cloud 1.0.9 版本发布啦！</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2021-12-21</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-3">
          Tapdata Cloud 是国内首家异构数据库实时同步云平台，目前支持Oracle、MySQL、PG、SQL Server、MongoDB、ES
          、达梦、Kafka、GP、MQ、ClickHouse、Hazelcast Cloud、ADB MySQL、ADB
          PostgreSQL、KunDB、TiDB、Dummy之间的数据同步，即将支持 DB2、Sybase ASE、Redis、GBase、GaussDB
          等，并对用户永久免费。
        </div>
        <div class="mb-3">
          完美支持SQL->NOSQL，拖拽式的“零”代码配置操作、可视化任务运行监控，强大的数据处理能力，Tapdata Cloud
          让您轻松实现跨系统跨类型的数据同步和交换，释放数据准备阶段的精力。
        </div>
        <div class="mb-3">
          近日，Tapdata Cloud 发布1.0.9 版本，新增2个数据源支持，并结合用户反馈进行了多处功能增强和优化。
        </div>
        <div class="mb-3 fw-bolder">1. 上新TiDB 等2个数据源</div>
        <div class="mb-3">1.0.9 版本新增TiDB 作为同步目标，并支持Dummy 作为数据源。</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_01.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">2. 不断优化，提供更佳体验</div>
        <div class="mb-3">在创建连接时，用户可以选择连接类型</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_02.png" alt="" />
        </div>
        <div class="mb-3">本次新增日志过滤筛选功能，用户可以通过日志过滤筛选</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_03.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">3. 支持批量操作、体验更佳</div>
        <div class="mb-3">字段映射部分，表名、字段名和大小写设置支持用户批量调整，简单快捷，极大提高了处理效率。</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_04.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">4. 多维度统计，更直观了解任务进度</div>
        <div class="mb-3">1.0.9 版本对数据库同步任务详情进行了优化，用户可以看到同步的进度，同步进程一目了然。</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_05.png" alt="" />
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 9">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>升级公告！</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-01-20</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-6">尊敬的用户朋友：</div>
        <div class="mb-2">
          您好！为了进一步提高服务质量，Tapdata Cloud 将于2022年1月20号（本周四）19点至22点进行升级
        </div>
        <div class="mb-2">
          升级期间可能会影响访问控制台、创建任务等操作，不影响已在运行状态的任务，升级完成后恢复正常使用。
        </div>
        <div class="mb-10">以上升级如带来不便请您谅解，并提前做好准备，如有疑问可联系我们。</div>
        <div class="">2022年1月20日</div>
        <div class="">Tapdata Cloud 团队</div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 10">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>Tapdata Cloud 开年版本更新：细节控福利！数据源又新增，支持增量任务自定义采集「开始时刻」</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-02-12</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">开年又逢更新，优化一刻不停——Tapdata Cloud 新版本发布啦！</div>
        <div class="mb-4">
          此次发布的 2.0.1
          版，在数据源上新之余，针对实际操作过程中的诸多细节再做优化，进一步提升了其易用性和操作的便捷性。
        </div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">更新速览👇</div>
          <div class="ml-2 mb-4">
            1. 支持<span class="fw-bold font-color-main">设置增量采集时间点</span>，增量任务可以自定义采集开始时刻
          </div>
          <div class="ml-2 mb-4">
            2. 支持数据源再上新，数据连接<span class="fw-bold font-color-main">新增 MariaDB 支持</span>
          </div>
          <div class="ml-2 mb-4">3. 细节更新：优化了编辑「已运行任务」的弹窗提示，避免误操作</div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>支持设置增量采集时间点</strong>
            </div>
            <div class="number-title-box__desc">功能升级 操作更灵活</div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          针对历史版本中，设置增量任务时无法指定时间，默认从“当前时间”开始增量数据采集的问题，现已做出优化——新版本下，增量任务可以自定义增量采集时间点。打开增量任务设置，即可手动添加“增量采集开始时刻”，满足真实业务场景下的操作需求，专注使用体验的不断优化。
        </div>
        <div class="mb-4 line-height-2">
          如果你的全量+增量任务在进入增量阶段后出现异常，导致任务停止，可以编辑任务，将任务的同步类型改为【增量同步】，然后将【增量采集开始时刻】设置为任务停止时所处于的增量时间点，再继续运行任务。无需再重新跑一次全量即可实现数据的无缝衔接，保证数据的完整性。
        </div>
        <div>
          <img src="../../../public/images/notice/task_create.gif" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/task_setting_cdc_time.png" alt="" />
        </div>
        <div class="mb-4 line-height-2">
          目前，该优化已覆盖包括 MySQL、SQL Server、Oracle，以及 MongoDB
          在内的多个数据库。针对其他数据库的支持，后续也将陆续开放，敬请期待。
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>数据源再上新</strong>
            </div>
            <div class="number-title-box__desc">
              <p>MariaDB现已加入Tapdata Cloud</p>
              <p class="mt-3">异构数据库实时同步家族</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          作为国内首家异构数据库实时同步云平台，Tapdata Cloud
          打破系统和数据类型限制，支持多样化的数据源、拖拽式的“零”代码配置操作，以强大的数据处理能力，真正做到轻松实现跨系统跨类型的数据同步和交换，让你能够释放数据准备阶段的精力，更专注数据业务的开发与创新。
        </div>
        <div class="mb-4 line-height-2">
          本次更新中，数据连接新增 MariaDB 支持，可支持的数据源版图再增一块。看，这都是 Tapdata Cloud 为你“打”下的江山：
        </div>
        <div>
          <img src="../../../public/images/notice/connection_selector.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>细节优化</strong>
            </div>
            <div class="number-title-box__desc">
              <p>微小但贴心 使用更安心</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          用户导向，细节至上——这一次，我们优化了针对已运行任务进行编辑的弹窗提示。叮咚，前方为已运行任务，如果修改任务设置，提交后必须重置才能正常运行，请谨慎操作哦。
        </div>
        <div>
          <img src="../../../public/images/notice/task_edit_pop.gif" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/task_edit_pop_content.png" alt="" />
        </div>
        <div class="line-height-2">
          重视成长路上收获的每一条反馈，不断完善，持续优化，Tapdata一直在路上。使于细节，成于大美，期待下一个新版本再和大家见面图片
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />。
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 11">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>Tapdata Cloud 2.1.0 来了：最新支持阿里云数据库接入，Windows版本操作更轻量，使用体验全面升级！</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-02-28</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">
          此次发布的 2.1.0 版又有大动作：正式开始接入云数据库，优化 Windows
          版本操作流程，沿着真实使用环境下的切实需求点，全面升级用户体验。
        </div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">更新速览👇</div>
          <div class="ml-2 mb-4">
            1. 数据连接上新，<span class="fw-bold font-color-main">开始支持云数据库接入</span>，本轮新增 Aliyun
            MariaDB、Aliyun MongoDB、Aliyun RDS for SQLServer、Aliyun RDS for PG、Aliyun RDS for MySQL 作为源和目标；
          </div>
          <div class="ml-2 mb-4">
            2.
            <span class="fw-bold font-color-main">优化 Windows 版本打包和安装流程</span>，流程更清晰，部署操作更简洁；
          </div>
          <div class="ml-2 mb-4">
            3.
            <span class="fw-bold font-color-main">新增用户中心模块</span
            >：支持修改注册初始信息，包括对昵称、头像、密码、企业信息的编辑，以及手机号、邮箱的新增绑定和切换；
          </div>
          <div class="ml-2 mb-4">
            4.
            <span class="fw-bold font-color-main">新增任务数据可视化模块</span
            >：用户工作台可见「任务每日数据量趋势图」➕「累计数据量图」
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>开始支持云数据库接入</strong>
            </div>
            <div class="number-title-box__desc">数据连接又上新 千呼万唤「云」来了</div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          作为国内首家异构数据库实时同步云平台，Tapdata Cloud
          不断拓展能够支持的数据连接版图，力求满足用户的多样化数据源和目标需求，真正实现数据实时同步“全面破壁”。
        </div>
        <div class="mb-4 line-height-2">
          面对大量用户对于连接云数据库的迫切需求，Tapdata Cloud 优先响应。本次更新中，新增支持 Aliyun MariaDB、Aliyun
          MongoDB、Aliyun RDS for SQLServer、Aliyun RDS for PG、Aliyun RDS for MySQL 作为源和目标。放大就看 Tapdata
          Cloud “破壁行动”最新战绩 👇：
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_01.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>Windows 版本流程优化</strong>
            </div>
            <div class="number-title-box__desc">
              <p>「傻瓜模式」再升级 安装部署更高效</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">Tapdata Cloud 的安装部署简单易上手？我们还可以更简单👉</div>
        <div class="mb-4 line-height-2">本次更新重点针对 Windows 版本操作流程再优化：</div>
        <div class="mb-4 line-height-2">在 Agent 部署方式方面：用户下载 Agent 安装包后，双击执行即可完成安装部署</div>
        <div class="mb-4 line-height-2">
          在安装过程中：新版本会自动检测用户的 Java 环境，如果用户的 Java 环境不满足运行需要，会自动下载 JRE
          使用，无需再提前进行 Java 环境配置。（*手动划重点：下载的 JRE 对客户环境<span class="color-danger"
            >无任何侵入</span
          >）
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_02.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>新增「用户中心」页面</strong>
            </div>
            <div class="number-title-box__desc">
              <p>你的个性化设置新功能已上线</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          想要自主修改注册初始信息、设置头像/昵称/密码，或是需要绑定新的手机号和邮箱的伙伴们，入口来啦！鼠标悬停于右上角个人账号处，下拉菜单内选中【用户中心】标签，点击即可进入个人及企业信息编辑界面。
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_003.gif" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_004.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">04</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>新增任务数据量统计图表展示</strong>
            </div>
            <div class="number-title-box__desc">
              <p>因为可视 所以更清晰</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          这一次，我们还在【用户工作台】底部新增了「每日数据量趋势图」和「累计数量图」。可以点击进入工作台后下滑查看自己的任务数据统计——一表直览，让你的任务更清晰。
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_005.gif" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_006.png" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_007.png" alt="" />
        </div>
        <div class="line-height-2">
          重视成长路上收获的每一条反馈，不断完善，持续优化，Tapdata一直在路上。始于细节，成于大美，期待下一个新版本再和大家见面
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />。
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 12">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span
          >新增腾讯云数据库连接，任务可定时发布，重新校验可指定表单——以用户体验为先的 Tapdata
          Cloud，又对功能细节下手了</span
        >
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-03-11</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">需求持续更新，优化一刻不停——Tapdata Cloud 3 月版本又更新啦！</div>
        <div class="mb-4">
          最新发布的 2.1.1
          版中，腾讯云数据库连接上新，再次拓宽云数据库接入面之余，秉承用户体验优先的迭代导向，重点拔除了三颗既往使用过程中容易踢到的“小钉子”。
        </div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">更新速览👇</div>
          <div class="ml-2 mb-4">
            1.<span class="fw-bold font-color-main">数据连接上新，云数据库接入再添新</span>：此番增加了 TencentDB for
            MySQL、TencentDB for MariaDB、TencentDB for PG、TencentDB for SQLServer，以及 TencentDB MongoDB
            作为源和目标；
          </div>
          <div class="ml-2 mb-4">
            2.
            <span class="fw-bold font-color-main">开始支持任务「定时发布」</span
            >：【全量】任务可以指定「执行周期」，【全量+增量】&【增量】任务亦可设置「计划运行时间」，1
            秒解放打工人，非工作时间不苦等；
          </div>
          <div class="ml-2 mb-4">
            3.
            <span class="fw-bold font-color-main">开始支持指定单表或多个表「重新校验」</span
            >：数据校验环节，可以单独对校验不一致的表发起重新校验，不必从头来过，大量数据、多个表也不怕；
          </div>
          <div class="ml-2 mb-4">
            4.
            <span class="fw-bold font-color-main">字段映射过程中支持修改单个表名</span
            >：在原有的批量改表名基础上，新增针对单个表名的修改，实现改表名自由，操作更顺手。
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>云数据库接入再上新</strong>
            </div>
            <div class="number-title-box__desc">版图又见新貌，腾讯云数据库现已入驻</div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          作为国内首家异构数据库实时同步云平台，Tapdata Cloud
          不断拓展能够支持的数据连接版图，力求满足用户的多样化数据源和目标需求，真正实现数据实时同步“全面破壁”
        </div>
        <div class="mb-4 line-height-2">
          继 2.1.0 版本首次实现云数据库接入，Tapdata Cloud 持续发力，本次更新中云数据库再下五城，新增支持 TencentDB for
          MySQL、TencentDB for MariaDB、TencentDB for PG、TencentDB for SQLServer、TencentDB MongoDB 作为源和目标，
          <span class="fw-bold font-color-main"
            >数据源据点数量扩张至<span class="fs-6" style="font-family: DIN; color: rgb(0, 122, 181)">28</span></span
          >
          。放大就看 Tapdata Cloud “破壁行动”最新战绩 👇：
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_01.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>Hi，你的任务已定时发布</strong>
            </div>
            <div class="number-title-box__desc">
              <p>不被动加班，从自主设置「执行周期」和「运行」时间做起</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">还在为需要在非工作时间启动任务而郁闷吗？</div>
        <div class="mb-4 line-height-2">还在为需要周而复始地手动启动周期性全量任务而头疼吗？</div>
        <div class="mb-4 line-height-2">——你想要的「任务定时发布」功能已上线。</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_02.gif" alt="" />
        </div>
        <div class="my-4 fs-6" style="color: rgb(0, 122, 181)">【全量+增量】及【增量】任务可以指定「启动时间」</div>
        <div class="mb-4 line-height-2">
          针对【全量+增量】以及【增量】任务，任务属性设置里新增【计划运行时间】设置，该设置默认关闭，可以根据实际需要选择是否启用。
        </div>
        <div class="mb-4 line-height-2">
          具体流程：打开设置，显示时间选择控件→按需选择计划运行时间，可选时间为：[当前时间，+∞)→完成其他设置并保存任务→任务在指定时间触发启动并运行
          <span class="color: rgb(136, 136, 136);"
            >（*手动划重点：如果【任务保存时间】≥【计划运行时间】，则设置成功保存的同时，任务就会启动，<span
              style="color: rgb(255, 76, 0)"
              >保存前请务必仔细检查时间设置是否有误</span
            >）</span
          >
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_03.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">打开设置</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_04.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">选择运行时间</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_05.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">设置时间前，任务未启动</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_06.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">设置时间到，任务启动</div>
        <div class="my-4 fs-6" style="color: rgb(0, 122, 181)">【全量】任务可以指定「运行周期」</div>
        <div class="mb-4 line-height-2">
          针对【全量】任务，任务属性设置里新增【定期调度任务】设置，该设置同样默认关闭，也是按需选择开启。
        </div>
        <div class="mb-4 line-height-2">
          具体流程：打开设置，显示【调度表达式】输入框→帮助图标悬停，显示cron表达式的输入帮助和样例→按照指引，依据实际需求填写任务周期→完成其他设置并保存任务→任务按照设置的固定时间、日期、间隔稳定运行
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_07.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">打开设置</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_08.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">指路输入框后方，可见调度表达式填写指引</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_09.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">示例：设置调度周期为每五分钟运行一次</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_10.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">任务未启动</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_11.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">任务第一次启动</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_12.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">任务再次启动</div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>支持对指定表发起重新校验</strong>
            </div>
            <div class="number-title-box__desc">
              <p>只有个别表校验不一致？现在可以划定小范围重新校验了！</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          📣从这一版开始，碰上数据校验不一致的问题时，就无需再重新执行整个校验任务啦！
        </div>
        <div class="mb-4 line-height-2">
          新版本支持在数据校验结果页面，从当前执行结果中选择其中一个或多个表再次启动数据校验任务，任务执行状态和结果会直接更新当前校验结果。重来bye
          bye，效率high high~
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_13.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">04</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>字段映射时支持修改单个表名</strong>
            </div>
            <div class="number-title-box__desc">
              <p>打破局限，更多便捷</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          Tapdata Cloud 2.1.1
          针对历史版本中“仅支持表名批量更改”的功能在实际操作环境中的局限性，从用户真实需求出发，在原有「批量改表名」功能的基础上，新增「单个表名修改」能力。
        </div>
        <div class="mb-4 line-height-2">新功能下，用户可以：</div>
        <ul class="pl-8">
          <li class="mb-4 line-height-2 list-style-disc">
            在迁移过程中自由修改表名（不仅仅是前后缀），从而实现将<span class="fw-bold font-color-main">源表数据</span
            >写入<span class="fw-bold font-color-main">指定目标表</span>
          </li>
          <li class="mb-4 line-height-2 list-style-disc">
            通过修改目标表名为同一表名，从而实现将<span class="fw-bold font-color-main">多个结构相同的源表</span
            >写入<span class="fw-bold font-color-main">同一目标表</span>
          </li>
        </ul>
        <div>
          <img src="../../../public/images/notice/v2.1.1_14.png" alt="" />
        </div>
        <div class="line-height-2">
          重视成长路上收获的每一条反馈，不断完善，持续优化，Tapdata一直在路上。始于细节，成于大美，期待下一个新版本再和大家见面
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />。
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 13">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span
          >Tapdata Cloud 2.1.2 来啦：大波细节已就绪！字段类型可批量修改、支持微信扫码登录、新增支持 Vika 为目标</span
        >
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-03-30</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">需求持续更新，优化一刻不停——Tapdata Cloud 2.1.2 版来啦！</div>
        <div class="mb-4 line-height-2">
          最新发布的这一版本中，新增支持 Vika
          为目标，为快速导入数据，利用维格表实现零代码协作系统搭建“架桥”。同时继续秉承用户体验优先的迭代导向，开放支持微信扫码注册和登录，从细节处着眼，重点提升
          Tapdata Cloud 在实际操作层面的易用性。
        </div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">更新速览👇</div>
          <div class="ml-2 mb-4">
            1.<span class="fw-bold font-color-main">新增支持 Vika 为目标</span
            >：打通与「新一代团队数据协作+项目管理神器」之间的实时数据通路，助力进一步提升业务转化与协同效率；
          </div>
          <div class="ml-2 mb-4">
            2.
            <span class="fw-bold font-color-main">字段类型可批量修改</span
            >：字段映射过程新增类型批量修改能力，修改类型时可选择应用于当前任务全部表；
          </div>
          <div class="ml-2 mb-4">
            3.
            <span class="fw-bold font-color-main">扫码登录功能上线</span
            >：支持微信扫码注册和登录，一键操作，即扫即用更快捷；
          </div>
          <div class="ml-2 mb-4">
            4.
            <span class="fw-bold font-color-main">更多细节优化</span>：
            <p class="mt-2">✔️短信通知策略优化，短信通知默认关闭，可根据需要自行打开</p>
            <p class="mt-2">✔️创建连接时支持通过连接类型、连接名称，快速搜索并定位数据源和目标</p>
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>开始支持 Vika 作为目标</strong>
            </div>
            <div class="number-title-box__desc">
              <p class="mb-2">数据连接又添新成员</p>
              <p>轻量+轻量=更加易用</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          作为国内首家异构数据库实时同步云平台，Tapdata Cloud
          不断拓展能够支持的数据连接版图，力求满足用户的多样化数据源和目标需求，真正实现数据实时同步“全面破壁”。
        </div>
        <div class="mb-4 line-height-2">
          本次更新中新增的数据目标 Vika
          维格表，将底层的可视化数据库、电子表格、实时网络协同、低代码开发技术四合为一，让数据管理变得轻量化。当轻量化的异构数据实时同步工具，遇上轻量化的数据管理工具，就会在数字化新时期创造出
          1+1＞2 的效果。用户借助 Tapdata Cloud
          可以快速实现向维格表导入业务系统等数据，为更敏捷地使用维格表展开团队数据协作和项目管理提供稳定、可靠的数字基础。至此，Tapdata
          Cloud 数据连接据点数量扩张至
          <span class="fw-bold font-color-main"
            ><span class="fs-6" style="font-family: DIN; color: rgb(0, 122, 181)">29</span></span
          >
          。放大就看 Tapdata Cloud “破壁行动”最新战绩 👇：
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/01.jpg" alt="" />
        </div>
        <div class="my-4">
          另附操作演示，点击查看如何<span class="font-color-main fw-bold">将学生成绩导入 Vika</span> ：
        </div>
        <div>
          <!--<img src="../../../public/images/notice/v2.1.2/02.gif" alt="" />-->
          <video src="../../../public/images/notice/v2.1.2/demo.mp4" controls="controls"></video>
        </div>
        <div class="text-center color-disable">操作演示：将学生成绩导入 Vika</div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>支持字段类型批量修改</strong>
            </div>
            <div class="number-title-box__desc">
              <p>字段类型转换异常导致任务出错怎么办？现在可以手动修改啦！</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          Tapdata Cloud 2.1.2
          针对历史版本中，数据迁移时会遇到的因字段类型转换出现异常，而导致任务出错的问题，开始支持批量修改字段类型（修改时可选择应用于当前任务全部表），为用户提供手动修改字段类型转换映射关系的能力。
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/03.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>实现扫码注册和登录</strong>
            </div>
            <div class="number-title-box__desc">
              <p>即扫即用，快捷随心</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">账号密码容易混，短信验证还要等，想要快捷登录怎么办？</div>
        <div class="mb-4 line-height-2">
          📣从现在开始，微信扫一扫，即可开启你的 Tapdata Cloud 异构数据实时同步之旅——新版本 Tapdata Cloud
          支持新用户通过微信扫码实现一键快速注册、登录，让旅程的第一步更便捷；同时也支持老用户微信关联绑定已有账号，优化登录体验。
        </div>
        <div class="mb-4 line-height-2">
          初次扫码登录即可同步关注 Tapdata 公众号，第一时间 get 一线案例分析、新版操作指南等一手资料，热门讯息尽在掌握。
        </div>
        <div class="mb-4">
          <img src="../../../public/images/notice/v2.1.2/04.png" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/05.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">04</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>更多细节优化</strong>
            </div>
            <div class="number-title-box__desc">
              <p>微小但贴心，使用体验不断升级</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">用户导向，细节至上——这一次，我们对短信通知策略，以及连接创建过程做了优化。</div>
        <div class="mb-4 font-color-main fs-7 fw-bold"><span class="dot mr-4"></span>自助开关短信通知权限</div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/06.png" alt="" />
        </div>
        <div class="mb-4 line-height-2">
          Agent 离线提示、Agent 运行通知、任务异常告警——不想被被非必要的短信提醒频繁打扰？
        </div>
        <div class="mb-4 line-height-2">
          新版本的短信通知策略已优化，新用户短信通知将默认关闭（老用户的设置保持不变），可以根据实际需要在通知设置中，自行选择打开或保持关闭状态。
        </div>
        <div class="mb-4 font-color-main fs-7 fw-bold"><span class="dot mr-4"></span>更快定位连接类型</div>
        <div class="mb-4">
          <img src="../../../public/images/notice/v2.1.2/07.png" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/08.png" alt="" />
        </div>
        <div class="mb-4 line-height-2">
          所谓版图之大，一屏装不下，随着 Tapdata Cloud
          支持的数据连接类型不断扩展，在创建连接的过程中快速定位数据源和目标的需求也被提上了日程。
        </div>
        <div class="mb-4 line-height-2">
          新版本支持在创建连接时，通过连接类型筛选，以及连接名称模糊查询，快速搜索并定位数据源和目标——一切改变，都是为了更方便地使用。
        </div>
        <div class="line-height-2">
          重视成长路上收获的每一条反馈，不断完善，持续优化，Tapdata一直在路上。始于细节，成于大美，期待下一个新版本再和大家见面
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />。
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 14">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>Tapdata 2.1.3 来啦：新增支持 Apache Doris 为目标，任务查询更快捷！</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-04-07 21:00</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">需求持续更新，优化一刻不停——Tapdata Cloud 2.1.3 来啦！</div>
        <div class="mb-4 line-height-2">
          最新发布的版中，在新增支持 Apache Doris 为目标之余，任务日志的查询也更加人性化。
        </div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">更新速览👇</div>
          <div class="ml-2 mb-4">
            <span>1.</span
            ><span class="fw-bold font-color-main pl-1">新增支持 Apache Doris 为目标</span
            >：牵手更多优秀国产数据库，强强联手，探索新一代数据架构的更多可能；
          </div>
          <div class="ml-2 mb-4">
            <span>2.</span>
            <span class="fw-bold font-color-main pl-1">任务日志查询路径优化</span
            >：开始支持在任务运行监控页面直接导出日志，查询更快捷；
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>开始支持 Doris 为目标</strong>
            </div>
            <div class="number-title-box__desc">
              <p class="mb-2">强强联手，共建下一代数据架构</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">
          作为国内首家异构数据库实时同步云平台，Tapdata Cloud
          不断拓展能够支持的数据连接版图，力求满足用户的多样化数据源和目标需求，真正实现数据实时同步“全面破壁”。
        </div>
        <div class="mb-4 line-height-2">
          随着新兴国产数据库不断涌现，Tapdata Cloud 持续发力，与更多优质国产数据库牵手。本次更新中新增的数据目标 Apache
          Doris，同时也是近日启动的
          <ElLink
            type="primary"
            href="https://tapdata.net/tapdata-PDK-program.html?fromColId=2"
            target="_blank"
            class="fs-7 align-baseline"
            >Tapdata PDK 生态共建计划</ElLink
          >
          的首批共建伙伴之一，将与 Tapdata
          牵手，破局数据孤岛，共建下一代数据架构，为用户提供高效、统一的数据应用及分析平台。
        </div>
        <div class="mb-4 line-height-2">
          至此，Tapdata Cloud
          <span class="fw-bold font-color-main"
            >数据连接据点数量扩张至<span class="fs-6 pl-1" style="font-family: DIN; color: rgb(0, 122, 181)"
              >30</span
            ></span
          >
          。放大就看 Tapdata Cloud “破壁行动”最新战绩 👇：
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.3/01.png" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.3/02.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>任务日志查询路径优化</strong>
            </div>
            <div class="number-title-box__desc">
              <p>小优化，更贴心</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">📣从这一版开始，需要查询任务日志时，无需再回到 Agent 拉取啦！</div>
        <div class="mb-4 line-height-2">
          新版本下，当用户任务出现问题，需要查看日志定位问题时，可以直接在运行监控页面导出日志（支持选择【时间范围】），无需再返回
          Agent 部署服务器查找日志文件。操作更加人性化！
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.3/03.png" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.3/04.png" alt="" />
        </div>
        <div class="line-height-2">
          重视成长路上收获的每一条反馈，不断完善，持续优化，Tapdata一直在路上。始于细节，成于大美，期待下一个新版本再和大家见面
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notice'
}
</script>

<style lang="scss" scoped>
.notice-header {
  background: url('../../../public/images/notice/notice_title.png') no-repeat 100% / cover;
  .notice-header__title {
  }
  .notice-header__time {
    color: rgba(0, 0, 0, 0.49);
    > img {
      width: 22px;
      height: 22px;
    }
  }
}
.notice-body {
  background: #fff;
  img {
    width: 100%;
  }
  video {
    width: 100%;
  }
  .notice-body__step {
    border-bottom: 1px solid #f2f2f2;
    > div {
      margin-bottom: 16px;
      line-height: 17px;
    }
  }
  .notice-body__intro {
    > div {
      margin-bottom: 16px;
      line-height: 17px;
    }
  }
  .notice-body__intro-img {
    > img {
      width: 60%;
      max-width: 1100px;
      min-width: 667px;
    }
  }
  .QR-code {
    > img {
      width: 164px;
    }
  }
}

.ws-main-container {
  .notice-body__content {
    //width: 700px;
    .banner-box {
      text-align: center;
      //padding: 0 15%;
      background-color: rgb(22, 32, 98);
      img {
        width: 50%;
      }
    }
  }
  .line-height-2 {
    line-height: 2;
  }
}
.section-margin {
  margin: 0 15%;
}
.info-section__header {
  border-radius: 12px 12px 0 0;
  background-color: rgb(1, 121, 179);
  color: rgb(255, 255, 255);
}
.info-section__body {
  border: 1px solid rgb(1, 121, 179);
  border-radius: 0 12px 12px 12px;
  line-height: 2;
}
.activity-section {
  border-left: 2px dashed rgb(1, 121, 179);
  line-height: 2;
}
.index-section {
}
.index-section__header {
  flex-flow: row nowrap;
}
.index-section__number {
  vertical-align: top;
  width: auto;
  background-color: rgb(1, 121, 179);
  min-width: 10%;
  max-width: 100%;
  flex: 0 0 auto;
  height: 40px;
  line-height: 40px;
  align-self: stretch;
  z-index: 1;
  box-sizing: border-box;

  text-align: right;
  font-size: 22px;
  color: rgb(249, 248, 246);
  padding-right: 9px;
  padding-left: 9px;
  letter-spacing: 0px;
  //> span {
  //  text-align: right;
  //  font-size: 22px;
  //  color: rgb(249, 248, 246);
  //  padding-right: 9px;
  //  padding-left: 9px;
  //  line-height: 1;
  //  letter-spacing: 0px;
  //}
}
.index-section__slash {
  display: inline-block;
  vertical-align: top;
  width: 14px;
  background-image: linear-gradient(to right bottom, rgb(1, 121, 179) 50%, rgba(231, 34, 21, 0) 50%);
  flex: 0 0 auto;
  height: auto;
  align-self: stretch;
  line-height: 0;
  z-index: 1;
  border-width: 0px;
  box-sizing: border-box;
}
.index-section__title {
  display: inline-block;
  vertical-align: top;
  width: auto;
  flex: 100 100 0%;
  height: auto;
  align-self: stretch;
  background-color: rgb(229, 241, 247);
  margin-top: 7px;
  margin-left: -15px;
  line-height: 1;
  box-sizing: border-box;
}
.title-top {
  text-align: left;
  transform: translate3d(7px, 0px, 0px);
  margin-top: -15px;
  margin-right: 0%;
  margin-left: 0%;
  justify-content: flex-start;
  height: 16px;
  box-sizing: border-box;
}
.title-top_arrow {
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: top;
  overflow: hidden;
  border-style: solid;
  border-width: 8px;
  border-color: rgba(255, 255, 255, 0) rgba(255, 255, 255, 0) rgb(1, 121, 179);
  box-sizing: border-box;
}
.title-bottom {
  color: rgb(1, 121, 179);
  padding-right: 10px;
  padding-left: 10px;
  line-height: 2;
  letter-spacing: 1px;
}
.prize-section {
  img {
    width: 330px;
  }
}
.mode-section {
  //border-left: 1px solid rgb(1, 121, 179);
  &:not(:first-child) {
    border-left: 1px solid #0179b3;
  }
  font-size: 14px;
  color: #646464;
  overflow: hidden;
  background-image: linear-gradient(to right, rgba(255, 90, 104, 0) 0%, rgba(255, 90, 104, 0.05) 100%);
  .mode-section__connect {
    background: url('../../../public/images/notice/bg.png') 0 0 repeat;
    background-size: 3.5%;
  }
  .clear {
    clear: both;
  }
}
.mode-section__header {
  float: left;
  padding: 0 8px;
  height: 16px;
  line-height: 16px;
  font-weight: bolder;
  border-left: 16px solid rgb(1, 121, 179);
  border-right: 2px solid rgb(1, 121, 179);
  color: #333;
}
.QR-code-section {
  img {
    width: 135px;
    height: 135px;
  }
}
.number-title-box {
  text-align: center;
}
.number-title-box__number {
  color: rgb(255, 255, 255);
  text-shadow: rgb(53 119 177) 0px 1.4px, rgb(69 104 188) 1px 1px, rgb(69 104 188) 1.4px 0px, rgb(69 104 188) 1px -1px,
    rgb(69 104 188) 0px -1.4px, rgb(69 104 188) -1px -1px, rgb(69 104 188) -1.4px 0px, rgb(69 104 188) -1px 1px;
  font-size: 51px;
  font-style: italic;
}
.number-title-box__content {
  display: inline-block;
  margin-top: -16px;
  margin-bottom: 24px;
  border-top: 1px solid #3577b1;
  background: #fff;
}
.number-title-box__title {
  background: -moz-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  background: -webkit-gradient(linear, 0 0, 0 right, from(rgb(239, 158, 56)), to(rgb(51, 119, 176)));
  background: -webkit-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  background: -o-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  background: -ms-linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#ffffff',GradientType=0 );
  background: linear-gradient(to right, rgb(239, 158, 56) 0%, rgb(51, 119, 176) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 28px;
}
.number-title-box__desc {
  margin-top: 16px;
  color: #979494;
  font-size: 20px;
  font-weight: bold;
}

:root .number-title-box__title {
  filter: none;
}
.list-style-disc {
  list-style: disc;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
  background: #000;
  vertical-align: middle;
}
</style>

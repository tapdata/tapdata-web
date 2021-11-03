<template>
  <div class="notice g-panel-container ws-main-container fs-8" v-if="$route.query.id == 1">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>推荐 | 异构数据库同步云平台 Tapdata Cloud 开启有奖公测</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2021-07-31</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content">
        <div class="banner-box mb-10">
          <img src="../../../public/images/notice/top.png" alt="" />
        </div>
        <div class="info-section section-margin mb-10">
          <div class="info-section__header inline-block p-2">Tapdata Cloud 介绍</div>
          <div class="info-section__body p-3 fs-7">
            Tapdata Cloud 是 Tapdata「深圳钛铂数据有限公司 」自研的国内首个
            <span class="fw-bolder">异构数据库实时同步云平台</span>
            ，目前支持 Oracle、MySQL、PostgreSQL、SQL Server、MongoDB、Elasticsearch 之间的数据迁移和同步，即将支持
            DB2、Sybase ASE、Redis、Kafka、GBase、GaussDB 等。Tapdata Cloud 将以
            <span class="fw-bolder">永久免费</span>
            的形式提供给所有开发者和企业使用。
          </div>
        </div>
        <div class="index-section section-margin mb-3">
          <div class="index-section__header flex">
            <div class="index-section__number">01</div>
            <div class="index-section__slash"></div>
            <div class="index-section__title">
              <div class="title-top">
                <div class="title-top_arrow"></div>
              </div>
              <div class="title-bottom ml-3 fw-bolder">有奖公测活动</div>
            </div>
          </div>
        </div>
        <div class="activity-section section-margin fs-7 pb-5 px-5">
          自开放公测以来，Tapdata Cloud 在与用户交互过程中不断升级迭代，为了回馈和鼓励用户更好地使用产品和提出宝贵建议，
          <span class="fw-bolder">即日起至2021年10月1日，Tapdata 面向全体用户送出公测福利！</span>
          不论您是Tapdata Cloud 的用户还是产品推荐官，都有机会赢取 AirPods
          、Kindle、机械键盘、小爱音响、充电宝、定制保温杯和U盘等好礼！
        </div>
        <div class="prize-section section-margin flex justify-content-center p-4">
          <img src="../../../public/images/notice/prize1.png" alt="" />
          <img src="../../../public/images/notice/prize2.png" alt="" />
        </div>
        <div class="index-section section-margin mb-3">
          <div class="index-section__header flex">
            <div class="index-section__number">02</div>
            <div class="index-section__slash"></div>
            <div class="index-section__title">
              <div class="title-top">
                <div class="title-top_arrow"></div>
              </div>
              <div class="title-bottom ml-3 fw-bolder">活动参与方式</div>
            </div>
          </div>
        </div>
        <div class="mode-container section-margin flex pb-7">
          <div class="mode-section">
            <div class="mode-section__connect">
              <div class="mode-section__header">方式一 ：顺利完成1个同步任务</div>
              <div class="p-5 clear">
                <div class="line-heiht-2">
                  活动期间顺利完成至少1个 Tapdata Cloud 数据同步任务，截图发给 Tapdata
                  服务号人工客服（通过公众号首页菜单联系客服），即可领取 64G U盘/ 充电宝 / 小爱音箱 / 保温杯 4选1！
                </div>
                <div class="text-center">
                  <div class="fw-bolder mt-6 mb-3">Tapdata Cloud 官网↓↓</div>
                  <div class="mb-3">https://cloud.tapdata.net/</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mode-section">
            <div class="mode-section__connect">
              <div class="mode-section__header">方式二：撰写并分享产品体验博客</div>
              <div class="p-5 clear">
                <div class="line-heiht-2">
                  活动期间，体验 Tapdata Cloud / Tapdata Enterprise，并撰写和分享使用经验博客文章，完成后将文章链接发给
                  Tapdata 服务号人工客服，可根据内容质量获得Apple AirPods / Kindle /
                  机械键盘（文章质量越高，奖品价值越高）！
                </div>
                <div class="mt-6 fs-8">
                  * 内容判断维度：主题切合度，逻辑清晰度，可读性，参考价值等；本奖品也可以折合成京东购物卡兑换。
                </div>
              </div>
            </div>
          </div>
          <div class="mode-section">
            <div class="mode-section__connect">
              <div class="mode-section__header">方式三：成为 Tapdata 产品推荐官</div>
              <div class="p-5 clear">
                <div class="line-heiht-2">
                  活动期间成功邀请朋友关注 Tapdata
                  微信服务号（邀请数≥15名）的推荐官，将获得礼品盲盒1个（包括不限于机械键盘，保温杯，充电宝，Kindle，
                  Apple AirPods 等），邀请人数达标后系统将自动通知您（ps：邀请人数越多，将有机会获得更高价值的礼品）！
                </div>
                <div class="QR-code-section text-center">
                  <div class="mt-6 mb-2">扫描识别二维码成为产品推荐官↓↓</div>
                  <img src="../../../public/images/notice/poster.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 2">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>Tapdata Cloud 1.0.6 版本发布啦！</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2021-08-30</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-3 fw-bolder">1.数据一致性如何保证？数据校验来帮忙</div>
        <div class="mb-3">
          多样化的校验手段：快速count校验、表全字段值校验和关联字段值校验，可增量式的差异化校验能力，让用户快速精准实现同步结果的校验。
        </div>
        <div class="mb-8">
          <img src="../../../public/images/notice/verify.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">2. 异构迁移无从下手？类型映射帮您高效解决</div>
        <div class="mb-3">
          在异构数据库之间做迁移，类型转换是一大难题，也是导致迁移失败的重要原因，本次上线的类型映射功能，在系统推演的基础上，提供了人工调整的能力，进一步保证迁移的成功率。
        </div>
        <div class="mb-8">
          <img src="../../../public/images/notice/verify_diff.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">3. 支持任务配置过程手动加载schema，轻松解决结构初始化问题</div>
        <div class="mb-3">
          配置同步任务时，源表信息不完整？没关系，手动加载来解决。充分满足网络波动等情况下，加载异常的问题。
        </div>
        <div class="mb-8">
          <img src="../../../public/images/notice/task_load_schema.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">4. 任务支持设置增量并发写入，高性能同步不再是难题</div>
        <div class="mb-3">为了提升数据同步时的目标端高性能写入，本次上线开放了增量并发开关，方便用户调优。</div>
        <div class="mb-3">
          <img src="../../../public/images/notice/task_write.png" alt="" />
        </div>
        <div class="mb-8">温馨提醒：增量并发默认未打开，需要自行开启。</div>
        <div class="mb-3 fw-bolder">5. 全新增加对阿里云数仓AnalyticDB MySQL支持</div>
        <div class="mb-8">在本版本中，增加了对AnalyticDB MySQL作为目标的支持，满足用户对于数据入仓的需求。</div>
        <div class="mb-3 fw-bolder">6. 支持standalone模式MongoDB的全量同步</div>
        <div class="mb-6">
          在前面的版本中，Tapdata Cloud已支持在两个 MongoDB
          集群之间复制数据。本次版本应MongoDB用户要求，支持standalone模式MongoDB的全量同步。
        </div>
        <div class="mb-4" style="color: #d83931">温馨提示：体验新功能，需要更新Agent到最新版本哦。</div>
        <div class="mb-4">更多新功能具体介绍，敬请关注Tapdata服务号后续发布。</div>
        <div class="mb-3">
          <img style="width: 100px" src="../../../public/images/notice/wx_code.png" alt="" />
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container fs-8" v-else>
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>新手必看 ！如何玩转 Tapdata Cloud 数据同步功能</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2021-05-28</span>
      </div>
    </div>
    <div class="notice-body mt-6 p-6">
      <div class="notice-body__content">
        <div class="notice-body__step mb-4">
          <div>Tapdata Cloud 是 Tapdata 的云版产品，提供安全、简单、永久免费的数据同步服务。</div>
          <div>
            近期，Tapdata Cloud 推出1.0 版本，接下来小助手带大家一起来看下如何玩转 Tapdata Cloud 数据同步功能吧！
          </div>
          <div class="fw-bolder fs-7">三步快速完成数据同步</div>
          <div>
            无论您是想实现数据库架构现代化，还是想实现零停机数据迁移，亦或是实现数据异地灾备及异地多活等，使用 Tapdata
            Cloud 来搭配您的数据架构设计，只需3步帮您快速完成数据同步！
          </div>
          <div class="fw-bolder fs-7">第一步：部署Agent</div>
          <div>
            实例Agent是 Tapdata Cloud
            最重要的组成部分，用户所有的同步任务都依赖于实例来进行。通过实例管理对Agent进行安装、启动、暂停和状态管理等操作。
          </div>
          <div class="fw-bolder fs-7">第二步：创建连接</div>
          <div>
            建立Agent与用户源数据库和目标数据库的连接。通过连接管理对用户添加的所有数据连接进行管理，主要包括创建连接、连接测试、编辑连接、复制连接、查询连接和删除连接等功能。
          </div>
          <div class="fw-bolder fs-7">第三步：创建任务</div>
          <div>
            创建同步任务并对同步任务进行管理，主要包括创建任务、启动任务、任务监控、任务编辑、复制、重置、删除等操作。
          </div>
          <!--				<div>本版本支持的数据源类型及版本：</div>-->
        </div>
        <div class="notice-body__intro">
          <div class="fw-bolder fs-7">Tapdata 工作台介绍</div>
          <div>工作台主要帮助用户快速了解和熟悉产品，并可以通过快速创建入口部署Agent、连接和任务。</div>
          <div class="notice-body__intro-img py-1">
            <img src="../../../public/images/workbench/workbench.png" alt="" />
          </div>
          <div class="fw-bolder fs-7">用户引导</div>
          <div>点击 Tapdata Cloud 工作台中的【开启引导】可以进入用户引导页面，按照步骤说明学会使用 Tapdata Cloud。</div>
          <div class="fw-bolder fs-7">快捷入口</div>
          <div>部署Agent：一键进入Agent创建页面，开始部署Agent</div>
          <div>创建连接：一键进入连接创建页面，开始创建连接</div>
          <div>创建任务：一键进入任务创建页面，开始创建同步任务创建任务：一键进入任务创建页面，开始创建同步任务</div>
          <div class="fw-bolder fs-7">公告通知</div>
          <div>展示最新的公告信息，包括升级变更提醒、版本新特性介绍等内容，点击公告标题可以查看公告详细内容。</div>
          <div class="fw-bolder fs-7">文档快速入口</div>
          <div>点击入口可以快速查看产品介绍文档和产品使用手册。</div>
          <div class="fw-bolder fs-7">文档中心</div>
          <div>在文档中心，您可以找到 Tapdata Cloud 相关的文档和资源，帮助您更好地理解和使用我们的产品。</div>
          <div class="fw-bolder fs-7">社区</div>
          <div>
            Tapdata Ask 提供 Tapdata Cloud
            问答交流，您在使用产品的过程中遇到什么问题，可以点击“社区”提出您的问题，Tapdata
            的技术人员将会不定期上问答社区看是否能为您提供帮助。同时欢迎您为其它朋友答疑解惑！
          </div>
          <div>
            Tapdata Ask 入口：
            <ElLink class="logo" type="primary" href="https://ask.tapdata.net/" target="_blank"
              >https://ask.tapdata.net/</ElLink
            >
          </div>
          <div>
            您还可以在 Tapdata Ask 反馈我们产品的一些问题，提供优质的反馈将有机会获取 Tapdata 周边礼品，例如
            签字笔，U盘等。
          </div>
          <div>如果您有比较紧急的问题，或者比较深入的交流反馈，也可以添加我们用户支持同学的企业微信，联系我们。</div>
          <div class="QR-code">
            <img src="../../assets/image/LarkQR.jpeg" alt="" />
          </div>
          <div class="fw-bolder">感谢您对 Tapdata Cloud 的支持，我们一起努力让数据同步变得更加简单高效！</div>
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
  background: url('../../../public/images/workbench/notice_title.png') no-repeat 100% / cover;
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
  .line-heiht-2 {
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
</style>

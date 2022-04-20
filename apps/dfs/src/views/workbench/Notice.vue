<template>
  <div class="notice g-panel-container ws-main-container fs-8" v-if="$route.query.id == 8">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_tAPDA12') }}</span>
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
          {{ $t('workbench_Notice_tAPDA11') }}<img src="../../../public/images/notice/v1.0.9_01.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">{{ $t('workbench_Notice_buDuanYouHuaTi') }}</div>
        <div class="mb-3">{{ $t('workbench_Notice_zaiChuangJianLianJie') }}</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_02.png" alt="" />
        </div>
        <div class="mb-3">{{ $t('workbench_Notice_benCiXinZengRi') }}</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_03.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">{{ $t('workbench_Notice_zhiChiPiLiangCao') }}</div>
        <div class="mb-3">{{ $t('workbench_Notice_ziDuanYingSheBu') }}</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_04.png" alt="" />
        </div>
        <div class="mb-3 fw-bolder">{{ $t('workbench_Notice_duoWeiDuTongJi') }}</div>
        <div class="mb-3">{{ $t('workbench_Notice_banBenDuiShuJu') }}</div>
        <div class="mb-8">
          <img src="../../../public/images/notice/v1.0.9_05.png" alt="" />
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 9">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_shengJiGongGao') }}</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-01-20</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-6">{{ $t('workbench_Notice_zunJingDeYongHu') }}</div>
        <div class="mb-2">{{ $t('workbench_Notice_ninHaoWeiLeJin') }}</div>
        <div class="mb-2">{{ $t('workbench_Notice_shengJiQiJianKe') }}</div>
        <div class="mb-10">{{ $t('workbench_Notice_yiShangShengJiRu') }}</div>
        <div class="">{{ $t('workbench_Notice_nianYueRi') }}</div>
        <div class="">{{ $t('workbench_Notice_tAPDA9') }}</div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 10">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_tAPDA8') }}</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-02-12</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">{{ $t('workbench_Notice_kaiNianYouFengGeng') }}</div>
        <div class="mb-4">{{ $t('workbench_Notice_ciCiFaBuDe2') }}</div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">{{ $t('workbench_Notice_gengXinSuLan') }}</div>
          <div class="ml-2 mb-4">
            {{ $t('workbench_Notice_zhiChi')
            }}<span class="fw-bold font-color-main">{{ $t('workbench_Notice_sheZhiZengLiangCai') }}</span
            >{{ $t('workbench_Notice_zengLiangRenWuKe') }}
          </div>
          <div class="ml-2 mb-4">
            {{ $t('workbench_Notice_zhiChiShuJuYuan')
            }}<span class="fw-bold font-color-main">{{ $t('workbench_Notice_xinZengMAR') }}</span>
          </div>
          <div class="ml-2 mb-4">{{ $t('workbench_Notice_xiJieGengXinYou') }}</div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_zhiChiSheZhiZeng') }}</strong>
            </div>
            <div class="number-title-box__desc">{{ $t('workbench_Notice_gongNengShengJiCao') }}</div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zhenDuiLiShiBan') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_ruGuoNiDeQuan') }}</div>
        <div>
          <img src="../../../public/images/notice/task_create.gif" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/task_setting_cdc_time.png" alt="" />
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_muQianGaiYouHua') }}</div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_shuJuYuanZaiShang') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_mARIA') }}</p>
              <p class="mt-3">{{ $t('workbench_Notice_yiGouShuJuKu') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zuoWeiGuoNeiShou3') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_benCiGengXinZhong3') }}</div>
        <div>
          <img src="../../../public/images/notice/connection_selector.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_xiJieYouHua') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_weiXiaoDanTieXin2') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_yongHuDaoXiangXi2') }}</div>
        <div>
          <img src="../../../public/images/notice/task_edit_pop.gif" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/task_edit_pop_content.png" alt="" />
        </div>
        <div class="line-height-2">
          {{ $t('workbench_Notice_zhongShiChengZhangLu2') }}
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />{{ $t('workbench_Notice_') }}
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 11">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_tAPDA7') }}</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-02-28</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">{{ $t('workbench_Notice_ciCiFaBuDe') }}</div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">{{ $t('workbench_Notice_gengXinSuLan') }}</div>
          <div class="ml-2 mb-4">
            {{ $t('workbench_Notice_shuJuLianJieShang2')
            }}<span class="fw-bold font-color-main">{{ $t('workbench_Notice_kaiShiZhiChiYun') }}</span
            >{{ $t('workbench_Notice_benLunXinZengA') }}
          </div>
          <div class="ml-2 mb-4">
            2.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_youHuaWIN') }}</span
            >{{ $t('workbench_Notice_liuChengGengQingXi') }}
          </div>
          <div class="ml-2 mb-4">
            3.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_xinZengYongHuZhong2') }}</span
            >{{ $t('workbench_Notice_zhiChiXiuGaiZhu') }}
          </div>
          <div class="ml-2 mb-4">
            4.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_xinZengRenWuShu2') }}</span
            >{{ $t('workbench_Notice_yongHuGongZuoTai') }}
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_kaiShiZhiChiYun') }}</strong>
            </div>
            <div class="number-title-box__desc">{{ $t('workbench_Notice_shuJuLianJieYou2') }}</div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zuoWeiGuoNeiShou') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_mianDuiDaLiangYong') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_01.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_wINDO') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_shaGuaMoShiZai') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_tAPDA6') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_benCiGengXinZhong2') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zaiAGEN') }}</div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_zaiAnZhuangGuoCheng')
          }}<span class="color-danger">{{ $t('workbench_Notice_wuRenHeQinRu') }}</span
          >{{ $t('workbench_Notice_3') }}
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.0_p_02.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_xinZengYongHuZhong') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_niDeGeXingHua') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_xiangYaoZiZhuXiu') }}</div>
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
              <strong>{{ $t('workbench_Notice_xinZengRenWuShu') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_yinWeiKeShiSuo') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zheYiCiWoMen') }}</div>
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
          {{ $t('workbench_Notice_zhongShiChengZhangLu') }}
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />{{ $t('workbench_Notice_') }}
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 12">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_xinZengTengXunYun') }}</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-03-11</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">{{ $t('workbench_Notice_xuQiuChiXuGeng3') }}</div>
        <div class="mb-4">{{ $t('workbench_Notice_zuiXinFaBuDe3') }}</div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">{{ $t('workbench_Notice_gengXinSuLan') }}</div>
          <div class="ml-2 mb-4">
            1.<span class="fw-bold font-color-main">{{ $t('workbench_Notice_shuJuLianJieShang') }}</span
            >{{ $t('workbench_Notice_ciFanZengJiaLe') }}
          </div>
          <div class="ml-2 mb-4">
            2.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_kaiShiZhiChiRen') }}</span
            >{{ $t('workbench_Notice_quanLiangRenWuKe2') }}
          </div>
          <div class="ml-2 mb-4">
            3.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_kaiShiZhiChiZhi') }}</span
            >{{ $t('workbench_Notice_shuJuJiaoYanHuan') }}
          </div>
          <div class="ml-2 mb-4">
            4.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_ziDuanYingSheGuo2') }}</span
            >{{ $t('workbench_Notice_zaiYuanYouDePi') }}
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_yunShuJuKuJie') }}</strong>
            </div>
            <div class="number-title-box__desc">{{ $t('workbench_Notice_banTuYouJianXin') }}</div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zuoWeiGuoNeiShou2') }}</div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_jiBanBenShouCi') }}
          <span class="fw-bold font-color-main"
            >{{ $t('workbench_Notice_shuJuYuanJuDian')
            }}<span class="fs-6" style="font-family: DIN; color: rgb(0, 122, 181)">28</span></span
          >{{ $t('workbench_Notice_fangDaJiuKanT') }}
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_01.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_hINiDeRen') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_buBeiDongJiaBan') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_haiZaiWeiXuYao2') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_haiZaiWeiXuYao') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_niXiangYaoDeRen') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_02.gif" alt="" />
        </div>
        <div class="my-4 fs-6" style="color: rgb(0, 122, 181)">{{ $t('workbench_Notice_quanLiangZengLiangJi') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zhenDuiQuanLiangZeng') }}</div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_juTiLiuChengDa2') }}
          <span class="color: rgb(136, 136, 136);"
            >{{ $t('workbench_Notice_shouDongHuaZhongDian')
            }}<span style="color: rgb(255, 76, 0)">{{ $t('workbench_Notice_baoCunQianQingWu') }}</span
            >{{ $t('workbench_Notice_3') }}</span
          >
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_03.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_daKaiSheZhi') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_04.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_xuanZeYunXingShi') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_05.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_sheZhiShiJianQian') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_06.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_sheZhiShiJianDao') }}</div>
        <div class="my-4 fs-6" style="color: rgb(0, 122, 181)">{{ $t('workbench_Notice_quanLiangRenWuKe') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zhenDuiQuanLiangRen') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_juTiLiuChengDa') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_07.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_daKaiSheZhi') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_08.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_zhiLuShuRuKuang') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_09.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_shiLiSheZhiTiao') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_10.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_renWuWeiQiDong') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_11.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_renWuDiYiCi') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_12.png" alt="" />
        </div>
        <div class="py-1 text-center font-color-disable">{{ $t('workbench_Notice_renWuZaiCiQi') }}</div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_zhiChiDuiZhiDing') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_zhiYouGeBieBiao') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_congZheYiBanKai2') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_xinBanBenZhiChi2') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.1_13.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">04</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_ziDuanYingSheShi') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_daPoJuXianGeng') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_tAPDA5') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_xinGongNengXiaYong') }}</div>
        <ul class="pl-8">
          <li class="mb-4 line-height-2 list-style-disc">
            {{ $t('workbench_Notice_zaiQianYiGuoCheng')
            }}<span class="fw-bold font-color-main">{{ $t('workbench_Notice_yuanBiaoShuJu') }}</span
            >{{ $t('workbench_Notice_xieRu')
            }}<span class="fw-bold font-color-main">{{ $t('workbench_Notice_zhiDingMuBiaoBiao') }}</span>
          </li>
          <li class="mb-4 line-height-2 list-style-disc">
            {{ $t('workbench_Notice_tongGuoXiuGaiMu')
            }}<span class="fw-bold font-color-main">{{ $t('workbench_Notice_duoGeJieGouXiang') }}</span
            >{{ $t('workbench_Notice_xieRu')
            }}<span class="fw-bold font-color-main">{{ $t('workbench_Notice_tongYiMuBiaoBiao') }}</span>
          </li>
        </ul>
        <div>
          <img src="../../../public/images/notice/v2.1.1_14.png" alt="" />
        </div>
        <div class="line-height-2">
          {{ $t('workbench_Notice_zhongShiChengZhangLu') }}
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />{{ $t('workbench_Notice_') }}
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 13">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_tAPDA4') }}</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-03-30</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">{{ $t('workbench_Notice_xuQiuChiXuGeng2') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zuiXinFaBuDe2') }}</div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">{{ $t('workbench_Notice_gengXinSuLan') }}</div>
          <div class="ml-2 mb-4">
            1.<span class="fw-bold font-color-main">{{ $t('workbench_Notice_xinZengZhiChiV') }}</span
            >{{ $t('workbench_Notice_daTongYuXinYi') }}
          </div>
          <div class="ml-2 mb-4">
            2.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_ziDuanLeiXingKe') }}</span
            >{{ $t('workbench_Notice_ziDuanYingSheGuo') }}
          </div>
          <div class="ml-2 mb-4">
            3.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_saoMaDengLuGong') }}</span
            >{{ $t('workbench_Notice_zhiChiWeiXinSao') }}
          </div>
          <div class="ml-2 mb-4">
            4.
            <span class="fw-bold font-color-main">{{ $t('workbench_Notice_gengDuoXiJieYou') }}</span
            >{{ $t('field_mapping_field_mapping_dialog_') }}
            <p class="mt-2">{{ $t('workbench_Notice_duanXinTongZhiCe') }}</p>
            <p class="mt-2">{{ $t('workbench_Notice_chuangJianLianJieShi') }}</p>
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_kaiShiZhiChiV') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p class="mb-2">{{ $t('workbench_Notice_shuJuLianJieYou') }}</p>
              <p>{{ $t('workbench_Notice_qingLiangQingLiangGeng') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zuoWeiGuoNeiShou') }}</div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_benCiGengXinZhong') }}
          <span class="fw-bold font-color-main"
            ><span class="fs-6" style="font-family: DIN; color: rgb(0, 122, 181)">29</span></span
          >{{ $t('workbench_Notice_fangDaJiuKanT') }}
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/01.jpg" alt="" />
        </div>
        <div class="my-4">
          {{ $t('workbench_Notice_lingFuCaoZuoYan')
          }}<span class="font-color-main fw-bold">{{ $t('workbench_Notice_jiangXueShengChengJi') }}</span
          >{{ $t('workbench_Notice_2') }}
        </div>
        <div>
          <!--<img src="../../../public/images/notice/v2.1.2/02.gif" alt="" />-->
          <video src="../../../public/images/notice/v2.1.2/demo.mp4" controls="controls"></video>
        </div>
        <div class="text-center color-disable">{{ $t('workbench_Notice_caoZuoYanShiJiang') }}</div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">02</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_zhiChiZiDuanLei') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_ziDuanLeiXingZhuan') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_tAPDA3') }}</div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/03.png" alt="" />
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">03</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_shiXianSaoMaZhu') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_jiSaoJiYongKuai') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zhangHaoMiMaRong') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_congXianZaiKaiShi') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_chuCiSaoMaDeng') }}</div>
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
              <strong>{{ $t('workbench_Notice_gengDuoXiJieYou') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_weiXiaoDanTieXin') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_yongHuDaoXiangXi') }}</div>
        <div class="mb-4 font-color-main fs-7 fw-bold">
          <span class="dot mr-4"></span>{{ $t('workbench_Notice_ziZhuKaiGuanDuan') }}
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/06.png" alt="" />
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_aGENT') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_xinBanBenDeDuan') }}</div>
        <div class="mb-4 font-color-main fs-7 fw-bold">
          <span class="dot mr-4"></span>{{ $t('workbench_Notice_gengKuaiDingWeiLian') }}
        </div>
        <div class="mb-4">
          <img src="../../../public/images/notice/v2.1.2/07.png" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.2/08.png" alt="" />
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_suoWeiBanTuZhi') }}</div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_xinBanBenZhiChi') }}</div>
        <div class="line-height-2">
          {{ $t('workbench_Notice_zhongShiChengZhangLu') }}
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />{{ $t('workbench_Notice_') }}
        </div>
      </div>
    </div>
  </div>
  <div class="notice g-panel-container ws-main-container fs-8" v-else-if="$route.query.id == 14">
    <div class="notice-header p-6">
      <div class="notice-header__title fw-bolder fs-7">
        <span>{{ $t('workbench_Notice_tAPDA2') }}</span>
      </div>
      <div class="notice-header__time mt-5 ml-1 flex align-items-center">
        <img src="../../assets/image/logoIconColour.png" alt="" />
        <span class="ml-5 mr-4">Cloud@Tapdata</span>
        <span>2022-04-07 21:00</span>
      </div>
    </div>
    <div class="notice-body mt-6 fs-6">
      <div class="notice-body__content p-6 fs-7" style="width: 800px">
        <div class="mb-4">{{ $t('workbench_Notice_xuQiuChiXuGeng') }}</div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_zuiXinFaBuDe') }}
        </div>
        <div class="mb-2 p-4" style="background-color: rgb(241, 248, 255)">
          <div class="mb-4">{{ $t('workbench_Notice_gengXinSuLan') }}</div>
          <div class="ml-2 mb-4">
            <span>1.</span><span class="fw-bold font-color-main pl-1">{{ $t('workbench_Notice_xinZengZhiChiA') }}</span
            >{{ $t('workbench_Notice_qianShouGengDuoYou') }}
          </div>
          <div class="ml-2 mb-4">
            <span>2.</span>
            <span class="fw-bold font-color-main pl-1">{{ $t('workbench_Notice_renWuRiZhiCha') }}</span
            >{{ $t('workbench_Notice_kaiShiZhiChiZai') }}
          </div>
        </div>
        <div class="number-title-box mt-8">
          <div class="number-title-box__number">01</div>
          <div class="number-title-box__content">
            <div class="number-title-box__title">
              <strong>{{ $t('workbench_Notice_kaiShiZhiChiD') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p class="mb-2">{{ $t('workbench_Notice_qiangQiangLianShouGong') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_zuoWeiGuoNeiShou') }}</div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_suiZheXinXingGuo') }}
          <ElLink
            type="primary"
            href="https://tapdata.net/tapdata-PDK-program.html?fromColId=2"
            target="_blank"
            class="fs-7 align-baseline"
            >{{ $t('workbench_Notice_tAPDA') }}</ElLink
          >
          {{ $t('workbench_Notice_deShouPiGongJian') }}
        </div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_zhiCiTAP') }}
          <span class="fw-bold font-color-main"
            >{{ $t('workbench_Notice_shuJuLianJieJu')
            }}<span class="fs-6 pl-1" style="font-family: DIN; color: rgb(0, 122, 181)">30</span></span
          >{{ $t('workbench_Notice_fangDaJiuKanT') }}
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
              <strong>{{ $t('workbench_Notice_renWuRiZhiCha') }}</strong>
            </div>
            <div class="number-title-box__desc">
              <p>{{ $t('workbench_Notice_xiaoYouHuaGengTie') }}</p>
            </div>
          </div>
        </div>
        <div class="mb-4 line-height-2">{{ $t('workbench_Notice_congZheYiBanKai') }}</div>
        <div class="mb-4 line-height-2">
          {{ $t('workbench_Notice_xinBanBenXiaDang') }}
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.3/03.png" alt="" />
        </div>
        <div>
          <img src="../../../public/images/notice/v2.1.3/04.png" alt="" />
        </div>
        <div class="line-height-2">
          {{ $t('workbench_Notice_zhongShiChengZhangLu') }}
          <img
            src="../../../public/images/notice/love.png"
            alt=""
            style="width: 20px; height: 20px; vertical-align: text-bottom"
          />{{ $t('workbench_Notice_') }}
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

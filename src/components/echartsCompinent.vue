<template>
	<div class="echartBox">
		<div class="echarts" :id="echartsId" :echartObj="echartObj" ref="echarts"></div>
	</div>
</template>
<script>
	import Echarts from '../plugins/echarts';
	// import echarts from 'echarts'
	export default {
		name: 'EchartsCompinent',
		props: {
			echartsId: {
				type: String
			},
			echartObj: {
				type: Object,
			}
		},
		data() {
			return {
				myChart: null,
				timer: ''
			};
		},
		watch: {
			echartObj: {
				handler(data) {
					this.loadEchart(this.echartsId, data);
				},
				deep: true
			}
		},
		mounted() {
			let that = this;
			this.$nextTick(() => {
				that.loadEchart(that.echartsId, that.echartObj);
			});
		},

		methods: {
			loadEchart(id, data) {
				let _this = this;
				_this.myChart = Echarts.init(document.getElementById(id));
				// _this.myChart.clear();   //清空再重绘
				let publicCharts = _this.echartOption(data);
				_this.myChart.setOption(publicCharts);
				/*窗口自适应*/
				window.addEventListener("resize", () => {
					_this.myChart.resize();
				});
			},
			echartOption(configures) {
				let MyOption = {
					// title: {
					//   text: '折线图堆叠'
					// },
					//鼠标悬浮提示框
					tooltip: {
						trigger: configures.tooltip.trigger,
						confine: true, //是否将 tooltip 框限制在图表的区域内。  true为是
						backgroundColor: "#fff",
						borderColor: '#dedee4',
						borderWidth: 1,
						textStyle: {
							color: '#333',
							fontSize: 12
						},
						axisPointer: {
							// 坐标轴指示器，坐标轴触发有效
							// type: configures.tooltip.axisPointer.type, // 默认为直线，可选为：'line' | 'shadow'
							label: {
								// backgroundColor: '#6a7985'
							}
						},
						formatter: configures.tooltip.formatter
					},
					//图例
					legend: {
						//图例的数据数组
						data: configures.legend.data, //图例的数据数组   一般不设置，自动根据数据匹配
						top: 10, //图例组件离容器上侧的距离
						right: 20, //图例组件离容器右侧的距离
						// bottom: configures.legend.bottom, //图例组件离容器下侧的距离
						left: configures.legend.left, //图例组件离容器左侧的距离
						// textStyle: {
						//   color: this.echartsXYcolor //在本项目中涉及到主题色切换，所以采用动态颜色，黑白两色，下边相同
						// }
					},
					//工具栏。内置有导出图片，数据视图，动态类型切换，数据区域缩放，重置五个工具。
					toolbox: {
						feature: {
							saveAsImage: {}
						}
					},
					animation: false,
					//直角坐标系内绘图网格
					grid: configures.grid,
					//x轴的数据以及配置
					xAxis: {
						type: 'category', //坐标轴类型。具体参考官方文档
						boundaryGap: true, //类目轴中 boundaryGap 可以配置为 true 和 false。默认为 true，这时候刻度只是作为分隔线，标签和数据点都会在两个刻度之间的带(band)中间。
						data: configures.xAxis.data, //x轴的数据
						show: true,
						axisTick: {show: false},  //是否显示坐标轴刻度
						splitLine: {
							show: true,
							lineStyle: {
								color: "#dedee4"
							}
            }, //是否显示分隔线
            grid: {
              left: 50,
              // containLabel: true
            },
						axisLine: {
							show: true,
							lineStyle: {
								color: configures.xAxis.axisLine.lineStyle.color,
								width: 1,//这里是为了突出显示加上的
							}
						}, //是否显示坐标轴轴线。
						axisLabel: {
							interval: 3,
							rotate: -8,
							fontSize: 10,
							textStyle: {
								color: '#333',  //坐标的字体颜色
							}
						},
						splitArea: {
							areaStyle: {
								color: '#f00'
							}
						},
						nameTextStyle: {
							fontSize: 12,
						}
					},
					//y轴的数据配置
					yAxis: {
						type: 'value',
						min: 0,
						axisTick: {show: false},
						axisLine: {
							lineStyle: {
								color: configures.yAxis.axisLine.lineStyle.color,
								width: 1//这里是为了突出显示加上的
							}
						},
						splitLine: {
							show: true,
							lineStyle: {
								color: "#dedee4"
							}
						}, //是否显示分隔线
						splitArea: {
							areaStyle: {
								color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
							}
						},
						axisLabel: {
							textStyle: {
								color: '#333',  //坐标的字体颜色
							},
							formatter: configures.yAxis.axisLabel.formatter
						},
					},
					// type: 'value',
					axisLabel: {
						formatter: configures.yAxis.axisLabel.formatter
					},
					// axisLine: {
					//   lineStyle: {
					//     color: this.echartsXYcolor
					//   }
					// },
					// axisLabel: {
					//   textStyle: {
					//     color: this.echartsXYcolor
					//   },
					//   formatter: configures.yAxis.axisLabel.formatter
					// }
					// }],
					// dataZoom 组件 用于区域缩放，从而能自由关注细节的数据信息，或者概览数据整体，或者去除离群点的影响。
					dataZoom: [
						// {
						//   type: "inside"
						// },
						// {
						//   type: "slider",
						//   // top: configures.dataZoom[1].top, //距离容器上边的距离
						//   textStyle: {
						//     color: this.echartsXYcolor
						//   }
						// }
					],
					//图表的数据
					series: configures.series //由于数据的灵活度大，所以完全采用传入的方式
				};
				return MyOption;
			}
		},
		beforeDestroy() {
			if (this.myChart) {
				this.myChart.clear();
			}
		}
	};
</script>
<style scoped lang="less">
	.echartBox {
		height: calc(100% - 30px);

		.echarts {
			width: 100%;
			height: 100%;
		}
	}
</style>


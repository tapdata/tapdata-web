/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/3/30
 * @description
 */
import { TYPEMAP } from '../../util'

// 支持的数据类型
let allowDataType = ['mysql', 'oracle', 'sqlserver', 'mongodb', 'postgres', 'redis', 'elasticsearch']
// 即将上线的数据类型
let comingAllowDataType = ['db2', 'sybase ase', 'kafka', 'gbase-8s']
// 格式化成 “已支持”，“即将上线”的格式
function getDataTypeItems(arr, arr2) {
	return arr.concat(arr2).map(item => {
		let obj = {
			key: item,
			name: TYPEMAP[item],
			type: item,
			src: 'databaseType/' + item + '.png'
		}
		if (arr2.indexOf(item) > -1) {
			obj.disabled = true
			obj.disabledText = '即将上线'
		}
		return obj
	})
}

const STEPS = [
	{
		key: 'home',
		title: {
			text: ['创建数据连接或数据任务'],
			class: 'mt-12'
		},
		contentClass: 'flex justify-center align-center',
		imgList: {
			class: 'justify-evenly',
			style: {
				width: '100%'
			},
			itemStyle: {
				width: '250px'
			},
			imageItemClass: 'p-4 pb-10',
			imageStyle: {
				width: '100%'
			},
			items: [
				{
					key: 'step_0_connection',
					type: 'connection',
					btnName: '创建数据连接',
					class: 'large',
					to: 'dataSource_select',
					disabled: true
				},
				{
					key: 'step_0_dataFlow',
					type: 'dataFlow',
					btnName: '创建数据任务',
					class: 'large',
					to: 'task_create',
					disabled: true
				}
			]
		},
		btnList: {
			class: 'justify-start pl-5',
			items: [
				{
					name: '新手引导',
					to: 'task_1',
					img: {
						src: 'guide/lamp.png',
						style: {
							position: 'absolute',
							width: '30px',
							height: '46px',
							left: '6px',
							top: '-23px'
						}
					}
				}
			]
		}
	},
	// 新手引导
	// {
	// 	key: 'guide_start',
	// 	title: {
	// 		text: 'Tapdata新手引导模式'
	// 	},
	// 	bgImg: {
	// 		key: 'step_1'
	// 	},
	// 	btnList: [
	// 		{
	// 			name: '开始Tapdata数据之旅',
	// 			to: 'next',
	// 			style: {
	// 				width: 'auto'
	// 			}
	// 		}
	// 	]
	// },
	{
		key: 'task_1',
		title: {
			text: '创建你的第一个数据同步任务',
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		contentClass: 'mt-9 px-15',
		section: [
			{
				type: 'image',
				class: 'mt-4 mr-8',
				key: 'step_3'
			},
			{
				text: [
					'数据任务是指基于Tapdata agent连接的两个数据源之间的数据处理',
					'数据任务包括数据同步及数据开发',
					'Tapdata免费版目前仅开放了数据同步功能',
					'数据同步能够让你简单的将一个数据源的数据克隆到另一个数据源',
					'源端与目标端可以是不同类型的数据库(数据异构)',
					'数据同步支持全量同步,全量及增量两种形式'
				],
				class: 'pt-12 font-weight-medium',
				style: {
					color: '#232325'
				}
			}
		],
		btnList: {
			items: [
				{
					name: '上一步',
					to: 'prev',
					class: 'prev-btn mr-10'
				},
				{
					name: '下一步',
					to: 'next'
				}
			]
		}
	},
	{
		key: 'task_2',
		title: {
			text: '源端与目标端',
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		contentClass: 'mt-9 px-15',
		section: [
			{
				type: 'image',
				class: 'mt-4 mr-8',
				key: 'step_3'
			},
			{
				text: [
					'在创建任务之前,你可能需要了解',
					'什么是源端、目标端',
					'源端：数据的提供者',
					'目标端：数据的接收者',
					'Tapdata agent会成为源端与目标端的数据桥梁',
					'将源端的数据按照你的需要发送到目标端',
					'接下来，请按照你的需要，对源端、目标端进行选择'
				],
				class: 'pt-12 font-weight-medium',
				style: {
					color: '#232325'
				}
			}
		],
		btnList: {
			items: [
				{
					name: '上一步',
					to: 'prev',
					class: 'prev-btn mr-10'
				},
				{
					name: '下一步',
					to: 'dataFlow'
				}
			]
		}
	},
	// 数据源
	{
		key: 'dataSource_1',
		title: {
			text: '什么是数据源',
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		contentClass: 'mt-36 px-15',
		section: [
			{
				type: 'image',
				class: 'mt-8 mr-8',
				key: 'step_3'
			},
			{
				type: 'text',
				text: [
					'数据源是数据存储系统的统称,在数据存储技术蓬勃发展的今天,数据源是多样化的',
					'它可以是关系型数据库与非关系型数据库',
					'它可以是网站页面中的销售,转发,点赞量',
					'它可以是用户本地的text文件,csv文件等',
					'Tapdata agent是数据源间的连接',
					'因此,Tapdata agent工作的先决条件为2个或以上数据源的创建',
					'',
					'为了能够帮助你完成任务的创建',
					'下面，我们将带你去添加数据源'
				],
				class: 'pt-12 fw-normal',
				style: {
					color: '#232325'
				},
				itemStyle: {
					'min-height': '24px'
				}
			}
		],
		btnList: {
			items: [
				{
					name: '上一步',
					to: 'prev',
					class: 'prev-btn mr-10'
				},
				{
					name: '添加数据源',
					to: 'next'
				}
			]
		}
	},
	{
		key: 'dataSource_select',
		title: {
			text: '请在下方选择你要添加的数据连接类型'
		},
		contentClass: 'overflow-auto',
		imgList: {
			class: 'img-list-inline text-start pt-5 flex-wrap mx-auto inline-flex',
			isSelected: true, // 是否可以选中
			itemClass: 'text-center py-2 px-5 flex-shrink-0',
			style: {
				width: '860px'
			},
			imageItemClass: 'flex justify-center align-center',
			imageItemStyle: {
				width: '120px',
				height: '70px',
				background: '#fafafa',
				border: '1px solid #dedee4',
				'border-radius': '3px',
				'box-sizing': 'border-box',
				cursor: 'pointer'
			},
			imageStyle: {
				width: '35%'
			},
			imageTitleClass: 'mt-3',
			items: getDataTypeItems(allowDataType, comingAllowDataType)
		},
		footerContent: {
			text: ['Tapdata支持多种不同的数据源之间的相互同步', '数据源之间的可同步详情请参考'],
			class: 'pb-4',
			extra: {
				type: 'link',
				position: 'end',
				text: '【帮助文档】',
				style: {
					color: '#3370FF',
					cursor: 'pointer'
				},
				to: 'https://docs.cloud.tapdata.net/chan-pin-jian-jie/zhi-chi-de-shu-ju-yuan-lei-xing'
			}
		}
	},
	// 继续添加数据源、创建数据同步任务
	{
		key: 'dataSource_create_continue',
		title: {
			text: [
				'现在，通过引导你已经完成一个数据源的添加',
				'下面你可以选择开始创建任务，或是继续添加数据源',
				'为了方便你的测试，我们建议数据量的数据应不少于2个'
			],
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		imgList: {
			class: 'flex-wrap justify-center pt-5',
			items: [
				{
					key: 'guide_two'
				}
			]
		},
		btnList: {
			items: [
				{
					name: '继续添加数据源',
					to: 'toConnection',
					class: 'prev-btn mr-10'
				},
				{
					name: '创建数据同步任务',
					to: 'toDataFlow'
				}
			]
		}
	},
	{
		key: 'dataSource_create_1',
		title: {
			text: ['添加你的第一个数据源'],
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		btnList: {
			items: [
				{
					name: '连接测试',
					to: ''
				}
			]
		}
	},
	{
		key: 'dataSource_create_2',
		title: {
			text: ['添加你的第二个数据源'],
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		btnList: {
			items: [
				{
					name: '连接测试',
					to: ''
				}
			]
		}
	},
	// 数据任务
	{
		key: 'task_create',
		title: {
			text: ['选择数据迁移任务的源端及目标端数据源'],
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		btnList: {
			items: [
				{
					name: '上一步',
					to: 'pre',
					class: 'prev-btn mr-10'
				},
				{
					name: '下一步',
					to: 'next'
				}
			]
		}
	},
	// 引导结束
	{
		key: 'guide_end',
		title: {
			text: ['现在', '你完成新手引导并成功创建一个数据同步任务！'],
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		imgList: {
			class: 'flex-wrap justify-center align-center',
			style: {
				height: '100%'
			},
			items: [
				{
					key: 'guide_end'
				}
			]
		},
		btnList: {
			items: [
				{
					name: '返回首页',
					to: 'dashboard',
					class: 'prev-btn mr-10'
				},
				{
					name: '进入任务管理页面',
					to: 'dataFlowList'
				}
			]
		}
	}
]

export async function getConst() {
	return await window.axios
		.get('tm/api/Settings')
		.then(data => {
			// 支持的数据类型
			allowDataType = data.find(item => item.key === 'ALLOW_CONNECTION_TYPE')?.value?.split(',') || []
			// 不支持的数据类型
			comingAllowDataType = data.find(item => item.key === 'COMING_ONLINE_CONNECTION_TYPE')?.value?.split(',') || []
			STEPS.forEach(el => {
				if (el.key === 'dataSource_select') {
					el.imgList.items = getDataTypeItems(allowDataType, comingAllowDataType)
				}
			})
			return STEPS
		})
		.catch(() => {
			return STEPS
		})
}

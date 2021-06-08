/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2021/3/30
 * @description
 */
export const STEPS = [
	{
		title: {
			text: ['创建数据源或任务'],
			class: 'mt-12 mb-5'
		},
		imgList: {
			class: 'justify-between px-10',
			imageStyle: {
				'padding-bottom': '40%'
			},
			itemStyle: {
				margin: '5%'
			},
			itemClass: 'flex-1',
			items: [
				{
					key: 'step_0_guide',
					type: 'guide',
					btnName: '新手引导',
					class: 'large'
				},
				{
					key: 'step_0_connection',
					type: 'connection',
					btnName: '创建数据源',
					class: 'large'
				},
				{
					key: 'step_0_dataFlow',
					type: 'dataFlow',
					btnName: '创建任务',
					class: 'large'
				}
			]
		}
	},
	{
		title: {
			text: 'Tapdata新手引导模式'
		},
		bgImg: {
			key: 'step_1'
		},
		btnList: [
			{
				name: '开始Tapdata数据之旅',
				to: 'next',
				style: {
					width: 'auto'
				}
			}
		]
	},
	{
		title: {
			text: ['在创建任务前， 你需要至少拥有2个数据源', '当前你的数据源数量为：X'],
			itemClass: 'mb-3'
		},
		desc: {
			text: [
				'为了能够帮助你成功完成任务的创建，下面，我们将带你去添加数据源',
				'数据源是什么？不用着急，下一步我们将为你解答'
			]
		},
		bgImg: {
			key: 'step_2'
		},
		btnList: [
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
	},
	{
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
				class: 'mt-3 mr-8',
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
					'因此,Tapdata agent工作的先决条件为2个或以上数据源的创建'
				],
				class: 'pt-12 font-weight-medium',
				style: {
					color: '#232325'
				}
			}
		],
		btnList: [
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
	},
	{
		title: {
			text: '请在下方选择你要添加的数据源类型'
		},
		imgList: {
			class: 'img-list-inline text-left pt-5 pl-3',
			isSelected: true, // 是否可以选中
			itemClass: 'inline-flex items-center mr-5 mb-5',
			items: [
				{
					key: 'step_4_MySQL',
					name: 'MySQL',
					type: 'mysql'
				},
				{
					key: 'step_4_Oracle',
					name: 'Oracle',
					type: 'oracle'
				},
				{
					key: 'step_4_SQLServer',
					name: 'SQL Server',
					type: 'sqlserver'
				},
				{
					key: 'step_4_MongoDB',
					name: 'MongoDB',
					type: 'mongodb'
				},
				{
					key: 'step_4_DB2',
					name: 'DB2',
					type: 'db2'
				},
				{
					key: 'step_4_PostgresSQL',
					name: 'PostgresSQL',
					type: 'postgres'
				},
				{
					key: 'step_4_Elasticsearch',
					name: 'Elasticsearch',
					type: 'elasticsearch'
				}
			]
		},
		footerContent: {
			text: ['Tapdata支持多种不同的数据源之间的相互同步', '数据源之间的可同步详情请参考'],
			extra: {
				type: 'link',
				position: 'end',
				text: '【帮助文档】',
				style: {
					color: '#3370FF',
					cursor: 'pointer'
				}
			}
		}
	},
	{
		title: {
			text: ['好了，现在你已经完成一个数据源的添加', '只需要再添加一个数据源即可开始创建任务'],
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		imgList: {
			class: 'flex-wrap justify-center pt-5',
			items: [
				{
					key: 'step_6'
				}
			]
		},
		btnList: [
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
	},
	{
		title: {
			text: ['很好', '你已经完成了数据源的添加', '接下来，让我们开始创建你的第一个任务'],
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		imgList: {
			class: 'flex-wrap justify-center pt-5',
			items: [
				{
					key: 'step_8'
				}
			]
		},
		btnList: [
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
	},
	{
		title: {
			text: '什么是数据任务',
			style: {
				color: '#fff',
				background: '#3370FF'
			}
		},
		contentClass: 'mt-9 px-15',
		section: [
			{
				type: 'image',
				class: 'mt-3 mr-8',
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
		btnList: [
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
	},
	{
		title: {
			text: ['抱歉，在创建任务之前，我们必须向你解释', '什么是源端、目标端']
		},
		desc: {
			text: [
				'源端：数据的提供者',
				'目标端：数据的接收者',
				'Tapdata agent会成为源端与目标端的数据桥梁',
				'将源端的数据按照你的需要发送到目标端',
				'接下来，请按照你的需要，对源端、目标端进行选择'
			],
			class: 'inline-block px-16',
			style: {
				padding: '0 80px'
			}
		},
		bgImg: {
			key: 'step_10'
		},
		btnListStyle: {
			padding: '10px 0',
			background: '#fff'
		},
		btnList: [
			{
				name: '上一步',
				to: 'prev',
				class: 'prev-btn mr-10'
			},
			{
				name: '下一步',
				to: 'next',
				step: '11'
			}
		]
	}
]

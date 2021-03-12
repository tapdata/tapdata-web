import joint from '../../editor/lib/rappid/rappid';
import paperSetting from './paperSetting';
// import i18n from '../../i18n/i18n';
// import { Message } from 'element-ui';

window.joint = joint;

export default function() {
	paperSetting();

	var toolbarHeight = 50;

	var graph = new joint.dia.Graph();

	var paper = new joint.dia.Paper({
		el: document.getElementById('paper'),
		model: graph,
		width: '100%',
		height: 'calc(100% - ' + toolbarHeight + 'px)',
		gridSize: 10,
		background: { color: '#f6f6f6' },
		magnetThreshold: 'onleave',
		moveThreshold: 5,
		clickThreshold: 5,
		linkPinning: false,
		sorting: joint.dia.Paper.sorting.APPROX,
		interactive: {
			linkMove: false,
			elementMove: false
		},
		markAvailable: true,
		snapLinks: { radius: 40 },
		defaultRouter: {
			name: 'mapping',
			args: { padding: 30 }
		},
		defaultConnectionPoint: { name: 'anchor' },
		defaultAnchor: { name: 'mapping' },
		defaultConnector: {
			name: 'jumpover',
			args: { jump: 'cubic' }
		},
		highlighting: {
			magnetAvailability: {
				name: 'addClass',
				options: {
					className: 'record-item-available'
				}
			},
			connecting: {
				name: 'stroke',
				options: {
					padding: 8,
					attrs: {
						stroke: 'none',
						fill: '#7c68fc',
						'fill-opacity': 0.2
					}
				}
			}
		},
		defaultLink: function() {
			return new joint.shapes.mapping.Link();
		}
	});

	paper.on('cell:pointerclick', function(cellView) {
		if (cellView.model.isLink()) {
			graph.vcomp.flowList = cellView.model.info.dataFlows;
			graph.vcomp.dialogFormVisible = true;
		} else {
			graph.vcomp.connectionId = cellView.model.connection.id;
			graph.vcomp.databaseType = cellView.model.connection.database_type;
			graph.vcomp.previewVisible = true;
		}
	});

    paper.on('cell:pointerclick', function(cellView) {
		if (cellView.model.isLink()) {
			graph.vcomp.flowList = cellView.model.info.dataFlows;
			graph.vcomp.dialogFormVisible = true;
		} else {
			graph.vcomp.connectionId = cellView.model.connection.id;
			graph.vcomp.databaseType = cellView.model.connection.database_type;
			graph.vcomp.previewVisible = true;
		}
	});
	const paperScroller = (this.paperScroller = new joint.ui.PaperScroller({
		paper: paper,
		autoResizePaper: true,
		cursor: 'grab',
		contentOptions: function(paperScroller) {
			let visibleArea = paperScroller.getVisibleArea();
			return {
				padding: {
					bottom: visibleArea.height / 2,
					top: visibleArea.height / 2,
					left: visibleArea.width / 2,
					right: visibleArea.width / 2
				},
				allowNewOrigin: 'any'
			};
		}
	}));
	$('#paper').append(paperScroller.render().el);
	paper.on('blank:pointerdown', paperScroller.startPanning);

	return {
		joint: joint,
		graph: graph,
		draw: function(rdatas, linkdatas, vcomp) {
			graph.vcomp = vcomp;
			rdatas.forEach(table => {
				var node = new joint.shapes.mapping.Record({ items: [[table.items[0]]] });
				linkdatas.map((link, idx, linkdatas) => {
					if (link.source.id == table.id) linkdatas[idx].source.id = node.id;
					if (link.target.id == table.id) linkdatas[idx].target.id = node.id;
				});
				node.setName(table.label);
				node.connection = table.connection;
				if (table.id == vcomp.tableId) {
					node.attr('header/fill', '#d0d8e8');
				}
				node.addTo(graph);
				node.toggleItemCollapse(table.items[0].id);
			});

			var links = linkdatas.map(link => {
				let res = new joint.shapes.mapping.Link({
					source: { id: link.source.id, port: link.source.port },
					target: { id: link.target.id, port: link.target.port }
					// labels: [
					// 	{
					// 		attrs: { text: { text: link.dataFlows[0].name } }
					// 	}
					// ]
				});
				res.info = link;
				return res;
			});

			links.forEach(function(link) {
				link.addTo(graph);
			});
			joint.layout.DirectedGraph.layout(graph, {
				setLinkVertices: false,
				rankDir: 'LR',
				marginX: 100,
				marginY: 100,
				// resizeToFit: true,
				nodeSep: 230,
				edgeSep: 10,
				rankSep: 80,
				// ranker: 'tight-tree',
				// align: "UL",
				resizeClusters: true
				//clusterPadding: { top: 50, left: 35, right: 35, bottom: 20 }
			});
		}
	};
}

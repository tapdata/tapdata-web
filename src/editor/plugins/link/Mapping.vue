<template>
	<div class="e-mapping" ref="mappingContainer">
		<div class="e-source" ref="sourceContainer">
			<Entity ref="sourceEntity" :schema="sourceSchema"></Entity>
		</div>
		<div class="e-space"></div>
		<div class="e-target" ref="targetContainer">
			<Entity ref="targetEntity" :schema="targetSchema"></Entity>
		</div>
	</div>
</template>

<script>
import Entity from './Entity';
import { LeaderLine } from '../../../../static/js/leader-line';
import _ from 'lodash';
import { convertSchemaToTreeData } from '../../util/Schema';
import log from '../../../log';

export default {
	name: 'Mapping',
	components: { Entity },

	props: {},

	data() {
		let data = {
			sourceSchema: {},
			targetSchema: {},
			tables: {}
		};
		return data;
	},

	watch: {
		targetSchema: {
			deep: true,
			handler() {
				this.position();
			}
		}
	},

	mounted() {
		this.lines = this.lines || [];

		if (this.lines.length > 0) {
			this.lines.forEach(line => {
				line.remove();
			});
			this.lines.splice(0, this.lines.length);
		}

		if (this.sourceSchema) this.createLine(this.sourceSchema.fields);
		let _position = _.throttle(this.position.bind(this), 150, {
			leading: true,
			trailing: false
		});
		this.$refs.sourceContainer.addEventListener('scroll', _position);
		this.$refs.targetContainer.addEventListener('scroll', _position);
		this.$refs.sourceEntity.$on('expand', this.position.bind(this));
		this.$refs.sourceEntity.$on('collapse', this.position.bind(this));
		this.$refs.sourceEntity.$on('drop', this.position.bind(this));
		this.$refs.targetEntity.$on('expand', this.position.bind(this));
		this.$refs.targetEntity.$on('collapse', this.position.bind(this));
		this.$refs.targetEntity.$on('drop', this.position.bind(this));
		this.$on('resize', _position);
	},

	methods: {
		hide() {
			if (this.lines && this.lines.length > 0) {
				this.lines.forEach(line => line.hide('none'));
			}
		},

		show() {
			if (this.lines && this.lines.length > 0) {
				this.lines.forEach(line => {
					line.show('none');
					line.position();
				});
			}
		},

		isVisible(portDom) {
			let container = this.$refs.mappingContainer;
			let containerClientRect = container.getBoundingClientRect();
			let portClientRect = portDom.getBoundingClientRect();
			// log('Mapping.isVisible(containerClientRect, portClientRect)', containerClientRect, portClientRect);

			return portClientRect.top - containerClientRect.top >= 0;
		},

		position() {
			let self = this;
			setTimeout(() => {
				if (self.lines && self.lines.length > 0) {
					for (let i = 0; i < self.lines.length; i++) {
						let line = self.lines[i];
						if (self.isConnected(line.end) && self.isConnected(line.start)) {
							if (self.isVisible(line.end) && self.isVisible(line.start)) {
								line.show('draw');
								line.position();
							} else {
								line.hide('draw');
							}
						} else {
							line.remove();
							self.lines.splice(i, 1);
							i--;
						}
					}
				}
			}, 50);
		},

		createLine(tables) {
			if (!tables) return;
			let self = this;

			let tableNames = Object.keys(tables);
			for (let i = 0; i < tableNames.length; i++) {
				let tableName = tableNames[i];
				let table = tables[tableName];
				let sourceEl = self.$refs.sourceEntity.getOutPortByTable(table);
				let targetEl = self.$refs.targetEntity.getInPortByTable(table);

				if (sourceEl && targetEl && self.isConnected(sourceEl) && self.isConnected(targetEl)) {
					let line = new LeaderLine({
						start: sourceEl,
						end: targetEl,
						startSocket: 'right',
						endSocket: 'left',
						color: table.color || '#8cc6e8',
						// dash: {animation: true},
						startPlug: 'square',
						endPlug: 'arrow1',
						size: 1
					});
					self.lines.push(line);
					line.position();
				}

				if (Array.isArray(table.children) && table.children.length > 0) {
					self.createLine(table.children);
				}
			}
		},

		isConnected(dom) {
			return !(dom.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED);
		},

		/**
		 * render all source schema and target schema
		 * @param sourceSchema
		 * @param targetSchema
		 */
		setSchema(sourceSchema, targetSchema) {
			log('Mapping.setSchema', sourceSchema, targetSchema);

			let source = convertSchemaToTreeData(sourceSchema);
			let target = convertSchemaToTreeData(targetSchema);

			this.targetSchema = _.cloneDeep(target);
			this.sourceSchema = _.cloneDeep(source);
			if (source && source.fields) {
				source.fields.forEach(field => {
					if (!this.tables[field.table_name]) {
						this.tables[field.table_name] = {
							color: field.color,
							table_name: field.table_name
						};
					}
				});
			}

			if (this.tables) {
				this.$nextTick(() => {
					this.createLine(this.tables);
				});
			}
		}
	},

	destroyed() {
		if (this.lines && this.lines.length > 0) {
			this.lines.forEach(line => line.remove());
		}
	}
};
</script>

<style lang="less" scoped>
.e-mapping {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	height: 100%;

	.e-space {
		max-width: 60px;
		width: 10%;
	}
	.e-source,
	.e-target {
		flex: 1;
		height: 100%;

		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;

		overflow: auto;
		padding: 2px;
	}
}
</style>

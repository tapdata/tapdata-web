<template>
	<div class="e-mapping">

		<div class="e-source" ref="sourceContainer">
			<Entity ref="sourceEntity" :schema="sourceSchema"></Entity>
		</div>
		<div class="e-space"></div>
		<div class="e-target" ref="targetContainer">
			<Entity ref="targetEntity" :schema="targetSchema" editable></Entity>
		</div>

	</div>
</template>

<script>
	import Entity from './Entity';
	import {LeaderLine} from '../../../../static/js/leader-line';
	import _ from 'lodash';
	import { convertSchemaToTreeData, mergeSourceSchema, mergeJoinTablesToTargetSchema } from './Schema';
	import log from '../../../log';

	export default {
		name: "Mapping",
		components: {Entity},

		props: {

		},

		data() {
			let data = {
				sourceSchema: {},
				targetSchema: {},
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

			if( this.lines.length > 0 ){
				this.lines.forEach(line => {
					line.remove();
				});
				this.lines.splice(0, this.lines.length);
			}

			if( this.sourceSchema )
				this.createLine( this.sourceSchema.fields );
			let _position = _.throttle(this.position.bind(this), 150, {leading: true, trailing: false});
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

			hide(){
				if( this.lines && this.lines.length > 0) {
					this.lines.forEach(line => line.hide('none'));
				}
			},

			show() {
				if( this.lines && this.lines.length > 0) {
					this.lines.forEach(line => {
						line.show('none');
						line.position();
					});
				}
			},

			position(){
				let self = this;
				setTimeout(() => {
					if( self.lines && self.lines.length > 0 ){
						for (let i = 0; i < self.lines.length; i++) {
							let line = self.lines[i];
							if( self.isConnected(line.end) && self.isConnected(line.start))
								line.position();
							else{
								line.remove();
								self.lines.splice(i, 1);
								i--;
							}
						}
					}
				}, 50);
			},

			createLine(fields){
				if( !fields ) return;
				let self = this;

				for (let i = 0; i < fields.length; i++) {
					let field = fields[i];
					let sourceEl = self.$refs.sourceEntity.getOutPortByField(field);
					let targetEl = self.$refs.targetEntity.getInPortByField(field);

					if(
						sourceEl && targetEl
						&& self.isConnected(sourceEl) && self.isConnected(targetEl)
					){
						let line = new LeaderLine({
							start: sourceEl,
							end: targetEl,
							startSocket: 'right',
							endSocket: 'left',
							color: field.color || '#8cc6e8',
							//dash: {animation: true},
							startPlug: 'square',
							endPlug: 'arrow1',
							size: 2,
						});
						self.lines.push(line);
						line.position();

					}

					if( Array.isArray(field.children) && field.children.length > 0) {
						self.createLine(field.children);
					}
				}
			},

			isConnected(dom) {
				return !(dom.compareDocumentPosition(document) & Node.DOCUMENT_POSITION_DISCONNECTED);
			},

			/**
			 * render all source schema and target schema
			 * @param targetSchema
			 * @param joinTable
			 * @param otherJoinTables
			 */
			setSchema(targetSchema, joinTable, otherJoinTables){

				log.log(targetSchema, joinTable, otherJoinTables);

				// 1. Merge target schema based on joinTables
				// 2. Merge multiple source schema
				// 3. Convert schema to tree data for render

				let mergedSourceSchema = mergeSourceSchema(joinTable.sourceSchemas || []);
				log.log('mergedSourceSchema:', mergedSourceSchema);

				let mergedTargetSchema = mergeJoinTablesToTargetSchema(_.cloneDeep(targetSchema), [_.cloneDeep(joinTable)].concat(_.cloneDeep(otherJoinTables)));
				log.log('mergedTargetSchema:', mergedTargetSchema);

				let source = convertSchemaToTreeData(mergedSourceSchema);
				let target = convertSchemaToTreeData(mergedTargetSchema);

				log.log('target:',target, 'source:', source);

				this.targetSchema = _.cloneDeep(target);
				this.sourceSchema = _.cloneDeep(source);

				this.$nextTick(() => {
					this.createLine( this.sourceSchema.fields );
				});
			},
		},

		destroyed() {
			if( this.lines && this.lines.length > 0){
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
		.e-source, .e-target {
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

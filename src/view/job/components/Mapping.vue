<template>
	<div class="e-mapping">

		<div class="e-source" ref="sourceContainer">
			<Entity ref="sourceEntity" :schema="sourceSchema"></Entity>
		</div>
		<div class="e-space"></div>
		<div class="e-target" ref="targetContainer">
			<Entity ref="targetEntity" :schema="targetSchema" editable></Entity>
		</div>
		<div class="e-space"></div>

	</div>
</template>

<script>
	import Entity from './Entity';
	import {LeaderLine} from '../../../../static/js/leader-line';
	import _ from 'lodash';
	export default {
		name: "Mapping",
		components: {Entity},

		data() {
			let data = {
				sourceSchema: {
					name: 'Order',
					type: 'collection',
					fields: [{
						id: 1,
						label: 'id',
						type: 'int',
						color: '#c325c8',
					}, {
						id: 2,
						label: 'orderNo',
						type: 'string',
						color: '#c325c8',
					}, {
						id: 3,
						label: 'total_amount',
						type: 'double',
						color: '#c325c8',
					}, {
						id: 4,
						label: 'order_detail',
						type: 'array',
						color: '#8cc6e8',
						children: [{
							id: 5,
							label: 'orderNo',
							type: 'string',
							color: '#8cc6e8',
						}, {
							id: 6,
							label: 'product',
							type: 'object',
							color: '#8cc6e8',
						}, {
							id: 7,
							label: 'count',
							type: 'int',
							color: '#8cc6e8',
						}, {
							id: 8,
							label: 'price',
							type: 'double',
							color: '#8cc6e8',
						}]
					}]
				},
				targetSchema: {
					name: 'Order',
					type: 'collection',
					fields: [{
						id: 1,
						label: 'id',
						type: 'int',
						color: '#c325c8',
					}, {
						id: 2,
						label: 'orderNo',
						type: 'string',
						color: '#c325c8',
					}, {
						id: 3,
						label: 'total_amount',
						type: 'double',
						color: '#c325c8',
					}, {
						id: 4,
						label: 'order_detail',
						type: 'array',
						color: '#8cc6e8',
						children: [{
							id: 5,
							label: 'orderNo',
							type: 'string',
							color: '#8cc6e8',
						}, {
							id: 6,
							label: 'product',
							type: 'object',
							color: '#8cc6e8',
						}, {
							id: 7,
							label: 'count',
							type: 'int',
							color: '#8cc6e8',
						}, {
							id: 8,
							label: 'price',
							type: 'double',
							color: '#8cc6e8',
						}]
					}]
				},
			};
			/*for( let i = 9; i < 1000; i++) {
				data.sourceSchema.fields[3].children.push({
					id: i,
					label: 'price' + i,
					type: 'double',
					color: '#8cc6e8'
				});
				data.targetSchema.fields[3].children.push({
					id: i,
					label: 'price' + i,
					type: 'double',
					color: '#8cc6e8'
				});
			}*/
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
							if( line.end.isConnected && line.start.isConnected)
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
				let self = this;

				for (let i = 0; i < fields.length; i++) {
					let field = fields[i];
					let sourceEl = self.$refs.sourceEntity.getOutPortByField(field);
					let targetEl = self.$refs.targetEntity.getInPortByField(field);

					if( sourceEl && targetEl){
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
			}
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
			justify-content: center;
			align-items: start;

			overflow: auto;
		}


	}
</style>

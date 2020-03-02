/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import joint from './lib/rappid/rappid';
import _ from "lodash";

export const renderForm = function(cell, container) {

	// let id = cell.id;
	// let cellType = cell.get('type');
	let data = cell.get('custom_data') || {};

	cell.set('custom_data', Object.assign(data, {
		connection_id: ''
	}));

	joint.ui.Inspector.create(container, _.extend({
		cell: cell
	}, {
		custom_data: {
			inputs: {
				custom_data: {
					type: 'object',
					properties: {
						connection_id: {
							type: 'text'
						}
					}
				}
			},
			groups: {
				connection: {
					label: 'Data Source',
					index: 1
				}
			}
		}
	}));

};

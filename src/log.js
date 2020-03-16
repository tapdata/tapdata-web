/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/15/20
 * @description
 */
let counter = 0;
export default {
	log: function () {
		window['console'].error(++counter, ...arguments);
	}
};

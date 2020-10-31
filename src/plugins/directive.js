import Vue from 'vue';
Vue.directive('readonlybtn', {
	inserted: function(el, binding) {
		const value = binding.value;
		const btnFalg = localStorage.getItem('BTN_AUTHS') || '';

		if (btnFalg === value) {
			el.parentNode.removeChild(el);
		}
	}
});

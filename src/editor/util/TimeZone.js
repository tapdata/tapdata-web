function initTimezones() {
	let timezones = ['(Database Timezone)'];

	for (let i = -11; i < 15; i++) {
		let timezone = '';
		if (i >= -9 && i <= 9) {
			timezone = '0' + Math.abs(i);
		} else {
			timezone = Math.abs(i);
		}
		timezone += ':00';

		if (i < 0) {
			timezone = '-' + timezone;
		} else {
			timezone = '+' + timezone;
		}

		timezones.push(timezone);
	}

	return timezones;
}

export { initTimezones };

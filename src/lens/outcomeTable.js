const outcomeTable = {
	getTotalWeighting(table) {
		let total = 0;
		for (const {weighting} of table) {
			total += weighting;
		}
		return total;
	},
	pickOutcome(table, rn) {
		let runningWeighting = 0;
		for (const outcome of table) {
			runningWeighting += outcome.weighting;
			if (rn < runningWeighting) {
				return outcome;
			}
		}
		throw new Error('Random number pick exceeds total weighting of outcome table');
	}
};

export default outcomeTable;

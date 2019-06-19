import { IView, IViewItem, IDirectiveScopeInternal, IModelController } from '../definitions';
import { IProviderOptions } from '../provider';
import { isValidMoment } from '../utility';

export default class DayView implements IView {
	public perLine: number = 4;
	public rows: { [index: number]: IViewItem[] } = {};

	constructor(
		private $scope: IDirectiveScopeInternal,
		private $ctrl: IModelController,
		private provider: IProviderOptions) { }

	public render(): string {
		let hour = this.$scope.view.moment.clone().startOf('day').hour(this.provider.hoursStart);

		this.rows = {};
		for (let h = 0; h <= this.provider.hoursEnd - this.provider.hoursStart; h++) {
			let index = Math.floor(h / this.perLine),
				selectable = this.$scope.limits.isSelectable(hour, 'hour');

			if (!this.rows[index]) this.rows[index] = [];
			const year = this.$scope.shamsi ? hour.jYear() : hour.year();
			const month = this.$scope.shamsi ? hour.jMonth() : hour.month();
			const date = this.$scope.shamsi ? hour.jDate() : hour.date();
			this.rows[index].push({
				index: h, // this is to prevent DST conflicts
				label: hour.format(this.provider.hoursFormat),
				year,
				month,
				date,
				hour: hour.hour(),
				class: [
					this.$scope.keyboard && hour.isSame(this.$scope.view.moment, 'hour') ? 'highlighted' : '',
					!selectable ? 'disabled' : isValidMoment(this.$ctrl.$modelValue) && hour.isSame(this.$ctrl.$modelValue, 'hour') ? 'selected' : ''
				].join(' ').trim(),
				selectable: selectable
			});
			hour.add(1, 'hours');
		}
		// return title
		if (this.$scope.shamsi) {
			return this.$scope.view.moment.format(' jD - jMMMM - jYYYY');	
		}
		return this.$scope.view.moment.format('MMMM Do YYYY');
	}

	public set(hour: IViewItem): void {
		if (!hour.selectable) return;
		if (this.$scope.shamsi) {
			this.$scope.view.moment.jYear(hour.year).jMonth(hour.month).jDate(hour.date).hour(hour.hour);
		} else {
			this.$scope.view.moment.year(hour.year).month(hour.month).date(hour.date).hour(hour.hour);
		}
		this.$scope.view.update();
		this.$scope.view.change('hour');
	}
}
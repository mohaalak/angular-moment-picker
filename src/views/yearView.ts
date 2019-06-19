import * as moment from 'moment';
import { IView, IViewItem, IDirectiveScopeInternal, IModelController } from '../definitions';
import { IProviderOptions } from '../provider';
import { isValidMoment } from '../utility';

class YearView implements IView {
	public perLine: number = 4;
	public rows: { [index: number]: IViewItem[] } = {};

	constructor(
		private $scope: IDirectiveScopeInternal,
		private $ctrl: IModelController,
		private provider: IProviderOptions) { }

	public render(): string {
		let yearFormat = "year";
		let month = this.$scope.view.moment.clone().startOf('year');
		if(this.$scope.shamsi) {
			month = this.$scope.view.moment.clone().startOf('jYear');
		}
		let months = moment.monthsShort();
		this.rows = {};
		months.forEach((label, i) => {
			let index = Math.floor(i / this.perLine),
				selectable = this.$scope.limits.isSelectable(month, 'month');
			const year = this.$scope.shamsi ? month.jYear() : month.year();
			const monthId = this.$scope.shamsi ? month.jMonth() : month.month();
			if (!this.rows[index]) this.rows[index] = [];
			this.rows[index].push(<IViewItem>{
				index: monthId,
				label: month.format(this.$scope.shamsi? "j" + this.provider.monthsFormat : this.provider.monthsFormat),
				year,
				month: monthId,
				class: [
					this.$scope.keyboard && month.isSame(this.$scope.view.moment, 'month') ? 'highlighted' : '',
					!selectable ? 'disabled' : isValidMoment(this.$ctrl.$modelValue) && month.isSame(this.$ctrl.$modelValue, 'month') ? 'selected' : ''
				].join(' ').trim(),
				selectable: selectable
			});
			if(this.$scope.shamsi) {
				month.add(1, 'jMonth');
			} else {
				month.add(1, 'months');
			}
			
		});
		// return title
		if (this.$scope.shamsi) {
			return this.$scope.view.moment.format('jYYYY');
		}
		return this.$scope.view.moment.format('YYYY');
	}

	public set(month: IViewItem): void {
		if (!month.selectable) return;
		if (this.$scope.shamsi){
			this.$scope.view.moment.jYear(month.year).jMonth(month.month);
		} else {
			this.$scope.view.moment.year(month.year).month(month.month);
		}
		
		this.$scope.view.update();
		this.$scope.view.change('month');
	}
}

export default YearView;
import { IView, IViewItem, IDirectiveScopeInternal, IModelController } from '../definitions';
import { IProviderOptions } from '../provider';
import { isValidMoment } from '../utility';

export default class DecadeView implements IView {
	public perLine: number = 4;
	public rows: { [index: number]: IViewItem[] } = {};

	constructor(
		private $scope: IDirectiveScopeInternal,
		private $ctrl: IModelController,
		private provider: IProviderOptions) { }
	
	public render(): string {
		let year = this.$scope.view.moment.clone();
		let	firstYear;
		if (this.$scope.shamsi) {
			firstYear = Math.floor(year.jYear() / 10) * 10 - 1;		
			year.jYear(firstYear);
		} else {
			firstYear = Math.floor(year.year() / 10) * 10 - 1;		
			year.year(firstYear);
		}
	
		this.rows = {};
	
		for (let y = 0; y < 12; y++) {
			let index = Math.floor(y / this.perLine),
				selectable = this.$scope.limits.isSelectable(year, 'year');

			if (!this.rows[index]) this.rows[index] = [];
			const yearIndex = this.$scope.shamsi ? year.jYear() : year.year();
			this.rows[index].push(<IViewItem>{
				index: yearIndex,
				label: year.format(this.$scope.shamsi ? "j" + this.provider.yearsFormat : this.provider.yearsFormat),
				year: yearIndex,
				class: [
					this.$scope.keyboard && year.isSame(this.$scope.view.moment, 'year') ? 'highlighted' : '',
					!selectable || [0, 11].indexOf(y) >= 0 ? 'disabled' : isValidMoment(this.$ctrl.$modelValue) && year.isSame(this.$ctrl.$modelValue, 'year') ? 'selected' : ''
				].join(' ').trim(),
				selectable: selectable
			});
			if (this.$scope.shamsi) {
				year.add(1, 'jYear');
			} else {
				year.add(1, 'years');
			}
			
		}
		// return title
		if (this.$scope.shamsi) {
			return [year.subtract(2, 'jYear').format('jYYYY'), year.subtract(9, 'jYear').format('jYYYY')].reverse().join(' - ');	
		}
		return [year.subtract(2, 'years').format('YYYY'), year.subtract(9, 'years').format('YYYY')].reverse().join(' - ');
	}

	public set(year: IViewItem): void {
		if (!year.selectable) return;
		if (this.$scope.shamsi) {
			this.$scope.view.moment.jYear(year.year);
		}else {
			this.$scope.view.moment.year(year.year);
		}
		
		this.$scope.view.update();
		this.$scope.view.change('year');
	}
}
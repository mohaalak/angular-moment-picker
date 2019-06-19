import * as angular from 'angular';
import { IView, IViewItem, IDirectiveScopeInternal, IModelController } from '../definitions';
import { IProviderOptions } from '../provider';
import { isValidMoment } from '../utility';

export default class MinuteView implements IView {
	public perLine: number = 6;
	public rows: { [index: number]: IViewItem[] } = {};

	constructor(
		private $scope: IDirectiveScopeInternal,
		private $ctrl: IModelController,
		private provider: IProviderOptions) { }

	public render(): string {
		let i = 0,
			second = this.$scope.view.moment.clone().startOf('minute').second(this.provider.secondsStart);

		this.rows = {};
		for (let s = 0; s <= this.provider.secondsEnd - this.provider.secondsStart; s += this.provider.secondsStep) {
			let index = Math.floor(i / this.perLine),
				selectable = this.$scope.limits.isSelectable(second, 'second');

			if (!this.rows[index]) this.rows[index] = [];
			const year = this.$scope.shamsi ? second.jYear() : second.year();
			const month = this.$scope.shamsi ? second.jMonth() : second.month();
			const date = this.$scope.shamsi ? second.jDate() : second.date();
			this.rows[index].push(<IViewItem>{
				index: second.second(),
				label: second.format(this.provider.secondsFormat),
				year,
				month,
				date,
				hour: second.hour(),
				minute: second.minute(),
				second: second.second(),
				class: [
					this.$scope.keyboard && second.isSame(this.$scope.view.moment, 'second') ? 'highlighted' : '',
					!selectable ? 'disabled' : isValidMoment(this.$ctrl.$modelValue) && second.isSame(this.$ctrl.$modelValue, 'second') ? 'selected' : ''
				].join(' ').trim(),
				selectable: selectable
			});
			i++;
			second.add(this.provider.secondsStep, 'seconds');
		}
		if (this.$scope.keyboard) this.highlightClosest();
		// return title
		if (this.$scope.shamsi) {
			return this.$scope.view.moment.clone().startOf('minute').format('jMMM jD jYYYY h:mm A');
		} 
		return this.$scope.view.moment.clone().startOf('minute').format('lll');
	}

	public set(second: IViewItem): void {
		if (!second.selectable) return;
		if (this.$scope.shamsi) {
			this.$scope.view.moment.jYear(second.year).jMonth(second.month).jDate(second.date).hour(second.hour).minute(second.minute).second(second.second);
		} else {
			this.$scope.view.moment.year(second.year).month(second.month).date(second.date).hour(second.hour).minute(second.minute).second(second.second);
		}
		
		this.$scope.view.update();
		this.$scope.view.change();
	}

	public highlightClosest(): void {
		let seconds = <IViewItem[]>[], second;
		angular.forEach(this.rows, (row) => {
			angular.forEach(row, (value) => {
				if (Math.abs(value.second - this.$scope.view.moment.second()) < this.provider.secondsStep) seconds.push(value);
			});
		});
		second = seconds.sort((value1, value2) => {
			return Math.abs(value1.second - this.$scope.view.moment.second()) > Math.abs(value2.second - this.$scope.view.moment.second()) ? 1 : 0;
		})[0];
		if (!second || second.second - this.$scope.view.moment.second() == 0) return;
		this.$scope.view.moment.year(second.year).month(second.month).date(second.date).hour(second.hour).minute(second.minute).second(second.second);
		this.$scope.view.update();
		if (second.selectable) second.class = (second.class + ' highlighted').trim();
	}
}
import * as angular from 'angular';
import * as moment from 'moment';
import { IView, IViewItem, IDirectiveScopeInternal, IModelController } from '../definitions';
import { IProviderOptions } from '../provider';
import { isValidMoment } from '../utility';

export default class MonthView implements IView {
	public perLine: number = moment.weekdays().length;
	public rows: { [index: number]: IViewItem[] } = [];
	public headers: string[];

	constructor(
		private $scope: IDirectiveScopeInternal,
		private $ctrl: IModelController,
		private provider: IProviderOptions) { }

	public render(): string {
		let month: number = this.$scope.view.moment.month();
		if (this.$scope.shamsi) {
			month = this.$scope.view.moment.jMonth();
		}
		let day: moment.Moment = this.$scope.view.moment.clone().startOf('month').startOf('week').hour(12);
		if (this.$scope.shamsi) {
			day = this.$scope.view.moment.clone().startOf('jMonth').startOf('week').hour(12);
		}
		let rows: { [week: number]: IViewItem[] } = {};
		let firstWeek: number                     = day.week();
		let lastWeek: number                      = firstWeek + 5;

		this.rows = [];
		for (let week = firstWeek; week <= lastWeek; week++)
			rows[week] = Array.apply(null, Array(this.perLine)).map(() => {
				let selectable = this.$scope.limits.isSelectable(day, 'day');
				const year = this.$scope.shamsi ? day.jYear() : day.year();
				const monthID = this.$scope.shamsi ? day.jMonth() : day.month();
				const dateID = this.$scope.shamsi ? day.jDate() : day.date();
				let date = <IViewItem>{
					index: dateID,
					label: day.format(this.$scope.shamsi? "j" + this.provider.daysFormat :this.provider.daysFormat),
					year,
					month: monthID,
					date: dateID,
					class: [
						this.$scope.keyboard && day.isSame(this.$scope.view.moment, 'day') ? 'highlighted' : '',
						!!this.$scope.today && day.isSame(new Date(), 'day') ? 'today' : '',
						!selectable || monthID != month ? 'disabled' : isValidMoment(this.$ctrl.$modelValue) && day.isSame(this.$ctrl.$modelValue, 'day') ? 'selected' : ''
					].join(' ').trim(),
					selectable: selectable
				};
				day.add(1, 'days');
				return date;
			});
		// object to array - see https://github.com/indrimuska/angular-moment-picker/issues/9
		angular.forEach(rows, (row: IViewItem[]) => (<IViewItem[][]>this.rows).push(row));
		// render headers
		this.headers = moment.weekdays().map((d: string, i: number) => moment().locale(this.$scope.locale).startOf('week').add(i, 'day').format('dd'));
		// return title
		if(this.$scope.shamsi) {
			return this.$scope.view.moment.format('jMMMM jYYYY');
		}
		return this.$scope.view.moment.format('MMMM YYYY');
	}
	
	public set(day: IViewItem): void {
		if (!day.selectable) return;
		if (this.$scope.shamsi) {
			this.$scope.view.moment.jYear(day.year).jMonth(day.month).jDate(day.date);	
		} else {
			this.$scope.view.moment.year(day.year).month(day.month).date(day.date);	
		}
		this.$scope.view.update();
		this.$scope.view.change('day');
	}
}
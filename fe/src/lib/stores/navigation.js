import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';

import {
	defaultMetric,
	metricById,
	metricTitleById,
} from '$lib/data/metrics.js';
import {context} from '$lib/statechart/context.js';
import {objectToSearchParams, risonifyValues} from '$lib/utils/svizzle/url.js';
import {decapitalize} from '$lib/utils/svizzle/utils.js';

export const _activeViewType = writable('stats');

export const _currentMetricId = writable(defaultMetric.id);
export const _currentMetric = writable(metricById[defaultMetric.id]);
export const _currentMetricTitle = derived(
	[_activeViewType, _currentMetric],
	([activeViewType, {id, type, unitOfMeasure}]) => {
		const metricTitle = metricTitleById[id];
		const title = activeViewType === 'geo' && type === 'number'
			? `Average ${decapitalize(metricTitle)}`
			: metricTitle;
		const unitOfMeasureLabel = unitOfMeasure ? ` [${unitOfMeasure}]` : '';

		return `${title}${unitOfMeasureLabel}`;
	}
);

export const _currentPage = writable();

export const _expectedRoute = derived(
	[_activeViewType, _currentMetric],
	([activeViewType, currentMetric]) => {
		const {id, type} = currentMetric;
		return `/explorer/${type}/${activeViewType}/${id}`;
	}
);

export const _selection = writable(context.selection);

export const _searchParams = derived(
	_selection,
	selection => {
		const serialisedSelection = risonifyValues(selection);
		const searchParams = objectToSearchParams(serialisedSelection);

		return searchParams;
	}
);

import {isIterableNotEmpty} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';

import {DEFAULT_BBOX_WSEN} from '$lib/config/map.js';
import regionsByType from '$lib/data/regions.json' assert {type: 'json'};
import {_currentMetric, _selection} from '$lib/stores/navigation.js';

export const _isViewLoading = writable(false);
export const _isViewReady = writable(false);
export const _viewData = writable();

export const _showMessage = derived(
	[_isViewReady, _viewData],
	([isViewReady, viewData]) =>
		isViewReady && String(viewData?.response.code).startsWith('1')
		// see `be/README.md`: `Custom response codes`
);
export const _viewDataMessage = derived(
	_viewData,
	viewData => viewData?.response.message
);

/* geo view */

// from @svizzle/atlas/src/bin/base/NUTS/12-3_augmentShapes.js
const getWiderBbox = (bbox1, bboxRef) => [
	Math.min(bbox1[0], bboxRef[0] || Infinity),
	Math.min(bbox1[1], bboxRef[1] || Infinity),
	Math.max(bbox1[2], bboxRef[2] || -Infinity),
	Math.max(bbox1[3], bboxRef[3] || -Infinity),
];
export const _selectedBbox = derived(
	[_currentMetric, _selection],
	([currentMetric, selection]) => {
		const {geoPrefix} = currentMetric;
		const filteredRegionNames = selection.filters[`${geoPrefix}RegionNames`];

		let selectedBbox = DEFAULT_BBOX_WSEN;

		if (isIterableNotEmpty(filteredRegionNames)) {
			const filteredRegionType = selection.filters[`${geoPrefix}RegionType`];
			const targetRegionsByName = regionsByType[filteredRegionType].regions;
			const filteredRegions = _.pickIn(targetRegionsByName, filteredRegionNames);

			selectedBbox = _.reduce(_.values(filteredRegions), (acc, {bbox}) => {
				acc = getWiderBbox(bbox, acc);

				return acc;
			}, []);
		}

		return selectedBbox;
	}
);

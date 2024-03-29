<script>
	import {CustomControl, Mapbox} from '@svizzle/mapbox';
	import {
		Icon,
		Scroller,
		XCircle,
		XorNavigator,
	} from '@svizzle/ui';
	import {
		isIterableEmpty,
		isIterableNotEmpty,
		toggleItem,
	} from '@svizzle/utils';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import DismissOrApply from '$lib/components/explorer/DismissOrApply.svelte';
	import FilterPaneBorder
		from '$lib/components/explorer/FilterPaneBorder.svelte';
	import {makeOnKeyDown} from '$lib/components/svizzle/ui/handlers.js';
	import {regionTypeToLabel} from '$lib/config/labels.js';
	import {
		DEFAULT_BBOX_WSEN,
		MAPBOXGL_ACCESSTOKEN as accessToken,
		regionTypeToFeatureNameId,
	} from '$lib/config/map.js';
	import {allRegionTypes} from '$lib/data/regions.js';
	import {_mapStyle} from '$lib/stores/maps.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {
		_currThemeVars,
		_mapboxTheme,
		_xorNavigatorTheme
	} from '$lib/stores/theme.js';
	import {getName} from '$lib/utils/getters.js';
	import {
		getAncestorsRegions,
		getDescendantsRegions,
	} from '$lib/utils/regions.js';
	import {doPairItemsContainSameValues} from '$lib/utils/svizzle/utils.js';

	export let id;
	export let mapHeight = '300px';
	export let targetRegionNames;
	export let targetRegionType;

	const dispatch = createEventDispatcher();

	let hoveredRegionName = null;

	/* init props */

	$: regionNames = targetRegionNames;
	$: areAllRegionsSelected = isIterableEmpty(regionNames);
	$: regionType = targetRegionType;

	/* status */

	$: isDirty =
		regionType !== targetRegionType ||
		!doPairItemsContainSameValues([regionNames, targetRegionNames]);

	let isEdited;
	$: if (id === 'installer_geo_region') {
		isEdited = isIterableNotEmpty($_selection.filters.installerRegionNames);
	} else if (id === 'property_geo_region') {
		isEdited = isIterableNotEmpty($_selection.filters.propertyRegionNames);
	}

	/* confirmation buttons */

	const onDismiss = () => {
		regionNames = targetRegionNames;
		regionType = targetRegionType;
	};
	const onApply = () => {
		dispatch('apply', {
			regionNames: _.sort(regionNames),
			regionType
		})
	};

	/* region type change */

	const onRegionTypeChange = ({detail: selectedRegionType}) => {
		const selectedRegionTypeIndex =
			_.findIndex(allRegionTypes, _.is(selectedRegionType));
		const regionTypeIndex =
			_.findIndex(allRegionTypes, _.is(regionType));

		let selectedRegions;
		if (selectedRegionTypeIndex > regionTypeIndex) {
			selectedRegions = getDescendantsRegions({
				parentRegionsNames: regionNames,
				parentRegionsType: regionType,
				targetRegionType: selectedRegionType
			});
		} else {
			selectedRegions = getAncestorsRegions({
				childrenRegionType: regionType,
				childrenRegionsNames: regionNames,
				targetRegionType: selectedRegionType
			});
		}

		regionNames = _.map(selectedRegions, getName);
		regionType = selectedRegionType;
	}

	const toggleRegionName = name => {
		regionNames = toggleItem(regionNames, name);
	}

	const resetRegions = () => {
		regionNames = [];
	}

	/* map */

	$: featureNameId = regionTypeToFeatureNameId[regionType];
	$: getFeatureState = feature => {
		const {properties: {[featureNameId]: featureName}} = feature;

		const featureState = {
			fill: areAllRegionsSelected || regionNames.includes(featureName)
				? $_currThemeVars['--colorGeoFilterFillSelected']
				: null,
			stroke: areAllRegionsSelected || regionNames.includes(featureName)
				? $_currThemeVars['--colorGeoFilterStrokeSelected']
				: null
		};

		return featureState;
	}

	const onMouseLeave = event => {
		hoveredRegionName = null;
		event.target.getCanvas().style.cursor = '';
	}
	const onMouseMove = event => {
		if (event.target.isPointOnSurface(event.point)) {
			// eslint-disable-next-line prefer-destructuring
			const hoveredFeature = _.filter(
				event.target.queryRenderedFeatures(event.point),
				({sourceLayer}) => sourceLayer === regionType
			)[0];
			hoveredRegionName = hoveredFeature?.properties[featureNameId];
			event.target.getCanvas().style.cursor = 'pointer';
		} else {
			onMouseLeave(event);
		}
	}
	const onClick = () => {
		hoveredRegionName && toggleRegionName(hoveredRegionName);
	}

	$: eventsHandlers = [
		{
			type: 'mousemove',
			targetLayer: regionType,
			handler: onMouseMove
		},
		{
			type: 'click',
			targetLayer: regionType,
			handler: onClick
		},
		{
			type: 'mouseleave',
			targetLayer: regionType,
			handler: onMouseLeave
		}
	];

	/* list of names */

	const makeDeselectRegionName = regionName => () => {
		toggleRegionName(regionName);
	}
</script>

<FilterPaneBorder
	{isDirty}
	{isEdited}
>
	<div
		class='RegionFilter'
		style='--mapHeight:{mapHeight}'
	>
		<!-- map -->

		<div class='map'>
			<Mapbox
				{accessToken}
				{eventsHandlers}
				{getFeatureState}
				bounds={DEFAULT_BBOX_WSEN}
				isAnimated={false}
				isDblClickEnabled={false}
				isInteractive={true}
				reactiveLayersIds={[regionType]}
				style={$_mapStyle}
				theme={$_mapboxTheme}
				visibleLayersIds={['nuts21_0', regionType]}
				withScaleControl={false}
				withZoomControl={false}
			>
				<CustomControl position='bottom-right'>
					<button on:click={resetRegions}>
						Select all
					</button>
				</CustomControl>
			</Mapbox>
		</div>

		<!-- region type selector -->

		<XorNavigator
			currentValue={regionType}
			on:changed={onRegionTypeChange}
			theme={$_xorNavigatorTheme}
			valuesToLabels={regionTypeToLabel}
		/>

		<!-- hovered region -->

		<div
			class='hoveredRegion'
			class:active={hoveredRegionName}
		>
			{hoveredRegionName || 'Zoom + Pan + Click to (de)select'}
		</div>

		<!-- list of regions -->

		<div class='regionsList'>
			<Scroller>
				<ul>
					{#if areAllRegionsSelected}
						<li>
							<span>All regions selected</span>
						</li>
					{:else}
						{#each regionNames as name}
							<li>
								<span>{name}</span>
								<div
									class='iconButton'
									on:click={makeDeselectRegionName(name)}
									on:keydown={makeOnKeyDown(makeDeselectRegionName(name))}
									role='button'
									tabindex='0'
								>
									<Icon
										glyph={XCircle}
										size=20
									/>
								</div>
							</li>
						{/each}
					{/if}
				</ul>
			</Scroller>
		</div>

		<!-- confirmation buttons -->

		{#if isDirty}
			<DismissOrApply
				{onApply}
				{onDismiss}
			/>
		{/if}
	</div>
</FilterPaneBorder>

<style>
	.RegionFilter {
		display: grid;
		width: 100%;
		gap: 0.1rem;
	}

	.map {
		background-color: var(--colorMapSea);
		border: var(--border);
		height: var(--mapHeight);
		width: 100%;
	}

	.hoveredRegion {
		align-items: center;
		color: var(--colorText);
		display: flex;
		justify-content: center;
		min-height: 4em;
		text-align: center;
	}
	.hoveredRegion.active {
		color: var(--colorAuxText);
	}

	.regionsList {
		max-height: 20em;
	}

	li {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-bottom: 1em;
	}
	.iconButton {
		cursor: pointer;
	}

	.iconButton:focus-visible {
		outline: var(--outline);
		outline-offset: calc(-1 * var(--outlineWidth));
	}

	button {
		background-color: var(--colorBackground);
		border: var(--border);
		color: var(--colorText);
		white-space: nowrap;
		width: auto;
		padding: 0 0.5rem;
	}
</style>

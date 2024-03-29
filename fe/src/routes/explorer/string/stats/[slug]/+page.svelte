<script>
	import {Treemap} from  '@svizzle/hierarchy';
	import {BarchartVDiv} from '@svizzle/barchart';
	import {View} from '@svizzle/ui';
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {hsl} from 'd3-color';
	import {scaleOrdinal} from 'd3-scale';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import GridColumns from '$lib/components/svizzle/GridColumns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import {_barchartGeometry} from '$lib/stores/geometry.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_barchartsTheme} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {getItemsColorScheme} from '$lib/utils/color.js';
	import {getDocCount} from '$lib/utils/getters.js';
	import {pluckKeySorted} from '$lib/utils/svizzle/utils.js';

	const valueAccessor = getDocCount;
	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));

	let heroKey;

	const onLeafEntered = ({detail: {data, x, y}}) => {
		$_tooltip = {
			key: data.key,
			value: valueAccessor(data),
			x,
			y,
		};

		// barchart
		heroKey = data.key;
	};

	const onLeafExited = () => {
		clearTooltip();

		// barchart
		heroKey = null;
	};

	/* barchart */

	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	$: isMetricLabelPlural = $_selection.stringsTopCount > 1;
	$: metricLabel =
		`${$_currentMetric.label.toLowerCase()}${isMetricLabelPlural ? 's' : ''}`;
	$: barchartTitle = `Top ${$_selection.stringsTopCount} ${metricLabel}`;

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let barchartItems;
	let doDraw = false;
	let domain;
	let items;
	let keyToColorFn;
	let keyToColorLabelFn;

	$: if (proceed) {
		items = $_viewData?.response.data.terms?.buckets || [];

		/* colors */

		domain = pluckKeySorted(items);

		const colorScheme = getItemsColorScheme(domain);
		keyToColorFn = scaleOrdinal().domain(domain).range(colorScheme);

		const colorSchemeLabel = _.map(
			colorScheme,
			color => hsl(color).l > 0.5 ? 'black' : 'white'
		);
		keyToColorLabelFn = scaleOrdinal().domain(domain).range(colorSchemeLabel);

		/* barchart */

		barchartItems = makeBarchartItems(items) || [];

		doDraw = true;
	}
</script>

{#if doDraw}
	{#if $_isSmallScreen}
		<View id='stats'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Treemap
					{items}
					{keyToColorFn}
					{keyToColorLabelFn}
					{valueAccessor}
					on:leafExited={onLeafExited}
					on:leafHovered={onLeafEntered}
					on:leafTouchStarted={onLeafEntered}
				/>
			</GridRows>
		</View>

		<View id='legend'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<BarchartVDiv
					{keyToColorFn}
					geometry={$_barchartGeometry}
					items={barchartItems}
					shouldResetScroll={true}
					theme={$_barchartsTheme}
					title={barchartTitle}
				/>
			</GridRows>
		</View>
	{:else}
		<GridColumns
			colLayout='7fr 3fr'
			gap='1em'
		>
			<div class='col'>
				<div class='treemap'>
					<Treemap
						{items}
						{keyToColorFn}
						{keyToColorLabelFn}
						{valueAccessor}
						on:leafExited={onLeafExited}
						on:leafHovered={onLeafEntered}
						on:leafTouchStarted={onLeafEntered}
					/>
				</div>
			</div>
			<div class='col'>
				<div class='barchart'>
					<BarchartVDiv
						{keyToColorFn}
						{heroKey}
						geometry={$_barchartGeometry}
						items={barchartItems}
						shouldResetScroll={true}
						shouldScrollToHeroKey={true}
						theme={$_barchartsTheme}
						title={barchartTitle}
					/>
				</div>
			</div>
		</GridColumns>
	{/if}
{/if}

<style>
	.col {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		padding: 0;
		width: 100%;
	}
	.barchart {
		align-content: center;
		display: grid;
		height: 100%;
		overflow: hidden;
		width: 100%;
	}
	.treemap {
		height: 100%;
		width: 100%;
	}
</style>

import {_isA11yDirty} from '@svizzle/ui';
import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';

import {themeOverride} from '$lib/env';
import {makeSegmentToCssVar} from '$lib/utils/theme';

export const _isThemeEditorActive = writable(false);

const prefersDarkTheme =
	// eslint-disable-next-line no-undef
	globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches;

export const _themeName = writable(
	themeOverride || (prefersDarkTheme ? 'themeDark' : 'themeLight')
);

export const toggleTheme = () => {
	_themeName.update(
		themeName => themeName === 'themeLight' ? 'themeDark' : 'themeLight'
	)
}

export const _themeVars = writable({});

export const _themeNames = derived(
	_themeVars,
	_.pipe([
		_.keys,
		_.mapWith(
			_.invoke('replace', ['.', ''])
		)
	])
);

export const _currThemeVars = derived(
	[_themeName, _themeVars],
	([themeName, themeVars]) => themeVars?.[`.${themeName}`] || {}
);

/* components */

export const _bannersTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		border: currThemeVars['--borderAux'],
		colorBackdropSensor: currThemeVars['--colorBackdropSensor'],
		colorBackground: currThemeVars['--colorBackground'],
		colorBoxShadow: currThemeVars['--colorShadow'],
		colorText: currThemeVars['--colorText'],
	})
);

export const _barchartsTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundOpacity: 1,
		itemBackgroundColorHero: currThemeVars['--colorBarchartHeroItemBackground'],
		itemBackgroundColorHover: currThemeVars['--colorBarchartHoveredItemBackground'],
		itemBackgroundColorSelected: currThemeVars['--colorBarchartSelectedItemBackground'],
		itemBarColorDefault: currThemeVars['--colorBarchartItemBar'],
		itemBarColorHero: currThemeVars['--colorBarchartHeroItemBar'],
		itemBarColorHover: currThemeVars['--colorBarchartHoveredItemBar'],
		itemTextColorDefault: currThemeVars['--colorBarchartItemBar'],
		itemTextColorHero: currThemeVars['--colorBarchartHeroItemText'],
		itemTextColorHover: currThemeVars['--colorBarchartHoveredItemText'],
		itemTextColorSelected: currThemeVars['--colorBarchartSelectedItemText'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
		textColor: currThemeVars['--colorText'],
	})
);

export const _filtersNavigatorTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorSelectedBackground'],
		textColor: currThemeVars['--colorSelectedText'],
	})
);

export const _framesTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		frameStroke: currThemeVars['--colorBorder'],
		gridStroke: currThemeVars['--colorGrid'],
		gridStrokeDasharray: currThemeVars['--gridStrokeDasharray'],
		textColor: currThemeVars['--colorText'],
	})
);

export const _histogramsTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorBackground'],
		binFill: currThemeVars['--colorBackground'],
		binStroke: currThemeVars['--colorIcon'],
		messageColor: currThemeVars['--colorText'],
		originColor: currThemeVars['--colorIcon'],
		textColor: currThemeVars['--colorText'],
	})
);

export const _legendsTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorBackground'],
		binFill: currThemeVars['--colorBackground'], // 'white',
		messageColor: currThemeVars['--colorText'],
		textColor: currThemeVars['--colorText'],
	})
);

export const _mapboxTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _pillTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorIcon'],
		border: `thin solid ${currThemeVars['--colorBorderAux']}`,
		textColor: currThemeVars['--colorTextInverted'],
	})
);

export const _rangeSlidersTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		knobFill: currThemeVars['--colorSwitchKnob'],
		knobStroke: currThemeVars['--colorBorderAux'],
		lineColor: currThemeVars['--colorBorder'],
		textColor: currThemeVars['--colorText'],
	})
);

export const _regionKindTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorBackground'],
		border: currThemeVars['--borderAux'],
	})
);

export const _stackedBarchartTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		textColor: currThemeVars['--colorText'],
	})
);

export const _switchTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorBackground'],
		color: currThemeVars['--colorIcon'],
		knobColor: currThemeVars['--colorSwitchKnob'],
		outlineColor: currThemeVars['--colorOutline'],
	})
);

export const _tooltipTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		backgroundColor: currThemeVars['--colorBackground'],
		border: currThemeVars['--borderAux'],
		boxShadow: currThemeVars['--boxShadowY'],
		textColor: currThemeVars['--colorText'],
		zIndex: 3000,
		zIndexBackdrop: 2000,
	})
);

export const _xorNavigatorTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		border: currThemeVars['--border'],
		colorBackground: currThemeVars['--colorBackground'],
		colorIcon: currThemeVars['--colorIcon'],
		colorIconDisabled: currThemeVars['--colorIconDisabled'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
		textColor: currThemeVars['--colorText'],
	})
);

export const _xorSelectorTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		borderColor: currThemeVars['--colorBorder'],
		selectedColor: currThemeVars['--colorSelectedBackground'],
		selectedTextColor: currThemeVars['--colorSelectedText'],
		textColor: currThemeVars['--colorText'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _searchInputTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		colorIcon: currThemeVars['--colorIcon'],
		colorText: currThemeVars['--colorText'],
		outline: currThemeVars['--outline']
	})
);

/* icons */

export const _getIconColor = derived(
	_currThemeVars,
	currThemeVars => makeSegmentToCssVar(
		currThemeVars,
		'--colorIconSelected',
		'--colorIcon'
	)
);

/* links */

export const _getNavLinkColor = derived(
	_currThemeVars,
	currThemeVars => makeSegmentToCssVar(
		currThemeVars,
		'--colorNavLinkActive',
		'--colorNavLink'
	)
);

export const _linkTheme0 = derived(
	_currThemeVars,
	currThemeVars => ({
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _linkTheme1 = derived(
	_currThemeVars,
	currThemeVars => ({
		color: currThemeVars['--colorLink'],
		iconStroke: currThemeVars['--colorLink'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _linkTheme2 = derived(
	_currThemeVars,
	currThemeVars => ({
		color: currThemeVars['--colorIcon'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

export const _linkTheme3 = derived(
	_currThemeVars,
	currThemeVars => ({
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

// MetricSelector uses `:focus-within` to show the outline so the HyperLink
// component doesn't need to set it
export const _linkThemeMetricSelector = derived(
	_currThemeVars,
	() => ({
		outlineColor: 'none',
		outlineStyle: 'none',
		outlineWidth: '0',
	})
);

export const _extLinkTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		color: currThemeVars['--colorNavLink'],
		iconStroke: currThemeVars['--colorIcon'],
		outlineColor: currThemeVars['--colorOutline'],
		outlineStyle: currThemeVars['--outlineStyle'],
		outlineWidth: currThemeVars['--outlineWidth'],
	})
);

/* a11y menu & icon */

export const _a11yMenuTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		colorBackground: currThemeVars['--colorBackground'],
		colorBorder: currThemeVars['--colorBorderAux'],
		colorKnob: currThemeVars['--colorSwitchKnob'],
		colorDisabled: currThemeVars['--colorTextDisabled'],
		colorText: currThemeVars['--colorText']
	})
);
export const _a11yIconFillColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorIcon']
		: currThemeVars['--colorBackground']
);
export const _a11yIconStrokeColor = derived(
	[_currThemeVars, _isA11yDirty],
	([currThemeVars, isA11yDirty]) => isA11yDirty
		? currThemeVars['--colorBackground']
		: currThemeVars['--colorIcon']
);

/* scrollbars */

export const _scrollbarTheme = derived(
	_currThemeVars,
	currThemeVars => ({
		thumbColor: currThemeVars['--colorScrollbarThumb'],
		trackBorderColor: currThemeVars['--colorScrollbarTrackBorder'],
		trackColor: currThemeVars['--colorScrollbarTrack'],
		// TBD, include `thumbRadius` & `trackWidth`?
	})
);

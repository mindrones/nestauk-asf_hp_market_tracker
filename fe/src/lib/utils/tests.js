import * as _ from 'lamb';

// FIXME update
export const testResultsBaseURL = 'https://gist.githubusercontent.com/NestaTestUser/8fb890ee1ebf84435539faa7996b140e/raw';

const osMap = {
	'Windows': 'Windows',
	'macOS': 'OS X'
};
const browserMap = {
	'Microsoft Edge': 'Edge',
	'Chrome': 'Chrome',
	'Safari': 'Safari',
	'Firefox': 'Firefox'
};

const desktopBrowserMap = {
	Firefox: 'firefox',
	Chrome: 'chrome',
	Safari: 'safari',
}

const bowserToFilenameMap = {
	macOS: {
		os: 'OS_X',
		browserMap: desktopBrowserMap,
	},
	Windows: {
		os: 'Windows',
		browserMap: desktopBrowserMap,
	},
	/*
	Android: {
		os: 'android',
		browserMap: {
			Chrome: 'Android_Browser'
		}
	},
	iOS: {
		os: 'ios',
		browserMap: {
			Safari: 'Mobile_Safari'
		}
	},
	*/
}

export const getTestResultsFilename = environment => {
	const {os, browserMap: browsersMap} = bowserToFilenameMap[environment.os.name];
	if (!os) {
		return null;
	}
	const browser = browsersMap?.[environment.browser.name];
	if (!browser) {
		return null;
	}
	return `selenium_${os}_${browser}.json`;
}

const getOS = _.getPath('capabilities.bstack:options.os');
const getVersion = _.getPath('capabilities.bstack:options.osVersion');
const getBrowser = _.getPath('capabilities.browserName');
const getBrowserV = _.getPath('capabilities.browserVersion');

export const groupTests = _.pipe([
	_.groupBy(getOS),
	_.mapValuesWith(_.pipe([
		_.groupBy(getVersion),
		_.mapValuesWith(_.pipe([
			_.groupBy(getBrowser),
			_.mapValuesWith(_.groupBy(getBrowserV)),
		])),
	])),
]);

export const getTest = (testsIndex, env) => {
	const os = osMap[env.os.name];
	const osVersion = env.os.versionName;
	const browser = browserMap[env.browser.name];
	const browserVersion = env.browser.version.split('.').slice(0,2).join('.');
	const results = testsIndex?.[os]?.[osVersion]?.[browser]?.[browserVersion];
	return results?.[0];
};

export const summarizeResults = platform => {
	if (platform) {
		return {
			tested: true,
			passed: _.reduce(
				platform.results,
				(previousPassed, test) => previousPassed && test.result.passed[1]
			),
			// TODO add reasons for failure
			notes: [],
		};
	}
	return {
		tested: false,
		passed: false,
		notes: ['Untested platform.'],
	};
};

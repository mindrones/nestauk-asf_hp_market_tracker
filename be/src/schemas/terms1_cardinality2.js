import { maxBuckets } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'field2'],
			properties: {
				// 1
				field1: { type: 'string' },
				missing1: { type: 'string' },
				size1: {
					default: maxBuckets,
					type: 'integer',
					minimum: 1,
					maximum: maxBuckets
				},
				// 2
				field2: { type: 'string' },
				missing2: { type: 'string' },
				use_extended_stats2: {
					default: false,
					type: 'boolean'
				},
				with_percentiles2: {
					default: false,
					type: 'boolean'
				},
				with_stats2: {
					default: false,
					type: 'boolean'
				},
			}
		}
	}
};

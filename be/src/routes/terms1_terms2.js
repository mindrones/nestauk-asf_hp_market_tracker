import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTerms1Terms2 = async (request, reply) => {
	const {
		field1,
		missing1 = null,
		size1 = maxBuckets,
		use_extended_stats1,
		with_stats1 = false,
		field2,
		missing2 = null,
		size2 = maxBuckets,
		use_extended_stats2,
		with_stats2 = false,
	} = request.query;

	const stats_type1 = use_extended_stats1 ? 'extended_stats_bucket' : 'stats_bucket';
	const stats_type2 = use_extended_stats2 ? 'extended_stats_bucket' : 'stats_bucket';

	const body = {
		size: 0,
		aggs: {
			agg1: {
				terms: {
					field: field1,
					size: size1,
					...missing1 && { missing: missing1 }
				},
				aggs: {
					agg2: {
						terms: {
							field: field2,
							size: size2,
							...missing2 && { missing: missing2 }
						}
					},
					...with_stats2 && {
						stats2: {
							[stats_type2]: {
								buckets_path: 'agg2>_count'
							}
						}
					}
				}
			},
			...with_stats1 && {
				stats1: {
					[stats_type1]: {
						buckets_path: 'agg1>_count'
					}
				}
			}
		}
	};

	const result = await client.search({
		body,
		index
	});

	reply.send(result.aggregations);
};
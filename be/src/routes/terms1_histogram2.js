import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';
import { getIntervalForBins } from '../util.js';

export const getTerms1Histogram2 = async (request, reply) => {
	const {
		field1,
		missing1 = null,
		size1 = maxBuckets,
		bins2 = 10,
		field2,
	} = request.query;

	const interval = await getIntervalForBins(
		field2,
		bins2,
		request.filter
	);
	request.meta = { interval2: interval };

	const body = {
		...request.filter,
		size: 0,
		aggs: {
			terms: {
				terms: {
					field: field1,
					size: size1,
					...missing1 && { missing: missing1 }
				},
				aggs: {
					histogram: {
						histogram: {
							field: field2,
							interval,
						}
					}
				}
			}
		}
	};

	const result = await client.search({index, body});

	reply.send(result.aggregations);
};

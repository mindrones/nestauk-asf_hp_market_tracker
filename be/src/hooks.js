import rison from 'rison';

import { minDocCount } from './conf.js';
import { getDocumentCount } from './es.js';
import { makeQuery } from './filter.js';
import { calculateCoverage } from './util.js';

// eslint-disable-next-line consistent-return
export const onRequest = async (request, reply) => {

	let { field, field1, field2, filter = null } = request.query;

	/* Special routes where field is not specified */
	switch (request.routerPath) {
		case '/count':
			field = '_id' // all fields have _id so only the filter will affect outcomes
			break
		case '/certified':
			field = 'installer_id_hash'
			break
	}

	request.filter = filter
		? makeQuery(rison.decode(filter))
		: { query: { match_all: {} } };

	request.originalFilter = filter ? rison.decode(filter) : {};

	const coverageFilter = filter ? request.filter.query.bool.filter : [];
	const coverage = field
		? await calculateCoverage(coverageFilter, field, null)
		: await calculateCoverage(coverageFilter, field1, field2)
	
	reply.coverage = coverage;
	reply.noData = false;
	
	const count = coverage.filtered;
	if (count === 0) {
		reply.noData = true;
		reply.send({
			code: 100,
			message: 'No documents found for given filter'
		});
		return reply;
	}
	if (count < minDocCount) {
		reply.noData = true;
		reply.send({
			code: 101,
			data: { count },
			message: 'minDocCount threshold exceeded',
		});
		return reply; // mandatory, so the request is not executed further
	}
	
};

export const formatPayload = async (request, reply, payload) => {
	return reply.noData
		? payload
		: {
			code: 200,
			data: payload,
			coverage: reply.coverage,
			message: 'aggregation successful',
			request: {
				agg: {
					id: request.routerPath.slice(1),
					params: request.query
				},
				filter: request.filter
			},
			...request.meta && { meta: request.meta }
		};
};

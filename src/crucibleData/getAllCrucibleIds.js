import { getDefaultProvider } from '@ethersproject/providers'
import contracts from './contracts/contracts.js';
import getContract from './getContract.js';
import getCrucibleIdsFromEvents from './getCrucibleIdsFromEvents.js';
import throttler from './throttler.js';

const provider = getDefaultProvider(1,{infura:"00a5b13ef0cf467698571093487743e6"});
const crucibleFactory = getContract(contracts.CrucibleFactory, provider);

export default async function getAllCrucibleIds(withEvent = false) {
	// All Crucibles undergo a Transfer event from the Transmuter address at the time of their creation
	// Thus, we can filter for this to pick up the IDs of every Crucible
	const filter = crucibleFactory.filters.Transfer(contracts.Transmuter.address, null);
	const crucibleEvents = await throttler.queue(() => {
		return crucibleFactory.queryFilter(filter, 0, "latest");
	}, 'events');
	return getCrucibleIdsFromEvents(crucibleEvents, withEvent);
}

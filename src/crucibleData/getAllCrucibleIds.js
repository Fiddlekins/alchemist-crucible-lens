import {ethers} from 'ethers';
import contracts from './contracts/contracts.js';
import getContract from './getContract.js';
import throttler from './throttler.js';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const crucibleFactory = getContract(contracts.CrucibleFactory, provider);

export default async function getAllCrucibleIds(withEvent = false) {
	// All Crucibles undergo a Transfer event from the Transmuter address at the time of their creation
	// Thus, we can filter for this to pick up the IDs of every Crucible
	const filter = crucibleFactory.filters.Transfer(contracts.Transmuter.address, null);
	const crucibleEvents = await throttler.queue(() => {
		return crucibleFactory.queryFilter(filter, 0, "latest");
	}, 'events');
	// console.log(crucibleEvents.slice(0, 5));

	const crucibleIds = [];
	for (const event of crucibleEvents) {
		if (!event.args.tokenId) {
			console.error(`Missing tokenId arg`, event);
			continue;
		}
		const id = event.args.tokenId.toHexString()
		crucibleIds.push(withEvent ? {id, event} : id);
	}
	return crucibleIds;
}

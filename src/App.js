import React, {useEffect, useRef, useState} from 'react';
import styles from './App.module.css';
import CrucibleList from './components/CrucibleList.jsx';
import crucibleDataStore from './crucibleData/crucibleDataStore.js';

// For ease of debugging
window.crucibleDataStore = crucibleDataStore;

const url = new URL(window.location.href);
const targetAddress = url.searchParams.get('at') || '';

function updateUrl(address) {
	if (address) {
		url.searchParams.set('at', address);
	} else {
		url.searchParams.delete('at');
	}
	window.history.replaceState({address}, '', url);
}

function App() {
	const crucibleListRef = useRef(null);
	const inputRef = useRef(null);
	const [crucibles, setCrucibles] = useState([]);
	const [filterAddress, setFilterAddress] = useState(targetAddress);

	const checkShouldLoad = () => {
		if (filterAddress || !crucibleListRef.current) {
			return;
		}
		const {scrollHeight, scrollTop, clientHeight} = crucibleListRef.current;
		const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
		const threshold = window.innerHeight / 5;
		if (distanceFromBottom <= threshold) {
			const extraCount = 10 - crucibleDataStore.pendingCount;
			if (extraCount > 0) {
				crucibleDataStore.load(extraCount);
			}
		}
	};

	const filterByAddress = (address) => {
		crucibleDataStore.getCrucibleDataForAccountOrCrucibleAddress(address)
			.then((crucibles) => {
				setCrucibles(crucibles);
			})
			.catch(() => {
			});
	};

	const loadedCount = crucibleDataStore.loadedCount;
	useEffect(() => {
		if (filterAddress) {
			filterByAddress(filterAddress)
			return;
		}
		const crucibleLoadedCallback = () => {
			setCrucibles(crucibleDataStore.getAllLoadedCrucibleData());
		};
		crucibleDataStore.addCrucibleLoadedCallback(crucibleLoadedCallback);
		checkShouldLoad();
		return function cleanup() {
			crucibleDataStore.removeCrucibleLoadedCallback(crucibleLoadedCallback);
		}
	}, [loadedCount, filterAddress]);


	const onScroll = () => {
		checkShouldLoad();
	};

	const onChange = (e) => {
		const address = e.target.value;
		updateUrl(address);
		setFilterAddress(address);
	};

	const onClick = () => {
		const address = '';
		updateUrl(address);
		setFilterAddress(address);
	};

	return (
		<div className={styles.main}>
			<div className={styles.header}>
				<input className={styles.input} ref={inputRef} type="text" onChange={onChange}
					   value={filterAddress} placeholder="Enter account or Crucible address"/>
				<span className={styles.clearButton} onClick={onClick}>Clear</span>
			</div>
			<CrucibleList crucibles={crucibles} passedRef={crucibleListRef} onScroll={onScroll}/>
		</div>
	);
}

export default App;

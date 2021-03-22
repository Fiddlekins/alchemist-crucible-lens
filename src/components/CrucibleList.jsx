import React from 'react';
import Crucible from './Crucible.jsx';
import styles from './CrucibleList.module.css';

export default function CrucibleList({crucibles, passedRef, onScroll}) {
	return (
		<div className={styles.main} ref={passedRef} onScroll={onScroll}>
			{crucibles.map((crucible) => {
				return <Crucible key={crucible.id} data={crucible}/>
			})}
		</div>
	);
}

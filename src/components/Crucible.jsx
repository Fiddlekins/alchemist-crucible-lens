import {formatUnits} from "ethers/lib/utils";
import React from 'react';
import logBaseN from '../lens/logBaseN.js';
import outcomeTable from '../lens/outcomeTable.js';
import alchemicalSymbols from '../lens/outcomeTables/alchemicalSymbols.json';
import PRNG from '../lens/PRNG.js';
import styles from './Crucible.module.css';

export default function Crucible({data}) {
	const {
		id,
		owner,
		timestamp
	} = data;

	let lockedBalance = 0;
	try {
		lockedBalance = formatUnits(data.lockedBalance.toString());
	} catch (err) {
		// don't care
	}

	const date = new Date(timestamp);

	// Use log scaling to bring a wide range of balance values into something we can use linearly
	// lockedBalance is usually too big to convert to JS Number, requires dividing by 1e18 to be expressed in ETH magnitude units too
	// .div(1e18) fails because 1e18 is too big for JS, but .div(1e9).div(1e9) works
	// Only .div(1e9).div(1e9) doesn't work because the division truncates decimals, causing the final output to be rounded
	// We can work around this by dividing once by 1e9 to bring it into range that JS Numbers can handle it, then do the second division in JS Numbers
	// This preserves a reasonable number of decimal values to suit our purposes
	const balanceScaled = logBaseN(2, ((data.lockedBalance.div(1e9).toNumber()) / 1e9) + 1);

	const prng = new PRNG(id);
	const mainHues = [];
	let hueCount = 1 + prng.randomInt('colors', 3);
	while (hueCount) {
		hueCount--;
		mainHues.push(prng.randomInt('colors', 360));
	}

	const alchemicalSymbolsTotalWeighting = outcomeTable.getTotalWeighting(alchemicalSymbols);
	let symbols = [];
	let count = 9 + prng.randomInt('structure', 4);
	while (count) {
		count--;
		const rn = prng.randomInt('structure', alchemicalSymbolsTotalWeighting);
		const symbol = outcomeTable.pickOutcome(alchemicalSymbols, rn).symbol;
		const hueJitter = Math.floor((60 / (1 + balanceScaled)) * (0.5 - prng.randomFloat('colors')));
		const hueBase = mainHues[prng.randomInt('colors', mainHues.length)];
		const saturation = 20 + (4 * balanceScaled) + Math.min(prng.randomInt('colors', 50), 100);
		const lightness = 5 + (3 * balanceScaled) + Math.min(prng.randomInt('colors', 15), 50);
		const color = `hsl(${hueBase + hueJitter}deg ${saturation}% ${lightness}%)`;
		symbols.push({symbol, color});
	}
	const mainSymbol = symbols.shift();

	const animationPeriod = balanceScaled > 0 ? 20 / balanceScaled : 0;

	return (
		<div className={styles.main}>
			<div className={styles.lensContainer}>
				<div className={styles.lensBackgroundContainer} style={{opacity: 0.75 + (balanceScaled / 30)}}>
					<div className={styles.lensBackground} style={{
						backgroundColor: mainSymbol.color,
						boxShadow: `0 0 8vh 8vh ${mainSymbol.color}`,
						animationDuration: `${animationPeriod}s`,
						transform: `translate(-50%, -50%) scale(${0.75 + (balanceScaled / 30)})`
					}}/>
				</div>
				<div className={styles.rotate} style={{animationDuration: `${animationPeriod}s`}}>
					{symbols.map(({symbol, color}, i) => {
						const r = 100;
						const t = 2 * Math.PI * (i / symbols.length);
						const x = Math.cos(t) * r;
						const y = Math.sin(t) * r;
						const style = {
							top: `${y}px`,
							left: `${x}px`,
							transform: `translate(-50%, -50%) rotate(${t - (Math.PI / 2)}rad)`,
							color: color
						};
						return <div key={i} className={styles.symbol} style={style}>{symbol}</div>
					})}
				</div>
				<div className={styles.symbolMain} style={{color: mainSymbol.color}}>{mainSymbol.symbol}</div>
			</div>
			<div className={styles.stats}>
				<div>ID: {id}</div>
				<div>Owner: {owner}</div>
				<div>Locked Balance: {lockedBalance}</div>
				<div>Timestamp: {timestamp}</div>
				<div>Date: {date.toDateString()}</div>
			</div>
		</div>
	);
}

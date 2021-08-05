import { sequenceOf, asSequence, Sequence } from './sequences';

let sq = sequenceOf(2, 3, 4, 6, 7, 8, 10)
	.select(x => x * 2)
	.where(x => x % 2 === 0);

for (let i of sq) {
	console.log(i);
}

sq = sequenceOf(2, 3, 4, 6, 7, 8, 10).select(x => x / 2);

console.log(sq.first(x => x > 3));

let gsq = sequenceOf(
	{ x: 10, y: 30 },
	{ x: 20, y: 10 },
	{ x: 30, y: 5 },
	{ x: 10, y: 15 },
	{ x: 20, y: 56 },
).groupBy(item => item.x);

for (let i of gsq) {
	console.log(`key: ${i.key}`);
}

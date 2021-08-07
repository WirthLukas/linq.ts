import { sequenceOf, asSequence, Sequence } from './sequences';

// let sq = sequenceOf(2, 3, 4, 6, 7, 8, 10)
// 	.select(x => x * 2)
// 	.where(x => x % 2 === 0);

// for (let i of sq) {
// 	console.log(i);
// }

// sq = sequenceOf(2, 3, 4, 6, 7, 8, 10).select(x => x / 2);

// console.log(sq.first(x => x > 3));

let pointSq = sequenceOf(
	{ x: 10, y: 30 },
	{ x: 20, y: 10 },
	{ x: 30, y: 5 },
	{ x: 10, y: 15 },
	{ x: 20, y: 56 },
);

// let gsq = pointSq.groupBy(item => item.x);

// for (let i of gsq) {
// 	console.log(`key: ${i.key}`);
// }

let sq2 = pointSq.select(p => p.y).where(i => i > 15);

for (let p of sq2) {
	console.log(p);
}

pointSq
	.groupBy(p => p.x)
	.select(grp => {
		return {
			x: grp.key,
			ys: grp.count(),
		};
	})
	.forEach(i => console.log(`x: ${i.x}, #y: ${i.ys}`));

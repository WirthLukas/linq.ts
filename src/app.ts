import { sequenceOf, asSequence, Sequence } from './sequences';

let sq = sequenceOf(2, 3, 4, 6, 7, 8, 10)
	.select(x => x * 2)
	.where(x => x % 2 === 0);

for (let i of sq) {
	console.log(i);
}

sq = sequenceOf(2, 3, 4, 6, 7, 8, 10).select(x => x / 2);

console.log(sq.first(x => x > 3));

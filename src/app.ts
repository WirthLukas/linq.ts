/*

interface IteratorYieldResult<TYield> {
    done?: false;
    value: TYield;
}

interface IteratorReturnResult<TReturn> {
    done: true;
    value: TReturn;
}

type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;

interface Iterator<T, TReturn = any, TNext = undefined> {
    // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
    return?(value?: TReturn): IteratorResult<T, TReturn>;
    throw?(e?: any): IteratorResult<T, TReturn>;
}

interface Iterable<T> {
    [Symbol.iterator](): Iterator<T>;
}

interface IterableIterator<T> extends Iterator<T> {
    [Symbol.iterator](): IterableIterator<T>;
}

*/

import { ISequence, Predicate, Selector } from './types';

abstract class SequenceBase<TElement, TOut> implements ISequence<TOut> {
	constructor(protected source: Iterator<TElement>) {}

	public abstract next(): IteratorResult<TOut>;

	[Symbol.iterator](): IterableIterator<TOut> {
		return this;
	}

	public where(predicate: Predicate<TOut>): ISequence<TOut> {
		return new ConditionalSequence(this, predicate);
	}

	public select<TElementOut>(selector: Selector<TOut, TElementOut>): ISequence<TElementOut> {
		return new TransformSequence<TOut, TElementOut>(this, selector);
	}

	public count(predicate?: Predicate<TOut>): number {
		let count = 0;
		predicate ??= _ => true;

		for (const element of this) {
			// if predicate is undefinded => first check is true, program skips second check
			// if predicate is not undefinded => first check is false, program checks second check
			if (predicate === undefined || predicate(element)) {
				count++;
			}
		}

		return count;
	}
}

class Sequence<TElement> extends SequenceBase<TElement, TElement> {
	public override next(): IteratorResult<TElement> {
		return this.source.next();
	}
}

const asSequence = <T>(values: T[]): Sequence<T> => new Sequence(values[Symbol.iterator]());
const sequenceOf = <T>(...values: T[]): Sequence<T> => new Sequence(values[Symbol.iterator]());

export class ConditionalSequence<TElement> extends Sequence<TElement> {
	constructor(source: Iterator<TElement>, private predicate: Predicate<TElement>) {
		super(source);
	}

	public override next(): IteratorResult<TElement> {
		let done: boolean | undefined;
		let value: TElement;

		do {
			// destructuring with existing variables works with outer parentheses
			({ done, value } = this.source.next());
		} while (!done && !this.predicate(value));

		return {
			done,
			value,
		};
	}
}

export class TransformSequence<TElement, TOut> extends SequenceBase<TElement, TOut> {
	constructor(protected source: Iterator<TElement>, private transform: Selector<TElement, TOut>) {
		super(source);
	}

	public next(): IteratorResult<TOut> {
		let { done, value } = this.source.next();

		return {
			done,
			value: this.transform(value),
		};
	}
}

let sq = sequenceOf(2, 3, 4, 6, 7, 8, 10)
	.select(x => x * 2)
	.where(x => x % 2 === 0);

for (let i of sq) {
	console.log(i);
}

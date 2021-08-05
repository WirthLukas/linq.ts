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

export abstract class SequenceBase<TElement, TOut> implements ISequence<TOut> {
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
		// predicate ??= _ => true;

		for (const element of this) {
			// if predicate is undefinded => first check is true, program skips second check
			// if predicate is not undefinded => first check is false, program checks second check
			if (predicate === undefined || predicate(element)) {
				count++;
			}
		}

		return count;
	}

	public first(predicate?: Predicate<TOut>): TOut {
		const element: TOut | null = this.firstOrDefault(predicate);

		if (element === null) {
			throw new Error('Sequence contains no element');
		}

		return element;
	}

	public firstOrDefault(predicate?: Predicate<TOut>): TOut | null {
		// works because implementation of next method should call next method of source
		for (const element of this) {
			if (predicate === undefined || predicate(element)) {
				return element;
			}
		}

		return null;
	}

	public forEach(callback: (element: TOut, index: number) => void): void {
		let i = 0;
		let done: boolean | undefined;
		let value: TOut;

		do {
			({ done, value } = this.next());
			callback(value, i);
			i++;
		} while (!done);
	}

	public any(predicate?: Predicate<TOut>): boolean {
		for (const element of this) {
			if (predicate === undefined || predicate(element)) {
				return true;
			}
		}

		return false;
	}

	public all(predicate: Predicate<TOut>): boolean {
		for (const element of this) {
			if (!predicate(element)) {
				return false;
			}
		}

		return true;
	}

	public groupBy<TKey>(keySelector: Selector<TOut, TKey>): ISequence<IGrouping<TKey, TOut>> {
		return new GroupedSequence<TOut, TKey>(this, keySelector);
	}
}

export class Sequence<TElement> extends SequenceBase<TElement, TElement> {
	public override next(): IteratorResult<TElement> {
		return this.source.next();
	}
}

export const asSequence = <T>(values: Iterable<T>): Sequence<T> => new Sequence(values[Symbol.iterator]());
export const sequenceOf = <T>(...values: T[]): Sequence<T> => new Sequence(values[Symbol.iterator]());

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
	constructor(source: Iterator<TElement>, private transform: Selector<TElement, TOut>) {
		super(source);
	}

	public override next(): IteratorResult<TOut> {
		let { done, value } = this.source.next();

		return {
			done,
			value: this.transform(value),
		};
	}
}

interface IGrouping<TKey, TElement> extends Sequence<TElement> {
	get key(): TKey;
}

class Grouping<TKey, TElement> extends Sequence<TElement> implements IGrouping<TKey, TElement> {
	constructor(private readonly _key: TKey, source: Iterator<TElement>) {
		super(source);
	}

	get key(): TKey {
		return this._key;
	}
}

export class GroupedSequence<TElement, TKey> extends SequenceBase<TElement, IGrouping<TKey, TElement>> {
	private readonly groupMapIterator: IterableIterator<[TKey, TElement[]]>;

	constructor(source: Iterator<TElement>, private keySelector: Selector<TElement, TKey>) {
		super(source);
		this.groupMapIterator = this.initMap();
	}

	private initMap(): IterableIterator<[TKey, TElement[]]> {
		// zuerst muss über alle elemente drüber itereriert werden um die gruppen zu erstellen
		// danach kann man gruppe für gruppe in der next Methode zurückgeben
		let groupMap = new Map<TKey, TElement[]>();
		let { done, value } = this.source.next();

		while (!done) {
			let key = this.keySelector(value);

			if (!groupMap.has(key)) {
				groupMap.set(key, [value]);
			} else {
				groupMap.get(key)?.push(value);
			}

			// destructuring with existing variables works with outer parentheses
			({ done, value } = this.source.next());
		}

		return groupMap[Symbol.iterator]();
	}

	public override next(): IteratorResult<IGrouping<TKey, TElement>> {
		let { done, value } = this.groupMapIterator.next();

		// if done is true just take the value of the iterator, because we don't havo to work with that value
		return {
			done,
			value: done ? value : new Grouping(value[0] as TKey, (value[1] as TElement[])[Symbol.iterator]()),
		};
	}
}

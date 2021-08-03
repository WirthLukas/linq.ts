export type Selector<TElement, TOut> = (value: TElement) => TOut;
export type Predicate<TElement> = (value: TElement) => boolean;

export interface ISequence<T> extends IterableIterator<T> {
	where(predicate: Predicate<T>): ISequence<T>;
	select<TElementOut>(selector: Selector<T, TElementOut>): ISequence<TElementOut>;
	count(predicate?: Predicate<T>): number;
	first(predicate?: Predicate<T>): T;
	firstOrDefault(predicate?: Predicate<T>): T | null;
	forEach(callback: (element: T, index: number) => void): void;
	any(predicate?: Predicate<T>): boolean;
	all(predicate: Predicate<T>): boolean;
}

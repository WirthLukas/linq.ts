export type Selector<TElement, TOut> = (value: TElement) => TOut;
export type Predicate<TElement> = (value: TElement) => boolean;

export interface ISequence<T> extends IterableIterator<T> {
	where(predicate: Predicate<T>): ISequence<T>;
	select<TElementOut>(selector: Selector<T, TElementOut>): ISequence<TElementOut>;
	count(predicate?: Predicate<T>): number;
}

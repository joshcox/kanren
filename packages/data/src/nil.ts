import { Base } from "./base";

export type NilTypes<K extends string = never> = Nil<K>;

export enum NilKinds {
    Empty = 'empty'
}
export class Nil<K extends string = never> extends Base<NilKinds | K> {
    constructor(kind: NilKinds | K) {
        super(kind);
    }
}

export class Empty<K extends string = never> extends Nil<K> {
    private _id: Symbol = Symbol.for('mpt');
    constructor() {
        super(NilKinds.Empty);
    }
}

const mpt = new Empty();
export const empty = <K extends string = never>(): Empty<K> => mpt;
export const isEmpty = <K extends string = never>(nil: unknown): nil is Empty<K> =>
    nil instanceof Empty;
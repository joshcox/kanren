export class Base<K extends string = never> {
    constructor(
        readonly kind: K
    ) { }
}
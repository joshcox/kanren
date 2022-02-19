import { Term, TermAPI } from "@kanren/types";
import { injectable } from "inversify";

@injectable()
export class TermBaseAPI<T> implements TermAPI<T> {
    lvar = (i: number) => Symbol.for(`${i}`);
}
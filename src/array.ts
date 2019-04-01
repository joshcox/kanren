import { Goal } from "./data/Goal";
import { disj, conj, unify, callWithFresh } from "./mk";
import { Term } from "./data/term";
import { IState } from "./data/State";

const delay = (fn: () => Goal) => (state: IState) => fn()(state);
const fail = (message: string): never => {
    throw new Error(message);
}



const pusho = (arr: Term, item: Term, out: Term): Goal => {
    if (typeof arr === "symbol") {
        // return unify([...arr, item], out);
    }
    if (Array.isArray(arr)) return unify([...arr, item], out);

    return fail(`pusho :: rest term type (${typeof arr}) not supported`);
}

const conso = (first: Term, rest: Term, out: Term): Goal => {
    if (typeof rest === "symbol") {
        // return unify();
    }
    if (Array.isArray(rest)) return unify([first, ...rest], out);

    return fail(`conso :: rest term type (${typeof rest}) not supported`);
}

export const append = (l: Term, s: Term, o: Term): Goal => {
    return disj(
        conj(unify([], l), unify(s, o)),
        callWithFresh((a) => {
            return callWithFresh((d) => {
                return conj(
                    unify([a, d], l),
                    callWithFresh((r) => {
                        return conj(
                            unify([a, r], o),
                            delay(() => append(d, s, r))
                        );
                    })
                );
            });
        })
    );
};

// export const append = <A>(arr1: symbol | A[], arr2: symbol | A[], arrOut: symbol | A[]): Goal => disj(
//     conj(unify([], arr1), unify(arr2, arrOut)),
//     callWithFresh((a) =>
//         callWithFresh((d) => conj(
//             unify([a, d], arr2),
//             callWithFresh((r) => conj(
//                 unify([a, r], arrOut),
//                 append(d, arr2, r)
//             ))
//         )))
// );
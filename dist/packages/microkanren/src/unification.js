"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unification = void 0;
const data_1 = require("@kanren/data");
/**
 * Follows an associative path to find what the input (`term`) is
 * equivalent to. When no substitution association is made, the result
 * is the input (`term`).
 */
const walk = (term, substitution) => {
    const pr = typeof term === "symbol" && (0, data_1.find)(substitution, ({ left }) => left === term);
    return pr ? walk(pr.right, substitution) : term;
};
const unification = (t1, t2, substitution) => {
    // you cannot unify terms in a broken substitution
    if (substitution === false)
        return false;
    t1 = walk(t1, substitution);
    t2 = walk(t2, substitution);
    // strictly equal terms unify
    if (t1 === t2)
        return substitution;
    // symbols unify to any other term
    else if (typeof t1 === "symbol")
        return (0, data_1.cons)({ left: t1, right: t2 }, substitution);
    else if (typeof t2 === "symbol")
        return (0, data_1.cons)({ left: t2, right: t1 }, substitution);
    // empty arrays unify
    else if (Array.isArray(t1) && Array.isArray(t2) && t1.length === 0 && t2.length === 0)
        return substitution;
    // arrays unify every element in both arrays unify with a matching element in the other array
    else if (Array.isArray(t1) && Array.isArray(t2) && t1.length === t2.length)
        return (0, exports.unification)(t1.slice(1, t1.length - 1), t2.slice(1, t2.length - 1), (0, exports.unification)(t1[0], t2[0], substitution));
    else
        return false;
};
exports.unification = unification;
//# sourceMappingURL=unification.js.map
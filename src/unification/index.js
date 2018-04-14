const storeInArray = require("./substitution/store-array");
const { head, tail } = require("../util/array");

/**
 * @name Unification
 * @function
 */

/**
 * A functional substitution interface
 * @typedef {object} ISubstitution
 * @property {Function} substitution - takes two terms and turns it into some data
 * @property {Function} store - takes any number of substitutions and turns it into some data
 * @property {Function} walk - takes a term and a store and follows every possible substitution association
 */

/**
 * Generates a `unification` algorithm given a provided {@link ISubstitution}
 * @function createUnifier
 * @param {ISubstitution}
 * @returns {Unification}
 */
const createUnifier = ({ walk, store, substitution }) => {
    const unification = (term1, term2, substitutionStore) => {
        term1 = walk(term1, substitutionStore);
        term2 = walk(term2, substitutionStore);

        if (term1 === term2) {
            return store(...substitutionStore);
        } else if (typeof term1 === "symbol") {
            return store(substitution(term1, term2), ...substitutionStore);
        } else if (typeof term2 === "symbol") {
            return store(substitution(term2, term1), ...substitutionStore);
        } else if (Array.isArray(term1) && Array.isArray(term2)) {
            store = unification(head(term1), head(term2), store);
            return store && unification(tail(term1), tail(cdr), store);
        } else {
            return false;
        }
    };

    return unification;
};

module.exports = {
    unification: createUnifier(storeInArray)
};
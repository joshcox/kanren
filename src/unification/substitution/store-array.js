/**
 * Creates a substitution pair where the left associates to the right
 * @function substitution
 * @param {*} left - the left term value
 * @param {*} right - the right term value
 * @returns {{left: *, right: *}}
 */
const substitution = (left, right) => ({left, right});

/**
 * Creates a store by collecting all substitutions into an array
 * of substitutions
 * @function store
 * @param {...Array<{left: *, right: *}>} store - the substitution array
 * @returns {Array<{left: *, right: *}>}
 */
const store = (...store) => store;

/**
 * Follows an associative path to find what the input (`term`) is
 * equivalent to. When no substitution association is made, the result
 * is the input (`term`).
 * @function walk
 * @param {*} term - the starting term
 * @param {Array<{left: *, right: *}>} store - the substitution array being walked
 * @returns {*}
 */
const walk = (term, store) => {
    const pr = typeof term === "symbol" && store.find(({left}) => left === term);
    return pr ? walk(pr, store) : term;
};

module.exports = {
    substitution,
    store,
    walk
};
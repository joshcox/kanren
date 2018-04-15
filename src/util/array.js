/**
 * Get the first element of an array
 * @function head
 * @param {Array}
 * @returns {*} the first element
 */
const head = ([head]) => head;

/**
 * Get every element but the first of an array
 * @function tail
 * @param {Array}
 * @returns {Array}
 */
const tail = ([head, ...tail]) => tail;

module.exports = {
    head,
    tail
};
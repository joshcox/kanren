const {
    array: { head, tail }
} = require("../util");

const append$ = ($1, $2) => $1 instanceof Function
    ? () => append$($2, $1())
    : Array.isArray($1) && $1.length === 0
        ? $2
        : [head($1), ...append$(tail($1), $2)];

const appendMap$ = (g, $) => $ instanceof Function
    ? () => appendMap$(g, $())
    : Array.isArray($) && $.length === 0
        ? []
        : append$(appendMap$(g, tail($)), g(head($)));

module.exports = {
    append$,
    appendMap$
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bind = exports.plus = exports.unit = exports.takeUntil = void 0;
const data_1 = require("@kanren/data");
var data_2 = require("@kanren/data");
Object.defineProperty(exports, "takeUntil", { enumerable: true, get: function () { return data_2.take; } });
exports.unit = {
    stream: (items) => (0, data_1.stream)(items)
};
const plus = ($1, $2) => {
    if ((0, data_1.isStream)($1) && (0, data_1.isStream)($2)) {
        if ((0, data_1.isAbort)($1))
            return $1;
        else if ((0, data_1.isEmpty)($1))
            return $2;
        else if ((0, data_1.isLazy)($1))
            return (0, exports.plus)((0, data_1.force)($1), $2);
        else if ((0, data_1.isFuture)($1))
            return (0, data_1.mapFuture)($1, (s1) => (0, exports.plus)($2, s1));
        else if ((0, data_1.isCons)($1)) {
            const new$ = (0, exports.plus)($1.cdr, $2);
            return (0, data_1.isFuture)(new$)
                ? (0, data_1.mapFuture)(new$, (newS) => (0, exports.plus)((0, data_1.stream)([$1.car]), newS))
                : (0, data_1.cons)($1.car, new$);
        }
        else
            throw new TypeError('Stream.promise#append: unsupported stream type');
    }
    else
        throw new TypeError('Stream.promise#append: unsupported stream type');
};
exports.plus = plus;
const bind = (g, $) => {
    if ((0, data_1.isStream)($)) {
        if ((0, data_1.isAbort)($) || (0, data_1.isEmpty)($))
            return $;
        else if ((0, data_1.isLazy)($))
            return (0, exports.bind)(g, (0, data_1.force)($));
        else if ((0, data_1.isFuture)($))
            return (0, data_1.mapFuture)($, (s) => (0, exports.bind)(g, s));
        else if ((0, data_1.isCons)($))
            return (0, exports.plus)((0, exports.bind)(g, $.cdr), g($.car));
        else
            throw new TypeError('Stream.promise#appendMap: unsupported stream type');
    }
    else
        throw new TypeError('Stream.promise#appendMap: unsupported stream type');
};
exports.bind = bind;
//# sourceMappingURL=search.js.map
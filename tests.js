var mk = require('./mk.js');
exports.mk = mk;

exports.test1 = function() {
    return mk.callWithEmptyState(
	mk.conj(
	    mk.callWithFresh(function(a) { return mk.unify(a, 'seven') }),
	    mk.callWithFresh(function(b) { 
		return mk.disj(
		    mk.unify(b, 'five'),
		    mk.unify(b, 'six'));
	    })));
}();

/*
exports.appendo = function(l, s, out) {
    var self = this;
    return mk.disj(
	mk.conj(
	    mk.unify(l, []),
	    mk.unify(s, out)),
	mk.callWithFresh( function(a) {
	    return mk.callWithFresh( function (d) {
		return mk.conj(
		    mk.unify([a, d], l),
		    mk.callWithFresh( function (res) {
			return mk.conj(
			    mk.unify([a, res], out),
			    function (sWithCount) {
				return function() {
				    return self.appendo(d, s, res)(sWithCount);
				}
			    });
		    }));
	    });
	}));
};

exports.callAppendo = function() {
    var self = this;
    return mk.callWithFresh(function(q) {
	return mk.callWithFresh(function(l) {
	    return mk.callWithFresh(function(s) {
		return mk.callWithFresh(function(out) {
		    return mk.conj(
			this.appendo(l, s, out),
			mk.unify([l, s, out], q)
		    );
		});
	    });
	});
    });
};
*/

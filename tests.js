var mk = require('./mk.js');

exports.test1 = function() {
    return mk.callWithEmptyState(
	mk.conj(
	    mk.callWithFresh(function(a) { return mk.unify(a, 'seven') }),
	    mk.callWithFresh(function(b) { 
		return mk.disj(
		    mk.unify(b, 'five'),
		    mk.unify(b, 'six'));
	    })));
}

//let's add some functions to the Array to get back a functional 
//interface and to clean up the code below. 
Array.prototype.clone = function() {
    return this.slice(0);
};

/**
 * Cons, Car, Cdr - similar to Racket operators, but operate at the
 * end of the Array to not mess with JS' model. 
 */
Array.prototype.cons = function(x) {
    var newArray = this.clone()
    newArray.push(x);
    return newArray;
};
Array.prototype.car = function() {
    return this[this.length-1];
};
Array.prototype.cdr = function() {
    return this.slice(0, this.length-2);
};

module.exports = {
    variable: function(n) { return n; },
    
    isVariable: function(n) { return (typeof n === 'number'); },

    extendState: function(x, v, state) { return state.cons([x, v]); },

    //assv goes from the back to front because push/pop works on last element
    assv: function (key, list) {
	for (var i = list.length - 1; i >= 0; i--) {
	    if (list[i][0] === key) return list[i];
	}
	return false;
    },

    walk: function(u, s) {
	var pr = this.isVariable(u) && this.assv(u, s);
	return pr ? this.walk(pr,s) : u;
    },

    unification: function(u, v, s) {
	var u = this.walk(u, s);
	var v = this.walk(v, s);
	if (u === v) {
	    return s.clone(); //return new for backtracking
	} else if (this.isVariable(u)) {
	    return this.extendState(u, v, s);
	} else if (this.isVariable(v)) {
	    return this.extendState(v, u, s);
	} else if (Array.isArray(u) && Array.isArray(v)) {
	    s = this.unification(u.car(), v.car(), s);
	    return s && this.unification(u.cdr(), v.cdr(), s); //needs to be tested
	} else {
	    return false;
	}
    },

    unify: function(u, v) {
	var self = this;
	return function(sWithCount) {
	    var s = self.unification(u, v, sWithCount[0]);
	    if (s) {
		return [[s, sWithCount[1]]];
	    } else {
		return [];
	    }
	}
    },

    callWithFresh: function(f) {
	return function(sWithCount) {
	    var s = sWithCount[0].clone();
	    var c = sWithCount[1];
	    return f(c)([s, c+1]);
	}
    },

    disj: function(g1, g2) {
	var self = this;
	return function(sWithCount) {
	    return self.$Append(g1(sWithCount), g2(sWithCount));
	}
    },

    conj: function(g1, g2) {
	var self = this;
	return function(sWithCount) {
	    return self.$AppendMap(g2, g1(sWithCount));
	}
    },
    
    $Append: function($1, $2) {
	if ($1 instanceof Function) {
	    return function() { this.$Append($2, $1()) };
	} else if (Array.isArray($1) && $1.length === 0) {
	    return $2;
	} else {
	    return this.$Append($1.cdr(), $2).cons($1.car());
	}
    },

    $AppendMap: function(g, $) {
	if ($ instanceof Function) {
	    return function() { this.$AppendMap(g, $()) };
	} else if (Array.isArray($) && $.length === 0) {
	    return [];
	} else {
	    return this.$Append(this.$AppendMap(g, $.cdr()), g($.car()));
	}
    },
    
    callWithEmptyState: function(g) {
	return g([[], 0]);
    }			 
}

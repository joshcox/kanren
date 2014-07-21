Array.prototype.clone = function() {
    return this.slice(0);
};

module.exports = {
    variable: function(n) {
	return n;
    },
    
    isVariable: function(n) {
	return (typeof n === 'number');
    },

    extendState: function(x, v, state) {
	var xv = [x, v];
	var newState = state.clone(); //create new array
	newState.push(xv);
	return newState;
    },

    //assv goes from the back to front because push/pop works on last element
    assv: function (key, list) {
	for (var i = list.length - 1; i >= 0; i--) {
	    if (list[i][0] === key) return list[i];
	}
	return false;
    },

    walk: function(u, s) {
	var pr = this.isVariable(u) && this.assv(u, s);
	if (pr) {
	    return this.walk(pr, s);
	} else {
	    return u;
	}
	//return pr ? this.walk(pr,s) : u;
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
	    var newState = this.unification(u.pop(), v.pop(), s);
	    if (s) {
		this.unification(u, v, s); //last elements of u/v are popped off u,v = cdr
	    } else {
		return false;
	    }
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
	    var $c1 = $1.clone();
	    var lastElement = $c1.pop();
	    var recursiveCall = this.$Append($c1, $2);
	    recursiveCall.push(lastElement);
	    return recursiveCall;
	}
    },

    $AppendMap: function(g, $) {
	if ($ instanceof Function) {
	    return function() { this.$AppendMap(g, $()) };
	} else if (Array.isArray($) && $.length === 0) {
	    return [];
	} else {
	    var $c = $.clone();
	    var lastElement = $c.pop();
	    var recursiveCall = this.$AppendMap(g, $c);
	    return this.$Append(recursiveCall, g(lastElement));
	}
    },
    
    callWithEmptyState: function(g) {
	return g([[], 0]);
    },

    test: function() {
	var self = this;
	return self.callWithEmptyState(self.callWithFresh(function(a) {
		return self.unify(a, 'five');
	    }));
    }
			 
}

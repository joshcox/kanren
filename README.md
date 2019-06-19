[![build status](https://api.travis-ci.org/joshcox/kanren.png?branch=master)](http://travis-ci.org/joshcox/kanren)
[![npm version](https://badge.fury.io/js/kanren.svg)](https://badge.fury.io/js/kanren)

# `kanren`
- [`kanren`](#kanren)
- [Introduction](#Introduction)
- [Getting Started](#Getting-Started)
- [Work in Progress](#Work-in-Progress)
- [Contributing](#Contributing)

# Introduction
Kanren is a port of [`microKanren`](https://github.com/jasonhemann/microKanren) to TypeScript. I'll defer to [miniKanren.org](http://minikanren.org/) for an explanation of what types of problems the `kanren` family of languages solve.

The initial goal with this particular port is to provide an API that can easily be extended to include additional term types and constraints.

# Getting Started
First things first, install `kanren`: `npm install --save kanren`

Import `kanren`.
```typescript
// es6
import { kanren }  from "kanren";

// commonjs
const { kanren } = require("kanren");

const { unify, callWithFresh, disj, conj, runAll } = kanren();
```

Real quick aside - `kanren` operates over `Term`s. No other values are supported within `kanren`. Note that `symbol` `Term`s are reserved for internal use within `kanren`; please don't use them.
```typescript
type Term = boolean | undefined | null | number | string | symbol | Array<any>;
```

Anyway... Now that we have `kanren`, use `runAll` to determine if `1` unifies with `1`.

```typescript
> runAll({ goal: unify(1, 1) }).size
1
```

As you can see, there's one state in which the `unify(1, 1)` goal succeeds. So yes, `1` unifies with `1`.
Does `1` unify with `2`?

```typescript
> runAll({ goal: unify(1, 2) }).size
0
```

It sure doesn't. There are `0` states in which the `unify(1, 2)` goal succeeds. What happens when we `unify` other `Term`s?

```typescript
> runAll({ goal: unify([1], 1) }).size
0
> runAll({ goal: unify([1], [1]) }).size
1
> runAll({ goal: unify([1], [1, 2]) }).size
0
> runAll({ goal: unify(true, true) }).size
1
> runAll({ goal: unify(true, false) }).size
0
> runAll({ goal: unify(false, false) }).size
1
```

So, in general, `Term`s with equivalent structures and values tend to unify. What about wildcards? The `callWithFresh` goal wraps a goals and introduces a variable that can be used within the internal goal.

```typescript
> // Wrap a goal with a hole (`unify(_,5)`) with a function of one argument.
> // Use the single parameter to fill in the hole
> const goalWithVariable = (joker) => unify(joker, 5);
> // Pass `goalWithVariable` to `callWithFresh` to create a goal that creates a logic variable
> runAll({ goal: callWithFresh(goalWithVariable) }).size
1
> runAll({ goal: callWithFresh((joker) => unify(joker, 5)) }).get(0).substitution.get(0)
{ left: Symbol(0), right: 5 }
> runAll({ goal: callWithFresh((joker) => unify(5, joker)) }).get(0).substitution.get(0)
{ left: Symbol(0), right: 5 }
```

We've just created what's known as a logic variable. Like normal variables in the javascript world, this can be used to represent values. As you can see within the subsitution above, you can assign a logic variable by unifying it with another term. You can also assign logic variables to values within non-primitive terms, such as `Array`s.

```typescript
> runAll({ goal: callWithFresh((a) => unify([a], [5])) }).get(0).substitution.get(0)
{ left: Symbol(0), right: 5 }
```

You might want to make multiple calls to `unify`. Using `conj` (conjunction a.k.a logical "and") we can create an aggregate goal that encompasses two smaller goals. Both goals must succeed for the aggregate to succeed.

```typescript
> runAll({ goal: conj(unify(1,1), unify(1,1)) }).size
1
> runAll({ goal: conj(unify(1,1), unify(1,2)) }).size
0
> runAll({ goal: conj(unify(1,2), unify(1,2)) }).size
0
> runAll({ goal: callWithFresh((a) => conj(unify(a,5), unify([a],[5]))) }).size
1
> runAll({ goal: callWithFresh((a) => conj(unify(a,5), unify(a,[]))) }).size
0
```

Like `conj`, you could also use `disj` (disjunction a.k.a logical "or") to create an aggregate goal that encompasses two smaller goals. Unlike `conj`, only one of `disj`'s sub-goal need succeed for the aggregate to succeed.

```typescript
> runAll({ goal: disj(unify(1,1), unify(1,1)) }).size
2
> runAll({ goal: disj(unify(1,1), unify(1,2)) }).size
1
> runAll({ goal: disj(unify(1,2), unify(1,2)) }).size
0
> runAll({ goal: callWithFresh((a) => disj(unify(a,5), unify(a,6))) }).size
2
> runAll({ goal: callWithFresh((a) => disj(unify(a,5), unify([a],[]))) }).size
1
```

Note that `disj` has the power to create new states; it creates a branch. `conj` is used to compound new information to existing states.

# Work in Progress
* Benchmarking
* Constraint Extensions - Extend `kanren` with custom constraints
* Term type Extensions - Extend `kanren` with custom term types
  * [ ] Hook new terms into `unification` algorithm via a predicate and a unifier
* Standard Libraries
  * [ ] `Array`
  * [ ] `Object`

# Contributing
`kanren` is welcoming contributions. If you have something to say, I'd like to hear it. If you have something to code, I'd like to see it. Read more about how to contribute and how to get set up with development [here](./.github/CONTRIBUTING.md).
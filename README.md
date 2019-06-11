[![build status](https://api.travis-ci.org/joshcox/kanren.png?branch=master)](http://travis-ci.org/joshcox/kanren)
[![npm version](https://badge.fury.io/js/kanren.svg)](https://badge.fury.io/js/kanren)

# `kanren`
- [`kanren`](#kanren)
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Work in Progress](#work-in-progress)
- [Contributing](#contributing)

# Introduction
Kanren is a port of [`microKanren`](https://github.com/jasonhemann/microKanren) to TypeScript. I'll defer to [miniKanren.org](http://minikanren.org/) for an explanation of what types of problems the `kanren` family of languages solve.

The initial goal with this particular port is to provide an API that can easily be extended to include additional term types and constraints.

# Getting Started
First things first, install `kanren`: `npm install --save kanren`

Import `kanren`.
```typescript
// es6
import { unify, callWithFresh, disj, conj, runAll }  from "kanren";

// commonjs
const { unify, callWithFresh, disj, conj, runAll } = require("kanren");
```

Real quick aside - `kanren` operates over `Term`s. No other values are supported within `kanren`. Note also that `symbol` `Term`s are reserved for internal use within `kanren`; please don't use them.
```typescript
type Term = boolean | undefined | null | number | string | symbol | Array<any>;
```

Now that we have `kanren`, does `1` unify with `1`? Use `runAll` to find all possible solutions for a `Goal`.

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

It sure doesn't. There are `0` states in which the `unify(1, 2)` goal succeeds. What about other data?

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

So, in general, data with equivalent structures and values tend to unify. What about a wildcard?

```typescript
> runAll({ goal: callWithFresh((joker) => unify(joker, 5)) }).size
1
> runAll({ goal: callWithFresh((joker) => unify(joker, 5)) }).get(0).substitution.get(0)
{ left: Symbol(0), right: 5 }
```

We've just created what's known as a fresh logic variable. Like normal variables in the javascript world, this can be used to represent any value. As you can see within the subsitution above, you can assign a logic variable by unifying it with another term. You can also assign logic variables to values within non-primitive terms, such as `Array`s.

```typescript
> runAll({ goal: callWithFresh((a) => unify([a], [5])) }).get(0).substitution.get(0)
{ left: Symbol(0), right: 5 }
```

Cool. `kanren` has the ability to tell us if two shapes have the same pattern and value(s) and allows us to associate something called logic variables to other terms. There aren't many interesting things we can do with one unification, however. Knowledge within a `kanren` run can be expanded using `conj` (conjunction a.k.a logical "and") and `disj` (disjunction a.k.a logical "or").

```typescript

```




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
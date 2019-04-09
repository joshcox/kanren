[![build status](https://api.travis-ci.org/joshcox/kanren.png?branch=master)](http://travis-ci.org/joshcox/kanren)
[![npm version](https://badge.fury.io/js/kanren.svg)](https://badge.fury.io/js/kanren)

# `kanren`
- [`kanren`](#kanren)
- [Introduction](#introduction)
- [Work in Progress](#work-in-progress)
- [Contributing](#contributing)

# Introduction
Kanren is a port of [`microKanren`](https://github.com/jasonhemann/microKanren) to TypeScript. I'll defer to [miniKanren.org](http://minikanren.org/) for an explanation of what types of problems the `kanren` family of languages solve.

The initial goal with this particular port is to provide an API that can easily be extended to include additional term types and constraints.

# Work in Progress
* Constraint Extensions - Extend `kanren` with custom constraints
* Term type Extensions - Extend `kanren` with custom term types
  * [ ] Hook new terms into `unification` algorithm via a predicate and a unifier
* Standard Libraries
  * [ ] `Array`
  * [ ] `Object`

# Contributing
`kanren` is welcoming contributions. If you have something to say, I'd like to hear it. If you have something to code, I'd like to see it. Read more about how to contribute and how to get set up with development [here](./.github/CONTRIBUTING.md).
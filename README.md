[![build status](https://api.travis-ci.org/joshcox/kanren.png?branch=master)](http://travis-ci.org/joshcox/kanren)
[![npm version](https://badge.fury.io/js/kanren.svg)](https://badge.fury.io/js/kanren)

# `kanren`
- [`kanren`](#kanren)
- [Introduction](#introduction)
- [Development](#development)
  - [Editor of Choice](#editor-of-choice)
  - [Running Tests](#running-tests)
  - [Compiling the source](#compiling-the-source)

# Introduction
Kanren is a port of [`microKanren`](https://github.com/jasonhemann/microKanren) to TypeScript. I'll defer to [miniKanren.org](http://minikanren.org/) for an explanation of what types of problems the `kanren` family of languages solve.

The initial goal with this particular port is to provide an API that can easily be extended to include additional term types and constraints.

# Development
## Editor of Choice
I'd suggest using VSCode to hack on the `kanren` library. For anybody-or-nobody's benefit, I've saved off my `.vscode` folder that has configuration I've employed to make development on `kanren` a little more streamlined.

## Running Tests
* On command line: `npm run test`
* To test a single spec file: `VSCode->Debug->Jest Current File`
* To tests all spec files: `VSCode->Debug->Jest All`

## Compiling the source
* On command line: `npm run compile`

# Contributing to Kanren
Hey folks, thanks for giving your time to `kanren`.

This document is under construction; I plan on filling it out as I go.

What I'd like to answer in this guide:
* What contributions are we looking for?
* What should issues look like?
* How would you get started with development?

However, although I haven't pinned down most of the above, know that `kanren` welcomes contributions. If you have something to say, I'd like to hear it. If you have something to code, I'd like to see it.

# How do I start Developing?
## Editor of Choice
I'd suggest using VSCode to hack on the `kanren` library. For anybody-or-nobody's benefit, the `.vscode` folder has been saved off; it has configuration that makes development on `kanren` quick/simple.

## Running Tests
* On command line: `npm run test`
* To test a single spec file: `VSCode->Debug->Jest Current File`
* To tests all spec files: `VSCode->Debug->Jest All`

## Compiling the source
* On command line: `npm run compile`
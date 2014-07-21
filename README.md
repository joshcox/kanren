microJSKanren
=============
A port of the microKanren implementation by Jason Hemann 
and Daniel P. Friedman.

For ease of use, I've written the files as modules for NodeJS.

Usage:

1. Launch nodejs in directory with mk.js and tests.js
2. Type and hit Enter: "var mk = require('./mk.js');"
   *	This will load the microKanren library into the mk variables,
   	which can be accessed as such: "mk.callWithEmpyState(...)".
3. To load the tests file: "var tests = require('./tests.js');"
   *  This will load the tests into the variable tests. As of now, I
      only have one function in here and it can be accessed as:
      "tests.test1".
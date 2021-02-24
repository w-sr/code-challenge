"use strict";
const _ = require("lodash");

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  let logSourcesMap = logSources.map((logSource) => {
    let value = logSource.pop();

    return {
      value,
      logSource,
    };
  });

  const insert = (logSourcesMap, insertLogSource) => {
    if (insertLogSource.value.date >= _.last(logSourcesMap).value.date) {
      logSourcesMap.push(insertLogSource);

      return logSourcesMap;
    }

    // interate, find the insertion point
    logSourcesMap.some((logSource, index) => {
      if (insertLogSource.value.date < logSource.value.date) {
        // insert element, using splice for perf
        logSourcesMap.splice(index, 0, insertLogSource);

        return true;
      }

      return false;
    });

    return logSourcesMap;
  };

  logSourcesMap = _.sortBy(logSourcesMap, "value.date");

  while (logSourcesMap.length) {
    // remove the head array element
    let logSource = logSourcesMap.shift();

    // grab the log we want to print
    let log = logSource.value;

    // pop the next value
    logSource.value = logSource.logSource.pop();

    // if the value is truthy unshift (this will weed out drained log sources)
    if (logSource.value) {
      logSourcesMap = insert(logSourcesMap, logSource);
    }

    // print the value
    printer.print(log);
  }

  printer.done();
};

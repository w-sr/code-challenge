"use strict";

const _ = require("lodash");
const Promise = require("bluebird");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  const insert = (logSourcesMap, insertLogSource) => {
    if (insertLogSource.value.date >= _.last(logSourcesMap).value.date) {
      logSourcesMap.push(insertLogSource);

      return logSourcesMap;
    }

    logSourcesMap.some((logSource, index) => {
      if (insertLogSource.value.date < logSource.value.date) {
        logSourcesMap.splice(index, 0, insertLogSource);

        return true;
      }

      return false;
    });

    return logSourcesMap;
  };

  return Promise.map(logSources, (logSource) => {
    return logSource.popAsync().then((value) => {
      return {
        value,
        logSource,
      };
    });
  })
    .then((logSourcesMap) => {
      logSourcesMap = _.sortBy(logSourcesMap, "value.date");

      return (function loop(logSourcesMap) {
        if (logSourcesMap.length) {
          // remove the head array element
          let logSource = logSourcesMap.shift();

          // grab the log we want to print
          let log = logSource.value;

          // print the value
          printer.print(log);

          // pop the next value
          return logSource.logSource.popAsync().then((value) => {
            logSource.value = value;

            if (value) {
              logSourcesMap = insert(logSourcesMap, logSource);
            }

            return loop(logSourcesMap);
          });
        }

        return Promise.resolve();
      })(logSourcesMap);
    })
    .then(() => printer.done());
};

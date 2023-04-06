let exportPlugin = {};
if (process.env.NODE_ENV === "production") {
  exportPlugin = require("./lib/rcWaterfallVirtualList.min.js");
} else {
  exportPlugin = require("./lib/rcWaterfallVirtualList.min.js");
}

module.exports = exportPlugin;

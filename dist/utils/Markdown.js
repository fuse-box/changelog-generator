"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment/moment");
exports.humanDate = function (date) {
    return moment(date).format('LLL');
};
exports.noCase = function (title) {
    var noCase = require('no-case');
    return noCase(title);
};
exports.table = function (array, columns) {
    var table = "";
    var cols = columns
        ? columns.split(",")
        : Object.keys(array[0]);
    table += cols.join(" | ");
    table += "\r\n";
    table += cols.map(function () {
        return '---';
    }).join(' | ');
    table += "\r\n";
    array.forEach(function (item) {
        table += cols.map(function (key) {
            return String(item[key] || "");
        }).join(" | ") + "\r\n";
    });
    return table;
};
exports.h1 = function (title) {
    return "# " + title;
};
exports.h2 = function (title) {
    return "## " + title;
};
exports.h3 = function (title) {
    return "### " + title;
};
exports.h4 = function (title) {
    return "#### " + title;
};
exports.h5 = function (title) {
    return "##### " + title;
};
exports.h6 = function (title) {
    return "###### " + title;
};
exports.altH2 = function (title) {
    return "\n### " + title + "\n    ";
};
exports.altH1 = function (title) {
    return "\n### " + title + "\n    ";
};
exports.link = function (title, url, alt) {
    return "[" + title + "](" + url + (alt ? ' ' + alt : '') + ")";
};
exports.code = function (text, type, inline) {
    if (type === void 0) { type = 'javascript'; }
    if (inline === void 0) { inline = false; }
    if (inline) {
        return "`" + text + "`";
    }
    return "\n    ```" + type + "\n    " + text + "\n    ```\n    ";
};

var ID4 = require('./id4');
var ID3v1 = require('./id3v1');
var ID3v2 = require('./id3v2');
var BufferedBinaryAjax = require('./bufferedbinaryajax');
var FileAPIReader = require('./filereader');

if (typeof window !== 'undefined') {
    window['FileAPIReader'] = FileAPIReader;
}

var ID3 = {};

var _files = {};
// location of the format identifier
var _formatIDRange = [0, 7];

/**
 * Finds out the tag format of this data and returns the appropriate
 * reader.
 */
function getTagReader(data) {
    // FIXME: improve this detection according to the spec
    return data.getStringAt(4, 7) === "ftypM4A" ? ID4 :
        (data.getStringAt(0, 3) === "ID3" ? ID3v2 : ID3v1);
}

function readTags(reader, data, url, tags) {
    var tagsFound = reader.readTagsFromData(data, tags);
    var Tags = _files[url] || {};
    for (var tag in tagsFound)
        if (tagsFound.hasOwnProperty(tag)) {
            Tags[tag] = tagsFound[tag];
        }
    _files[url] = Tags;
}

ID3.clearTags = function(url) {
    delete _files[url];
};

ID3.clearAll = function() {
    _files = {};
};

/**
 * @param {string} url The location of the sound file to read.
 * @param {function()} cb The callback function to be invoked when all tags have been read.
 * @param {{tags: Array.<string>, dataReader: function(string, function(BinaryReader))}} options The set of options that can specify the tags to be read and the dataReader to use in order to read the file located at url.
 */
ID3.loadTags = function(url, cb, options) {
    options = options || {};
    var dataReader = options["dataReader"] || BufferedBinaryAjax;
    var onError = options["onError"];

    dataReader(url, function(data) {
        // preload the format identifier
        data.loadRange(_formatIDRange, function() {
            var reader = getTagReader(data);
            reader.loadData(data, function() {
                try {
                    readTags(reader, data, url, options["tags"]);
                } catch (err) {
                    if (onError) onError(err);
                }
                if (cb) cb();
            });
        });
    }, onError);
};

ID3.getAllTags = function(url) {
    if (!_files[url]) return null;

    var tags = {};
    for (var a in _files[url]) {
        if (_files[url].hasOwnProperty(a))
            tags[a] = _files[url][a];
    }
    return tags;
};

ID3.getTag = function(url, tag) {
    if (!_files[url]) return null;

    return _files[url][tag];
};

ID3["FileAPIReader"] = FileAPIReader;
ID3["loadTags"] = ID3.loadTags;
ID3["getAllTags"] = ID3.getAllTags;
ID3["getTag"] = ID3.getTag;
ID3["clearTags"] = ID3.clearTags;
ID3["clearAll"] = ID3.clearAll;

module.exports = ID3;
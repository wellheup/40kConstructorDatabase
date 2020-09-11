module.exports = { 
    forTwo: function(context, options) {
        let ret = "";

        for (let i = 0, j = 2; i < j; i++) {
            ret += options.fn(context[i]);
        }

        return ret;
        // derived from https://gist.github.com/LukeChannings/6173ab951d8b1dc4602e#file-handlebars-select-helper-js
        // return options.fn(this)
        //     .split('\n')
        //     .map(function(v) {
        //         var t = 'context="' + context + '"'
        //         return ! RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"')
        //         })
        //     .join('\n')
    }
}
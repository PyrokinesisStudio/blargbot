var e = module.exports = {};

e.init = () => {
    e.category = bu.TagType.COMPLEX;
};
e.requireCtx = require;
e.isTag = true;

e.name = 'exec';
e.args = '&lt;code&gt; [user input]';
e.usage = '{exec;tag[;input]}';
e.desc = 'Executes another tag. Useful for modules.';
e.exampleIn = 'Let me do a tag for you. {exec;f}';
e.exampleOut = 'Let me do a tag for you. User#1111 has paid their respects. Total respects given: 5';


e.execute = async function(params) {
    if (params.msg.iterations && params.msg.iterations > 200) {
        bu.send(params.msg, 'Terminated recursive tag after 200 execs.');
        throw ('Too Much Exec');
    } else if (!params.msg.iterations) params.msg.iterations = 1;
    else params.msg.iterations++;

    // processes any nested tags in the `args` array. if your tag uses advanced logic, you may wish to reimplement this
    for (let i = 1; i < params.args.length; i++) {
        params.args[i] = await bu.processTagInner(params, i);
    }
    var replaceString = '';
    var replaceContent = false;
    if (params.args[1]) {
        let tag = await r.table('tag').get(params.args[1]).run();
        if (!tag) {
            replaceString = await bu.tagProcessError(params, '`Tag not found`');
        } else {
            if (tag.content.toLowerCase().indexOf('{nsfw}') > -1) {
                let nsfwChan = await bu.isNsfwChannel(params.msg.channel.id);
                if (!nsfwChan) {
                    replaceString = await bu.tagProcessError(params, '`NSFW tag`');
                    return {
                        replaceString: replaceString,
                        replaceContent: false
                    };
                }
            }
            let tagArgs;
            if (params.args[2]) {
                tagArgs = params.args[2];
            } else {
                tagArgs = '';
            }
            tagArgs = bu.splitInput(tagArgs);
            params.words = tagArgs;
            params.content = tag.content;
            replaceString = await bu.processTagInner(params);
        }
    } else {
        replaceString = await bu.tagProcessError(params, '`Not enough arguments`');
    }

    return {
        terminate: params.terminate,
        replaceString: replaceString,
        replaceContent: replaceContent
    };
};
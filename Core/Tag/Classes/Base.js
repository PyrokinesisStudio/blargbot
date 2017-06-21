const TagResult = require('../TagResult');
const TagError = require('../TagError');
const TagArray = require('../TagArray');

class TagBase {
    constructor(client, options = {}) {
        if (this.constructor === TagBase) {
            throw new Error('Can\'t instantiate an abstract class!');
        }
        this.client = client;
        this.name = options.name || this.constructor.name.toLowerCase();
        /* Format:
        * {
        *   name: string,
        *   optional: boolean,
        *   repeat: boolean
        * }
        * */
        this.args = options.args || [];
        this.minArgs = options.minArgs;
        this.maxArgs = options.maxArgs;

        this.ccommand = options.ccommand || false;

        this.TagResult = TagResult;
        this.TagError = TagError;
        this.TagArray = TagArray;

        this.array = options.array || false;
    }

    get implicit() {
        return true;
    }

    async getDescription(dest) {
        return await this.decode(dest, `${this.base}.desc`);
    }

    async getExampleIn(dest) {
        return await this.decode(dest, `${this.base}.example.in`);
    }

    async getExampleOut(dest) {
        return await this.decode(dest, `${this.base}.example.out`);
    }

    /**
     * Main execution of the tag, returning a TagResult
     * @param {TagContext} ctx The TagContext
     * @param {boolean} parseArgs Whether to parse args automatically. Set to false to parse manually.
     */
    async execute(ctx, args, parseArgs = true) {
        if (this.ccommand && !ctx.isCustomCommand) throw new TagError('error.tag.ccommandonly', {
            tag: this.name
        });
        const res = new TagResult();
        if (this.maxArgs && args.length > this.maxArgs)
            this.throw(ctx.client.Constants.TagError.TOO_MANY_ARGS, {
                expected: this.maxArgs,
                received: args.length
            });

        if (this.minArgs && args.length < this.minArgs)
            this.throw(ctx.client.Constants.TagError.TOO_FEW_ARGS, {
                expected: this.minArgs,
                received: args.length
            });

        if (parseArgs)
            for (let i = 0; i < args.length; i++) {
                args[i] = await ctx.processSub(args[i]);
            }

        return res;
    }

    parseInt(str, arg, base = 10) {
        let num = parseInt(str, base);
        if (isNaN(num)) this.throw('error.tag.isnan', {
            arg, value: str
        });
        else return num;
    }
    parseFloat(str, arg, base = 10) {
        let num = parseFloat(str, base);
        if (isNaN(num)) this.throw('error.tag.isnan', {
            arg, value: str
        });
        else return num;
    }
    async loadArray(ctx, arg) {
        let arr;
        if (arg.length === 1 && arg[0] instanceof this.TagArray) {
            arr = arg[0];
        } else {
            arr = await new this.TagArray().load(ctx, arg.join(''));
        }
        return arr;
    }

    throw(key, args) {
        throw new TagError(key, args);
    }

    set args(args) {
        this.argList = args;
    }

    get args() {
        let output = '';
        for (const arg of this.argList) {
            if (arg.optional)
                output += `[${arg.name}]`;
            else output += `&lt;${arg.name}&gt;`;
            if (arg.repeat) output += '...';
            output += ' ';
        }
        return output;
    }

    get usage() {
        let output = '{' + this.name;
        let optionalCount = 0;
        for (const arg of this.argList) {
            if (arg.optional) {
                if (arg.nested) {
                    output += `[;${arg.name}`;
                    optionalCount++;
                } else output += `[;${arg.name}]`;
            } else if (optionalCount > 0) {
                output += ']'.repeat(optionalCount) + `;${arg.name}`;
                optionalCount = 0;
            } else output += `;${arg.name}`;
            if (arg.repeat) output += '...';
            output += ' ';
        }
        if (optionalCount > 0) {
            output += ']'.repeat(optionalCount);
        }
        return output + '}';
    }

    async decode(dest, key, args) {
        await this.client.Helpers.Message.decode(dest, key, args);
    }

    get base() {
        return `tag.${this.category}.${this.name}`;
    }

}

module.exports = TagBase;
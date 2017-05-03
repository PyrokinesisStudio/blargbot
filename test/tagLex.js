global._dep = require('../Dependencies');

const TagLexer = require('../Core/TagLexer');

const tagLexer = new TagLexer();
let tokens = tagLexer.parse(`one {two;three} {four;  five;six {seven;eight {nine}}}`);


console.dir(tokens, { depth: 10 });
console.log(tokens[3].serialize());
const { Math } = require.main.require('./Tag/Classes');

class CeilTag extends Math {
  constructor(client) {
    super(client, {
      name: 'ceil',
      args: [
        {
          name: 'number'
        }
      ],
      minArgs: 1, maxArgs: 1
    });
  }

  async execute(ctx, args) {
    const res = await super.execute(ctx, args);

    let parsed = this.parseFloat(args.parsedArgs.number, 'number');

    return res.setContent(global.Math.ceil(parsed));
  }
}

module.exports = CeilTag;
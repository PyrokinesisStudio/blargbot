const { Channel } = require.main.require('./Tag/Classes');

class ChannelTypeTag extends Channel {
  constructor(client) {
    super(client, {
      name: 'type',
      args: [
        {
          name: 'channel',
          optional: true
        }
      ],
      minArgs: 0, maxArgs: 1
    });
  }

  async execute(ctx, args) {
    const res = await super.execute(ctx, args);
    args = args.parsedArgs;
    let channel = ctx.channel;
    if (args.channel) {
      channel = await ctx.client.Helpers.Resolve.channel(ctx, args.channel.toString(), true);
    }
    return res.setContent(channel ? channel.type === 0 ? 'text' : 'voice' : '');
  }
}

module.exports = ChannelTypeTag;
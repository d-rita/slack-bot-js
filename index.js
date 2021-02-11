// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
require('dotenv').config()
const { WebClient, LogLevel } = require("@slack/web-api");

const client = new WebClient(process.env.TOKEN, {
  logLevel: LogLevel.DEBUG
});

const buildSlackMessage = (channels) => {
    let blocks = [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${Object.keys(channels).length} channels`
        }
      },
    ]

    let msgPieces = {
        divider: {"type": "divider"},
        private: ":lock:",
        public: "#"
    }
    
    Object.keys(channels).forEach((id) => {
        let channelSymbol = `${channels[id].is_private ? msgPieces.private : msgPieces.public}`;
        let channelMembers = `${channels[id].num_members ? channels[id].num_members : ""}`;
        let membersNumber = `${channels[id].num_members ? channels[id].num_members > 1 ? "members" : "member" : ""}`

        let block = {
            "type": "section",
            "text": {
            "type": "mrkdwn",
            "text": `${channelSymbol} *${channels[id].name}*\n ${channelMembers} ${membersNumber} \n`
            }
        }
        blocks.push(msgPieces.divider);
        blocks.push(block);
    })
  
    return blocks;
  }

let channelId = process.env.CHANNEL_ID;

async function sendSlackMessage(){
    try {
        const { channels } = await client.conversations.list({
            types:'public_channel, private_channel'
        });

        let conversationsStore = {};
        let conversationId = '';
        channels.forEach(function(c){
            conversationId = c["id"];
            conversationsStore[conversationId] = c;
        });

        console.log(buildSlackMessage(conversationsStore))

        const result = await client.chat.postMessage({
          channel: channelId,
          text: "List of channels",
          blocks: buildSlackMessage(conversationsStore),
        //   response_type: 'ephemeral',
        });
      }
      catch (error) {
        console.error(error);
      }    
}

sendSlackMessage()

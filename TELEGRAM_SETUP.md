# Setting Up Telegram Integration for Airdrops-Geo

This guide will help you set up the Telegram integration for automatically posting airdrops to a Telegram channel or group when they are created or updated on your Airdrops-Geo website.

## Prerequisites

- A Telegram account
- Admin access to a Telegram channel or group where you want to post airdrops

## Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat with BotFather and send the command `/newbot`
3. Follow the instructions to create a new bot:
   - Provide a name for your bot (e.g., "Airdrops Geo Bot")
   - Provide a username for your bot (must end with "bot", e.g., "airdrops_geo_bot")
4. BotFather will give you a token for your new bot. This is your `TELEGRAM_BOT_TOKEN`. It looks something like `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`
5. Save this token securely - you'll need it for the next steps

## Step 2: Create a Telegram Channel or Group

1. Create a new channel or group in Telegram where you want the airdrops to be posted
2. Make your bot an administrator of the channel/group with posting permissions

## Step 3: Get the Chat ID

### For a Channel:

1. Make your channel public temporarily (you can make it private again later)
2. Note the channel's username (e.g., `@airdrops_geo_channel`)
3. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` in your browser (replace `<YOUR_BOT_TOKEN>` with your actual bot token)
4. Post a message in your channel
5. Refresh the API URL in your browser
6. Look for a `"chat":{"id":-1001234567890,"title":"Your Channel Name"...` in the response
7. The number after `"id":` is your `TELEGRAM_CHAT_ID` (it will be negative for channels, like `-1001234567890`)

### For a Group:

1. Add your bot to the group
2. Send a message in the group
3. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` in your browser
4. Look for a `"chat":{"id":-123456789,"title":"Your Group Name"...` in the response
5. The number after `"id":` is your `TELEGRAM_CHAT_ID` (it will be negative for groups, like `-123456789`)

## Step 4: Update Your Environment Variables

1. Open the `.env` file in the `server` directory of your Airdrops-Geo project
2. Update the Telegram configuration with your actual values:

```
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

3. Save the file

## Step 5: Restart Your Server

1. Restart your Node.js server to apply the changes
2. Create or update an airdrop to test the integration

## Troubleshooting

If airdrops are not being posted to your Telegram channel/group:

1. Check the server logs for any errors related to Telegram
2. Verify that your bot has admin privileges in the channel/group
3. Make sure the `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct in your `.env` file
4. Ensure your bot is not blocked or restricted in the channel/group

## Customizing the Message Format

If you want to customize how airdrops appear in Telegram:

1. Open `server/services/telegramService.js`
2. Modify the `formatAirdropMessage` function to change the message format
3. Save the file and restart your server

## Additional Features

You can enhance the Telegram integration with features like:

- Adding inline buttons to the messages for direct actions
- Including images or logos with the airdrops
- Creating commands for users to interact with your bot
- Setting up notifications for other events (e.g., when an airdrop is about to expire)

For more information on Telegram Bot API capabilities, visit the [official documentation](https://core.telegram.org/bots/api).

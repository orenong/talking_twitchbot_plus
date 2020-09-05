# talking_twitchbot_plus
A javascript bot for twitch that uses the chat like a human and communicates with other chatters



# Use cases
The bot can theoretically be used to make artificial chat interaction in your chat, it will react to the amount of responses in your chat and will not chat by its own if there are no other people, but this use case is not recommended, this bot will NOT be human like enough and it's not a moral use.
I recommend to use it as an enchantment to your stream, tell people it's a bot, or name it something with bot, and people will enjoy talking to it.
**Do not** use the bot on other people's streams without their permission.



# Setup
I recommand using the bot on glitch.io twitch chatbot template, you can read more about it here: https://dev.twitch.tv/docs/irc, follow the usual steps and replace bot.js with bot.js from this page.

under
  identity:
    username: "NAME" : name should be the username of the bot
    password: "PASS" : PASS is the TMI of your bot's twitch account, you can find it here: https://twitchapps.com/tmi/ when connected to your bot's account
  },
  channels:
    "CHANNEL" un comment this part if it's commented, and add the name of the channel you want the bot to run on, do not use channels without permission, as it violets the terms of service of twitch

# Commands

all commands names are changeable on the script, these are the default names, they need to be written alone in the text messege on the chat and the bot will react to them
I recommend changing the names so other people will not have access to them

!resetBot - clears the memoery of the bot and the settings
!statusBot - prints usefull info about the bot status to the chat
!fastBot - sets the bot to fast speed
!normalBot - sets the bot to normal speed
!slowBot - sets the bot to slow speed
!memBot - prints the memory of the bot to the chat, usefull for debugging

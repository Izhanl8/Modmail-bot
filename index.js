///////////////////ModMail Bot///////////////////////

const discord = require("discord.js");

const { token, prefix, ServerID } = require("./config.json");
const client = new Client();



function presence(){
  client.user.setPresence({
      status:"online",
      activity: {
        name: "my Dm's",
        type: "WATCHING"
      }
  })
}
client.on("ready", () => {
   console.log("Bot on!");
   presence();
});

client.on("channelDelete", (channel) => {
    if(channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if(!person) return;

        let yembed = new discord.MessageEmbed()
        .setAuthor("Closed ticket", client.user.displayAvatarURL())
        .setColor('RED')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription("Your ticket has been deleted by the moderator and if you have a problem with it, you can open the ticket again by sending a message here.")
    return person.send(yembed)
    
    }


})


client.on("message", async message => {
  if(message.author.bot) return;

  let args = message.content.slice(prefix.length).split(' ');
  let command = args.shift().toLowerCase();


  if(message.guild) {
      if(command == "setup") {
          if(!message.member.hasPermission("ADMINISTRATOR")) {
              return message.channel.send("**You need administrator permission to be able to use that command**")
          }

          let role = message.guild.roles.cache.find((x) => x.name == "HELPER")
          let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

          if(!role) {
              role = await message.guild.roles.create({
                  data: {
                      name: "HELPER",
                      color: "RED"
                  },
                  reason: "Role needed for ModMail System"
              })
          }

          await message.guild.channels.create("MODMAIL", {
              type: "category",
              topic: "All the mail will be here",
              permissionOverwrites: [
                  {
                      id: role.id,
                      allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                  }, 
                  {
                      id: everyone.id,
                      deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                  }
              ]
          })


          return message.channel.send("**ModMail setup has been created**")

      } else if(command == "close") {


        if(message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
            
            const person = message.guild.members.cache.get(message.channel.name)

            if(!person) {
                return message.channel.send("**I cannot close the channel and this error occurs because the channel was probably renamed.**")
            }

            await message.channel.delete()

            let yembed = new discord.MessageEmbed()
            .setAuthor("TICKET CLOSED", client.user.displayAvatarURL())
            .setColor("RED")
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter("Ticket closed for " + message.author.username)
            if(args[0]) yembed.setDescription(args.join(" "))

            return person.send(yembed)

        }
      } else if(command == "open") {
          const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

          if(!category) {
              return message.channel.send("The moderation system is not configured on this server, use " + prefix + "setup")
          }

          if(!message.member.roles.cache.find((x) => x.name == "HELPER")) {
              return message.channel.send("You need the corresponding role to use this command")
          }

          if(isNaN(args[0]) || !args.length) {
              return message.channel.send("**Please give me the user's IP**")
          }

          const target = message.guild.members.cache.find((x) => x.id === args[0])

          if(!target) {
              return message.channel.send("**Disabled for this user**")
          }


          const channel = await message.guild.channels.create(target.id, {
              type: "text",
            parent: category.id,
            topic: "The ticket has been opened by **" + message.author.username + "** To contact with " + message.author.tag
          })

          let nembed = new discord.MessageEmbed()
          .setAuthor("Details", target.user.displayAvatarURL({dynamic: true}))
          .setColor("RANDOM")
          .setThumbnail(target.user.displayAvatarURL({dynamic: true}))
          .setDescription(message.content)
          .addField("NAME", target.user.username)
          .addField("Account created on ", target.user.createdAt)
          .addField("Direct contact", "yes (means this email is opened by a collaborator)");

          channel.send(nembed)

          let uembed = new discord.MessageEmbed()
          .setAuthor("Direct open ticket")
          .setColor("GREEN")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription("The ticket has been opened by**" + message.guild.name + "**,Please wait until I send you another message!");
          
          
          target.send(uembed);

          let newEmbed = new discord.MessageEmbed()
          .setDescription("Open a ticket: <#" + channel + ">")
          .setColor("RANDOM");

          return message.channel.send(newEmbed);
      } else if(command == "helpmodmail") {
          let embed = new discord.MessageEmbed()
          .setAuthor('ModMail Bot!', client.user.displayAvatarURL())
          .setColor("RANDOM")
          
        .setDescription("This is only for reports or doubts")
        .addField(prefix + "setup", "Add the ticket system", true)
  
        .addField(prefix + "open", "Open a ticket with the person's id", true)
        .setThumbnail(client.user.displayAvatarURL())
                    .addField(prefix + "close", "Use the command to close the direct ticket ", true);

                    return message.channel.send(embed)
          
      }
  } 
  
  
  
  
  
  
  
  if(message.channel.parentID) {

    const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")
    
    if(message.channel.parentID == category.id) {
        let member = message.guild.members.cache.get(message.channel.name)
    
        if(!member) return message.channel.send("Can't send the message")
    
        let lembed = new discord.MessageEmbed()
        .setColor("GREEN")
        .setFooter(message.author.username, message.author.displayAvatarURL({dynamic: true}))
        .setDescription(message.content)
    
        return member.send(lembed)
    }
    
    
      } 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if(!message.guild) {
      const guild = await client.guilds.cache.get(ServerID);
      if(!guild) return;

      const main = guild.channels.cache.find((x) => x.name == message.author.id)
      const category = guild.channels.cache.find((x) => x.name == "MODMAIL")


      if(!main) {
          let mx = await guild.channels.create(message.author.id, {
              type: "text",
              parent: category.id,
              topic: "This ticket is created to help  **" + message.author.tag + " **"
          })

          let sembed = new discord.MessageEmbed()
          .setAuthor("OPNE TICKET!")
          .setColor("GREEN")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription("Now you are in contact with the support team")

          message.author.send(sembed)


          let eembed = new discord.MessageEmbed()
          .setAuthor("Details", message.author.displayAvatarURL({dynamic: true}))
          .setColor("BLUE")
          .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
          .setDescription(message.content)
          .addField("NAME", message.author.username)
          .addField("Account created on: ", message.author.createdAt)
          .addField("Direct contact "," NO (means that this email is opened by a person who is not from the support team)")


        return mx.send(eembed)
      }

      let xembed = new discord.MessageEmbed()
      .setColor("RANDOM")
      .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
      .setDescription(message.content)


      main.send(xembed)

  } 
  
  
  
 
})


client.login(token) 

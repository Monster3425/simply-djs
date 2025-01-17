const Discord = require('discord.js')
let ms = require('ms')

async function giveawaySystem(client, db, message, options = []) {
  try {
    if (options.slash === true) {
      let interaction = message
      if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.followUp({ content: 'You are not a admin to start the giveaway', ephemeral: true });

      let ch = interaction.options.getChannel('channel') || interaction.channel
      let time = interaction.options.getString('time')
      let winers = interaction.options.getInteger('winners')
      let prize = interaction.options.getString('prize')

      const enter = new Discord.MessageButton()
        .setLabel('Enter')
        .setStyle('SUCCESS')
        .setCustomId('enter-giveaway')

      const reroll = new Discord.MessageButton()
        .setLabel('Reroll')
        .setStyle('PRIMARY')
        .setDisabled(true)
        .setCustomId('reroll-giveaway')

      const end = new Discord.MessageButton()
        .setLabel('End')
        .setStyle('DANGER')
        .setCustomId('end-giveaway')

      let whytime = Number((Date.now() + ms(time)).toString().slice(0, -3))

      const row = new Discord.MessageActionRow()
        .addComponents([enter, reroll, end])

      const embed = new Discord.MessageEmbed()
        .setTitle(options.embedTitle || 'Giveaways')
        .setColor('BLURPLE')
        .setTimestamp(Number(Date.now() + ms(time)))
        .setFooter('Ends ', 'https://media.discordapp.net/attachments/867344516600037396/881941206513377331/869185703228084285.gif')
        .setDescription(`React with the buttons to interact with giveaway.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**⌛ Ends:** <t:${whytime}:R>\n\n**🎉 Hosted By:** ***${message.user}***`)
        .addFields(
          { name: '🏆 Winner(s):', value: `**${options.winners || winers}**` },
          { name: '💝 People Entered', value: `***0***` },

        )
      ch.send({ embeds: [embed], components: [row] }).then(async m => {
        interaction.followUp({ content: 'Giveaway has started..', ephemeral: true })

        let timeroe = setTimeout(async () => {
          let wino = []

          interaction.guild.members.cache.forEach(async (mem) => {
            let givWin = await db.get(`giveaway_${m.id}_${mem.id}`)

            if (givWin === null || !givWin)
              return;
            else if (givWin === mem.id) {
              wino.push(givWin)
            }

            const embeddd = new Discord.MessageEmbed()
              .setTitle('Processing Data...')
              .setColor('BLURPLE')
              .setDescription(`Please wait.. We are Processing the winner with magiks`)
              .setFooter("Giveaway Ending.. Wait a moment.")


            m.edit({ embeds: [embeddd], components: [] })


          })


          setTimeout(async () => {
            let winner = []
            let winboiz = []

            if (wino.length === 0 || wino === []) {

              const embedod = new Discord.MessageEmbed()
                .setTitle('No one Entered.')
                .setColor('BLURPLE')
                .setDescription(`**Sadly No one entered the giveaway ;(**\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**🎉 Hosted By:** ***${message.user}***`)
                .addFields(
                  { name: '🏆 Winner(s):', value: `none` },
                  { name: '💝 People Entered', value: `***0***` },

                )
                .setFooter("Giveaway Ended.")

              m.edit({ embeds: [embedod], components: [] })

            } else {

              const enterr = new Discord.MessageButton()
                .setLabel('Enter')
                .setStyle('SUCCESS')
                .setDisabled(true)
                .setCustomId('enter-giveaway')

              const rerolll = new Discord.MessageButton()
                .setLabel('Reroll')
                .setStyle('PRIMARY')
                .setCustomId('reroll-giveaway')

              const endd = new Discord.MessageButton()
                .setLabel('End')
                .setDisabled(true)
                .setStyle('DANGER')
                .setCustomId('end-giveaway')

              const roww = new Discord.MessageActionRow()
                .addComponents([enterr, rerolll, endd])

              let winnerNumber = options.winners || winers

              for (let i = 0; winnerNumber > i; i++) {
                await db.set(`giveaway_winnerCount_${m.id}`, winnerNumber)

                let winnumber = Math.floor((Math.random() * wino.length))
                if (wino[winnumber] === undefined) {
                  winner.push(`\u200b`)
                  winboiz.push('\u200b')
                  wino.splice(winnumber, 1);
                } else {
                  let winnee = winner.push((`\n***<@${wino[winnumber]}>*** **(ID: ${wino[winnumber]})**`).replace(',', ''))
                  winboiz.push(`<@${wino[winnumber]}>`)
                  wino.splice(winnumber, 1);
                  await db.delete(`giveaway_${m.id}_${wino[winnumber]}`)
                }
              }
              let entero = await db.get(`giveaway_entered_${m.id}`)

              const embedd = new Discord.MessageEmbed()
                .setTitle(options.embedTitle || 'Giveaway Ended')
                .setColor(0x3BB143)
                .setDescription(`Giveaway ended. YAY.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**🎉 Hosted By:** ***${message.user}***`)
                .addFields(
                  { name: '🏆 Winner(s):', value: `${winner}` },
                  { name: '💝 People Entered', value: `***${entero}***` },

                )
                .setFooter("Giveaway Ended.")


              const embb = new Discord.MessageEmbed()
                .setColor(0x3BB143)
                .setTitle('You just won the giveaway.')
                .setDescription(`🏆 Winner(s): ***${winnerNumber}***`)
                .setFooter("Dm the host to claim your prize 0_0")


              const gothere = new Discord.MessageButton()
                .setLabel('View Giveaway')
                .setStyle('LINK')
                .setURL(m.url)

              const ro = new Discord.MessageActionRow()
                .addComponents([gothere])

              m.channel.send({ content: `Congrats ${winboiz}. You just won the giveaway.`, embeds: [embb], components: [ro] }).then(async m => {
                await db.set(`giveaway_${button.message.id}_yaywon`, m.id)
              })

              m.edit({ embeds: [embedd], components: [roww] })


            }
          }, 5000)
        }, ms(time))

        let collecto = m.createMessageComponentCollector({ type: 'BUTTON', time: ms(time) * 10 })

        collecto.on('collect', async button => {
          if (button.customId === 'end-giveaway') {
            if (button.member.permissions.has('ADMINISTRATOR')) {
              clearTimeout(timeroe)
            }
          }
          if (button.customId === 'enter-giveaway') {

            let rualive = await db.get(`giveaway_${button.message.id}_${button.user.id}`)

            if (rualive === button.user.id) {
              button.reply({ content: 'You have already entered the giveaway... Removing you from giveaways. Enter again if this is unintentional.', ephemeral: true })
              await db.delete(`giveaway_${button.message.id}_${button.user.id}`)

              let enteroo = await db.get(`giveaway_entered_${m.id}`)
              await db.set(`giveaway_entered_${button.message.id}`, enteroo - 1)

              const embed = new Discord.MessageEmbed()
                .setTitle(options.embedTitle || 'Giveaways')
                .setColor(0x075FFF)
                .setTimestamp(Number(Date.now() + ms(time)))
                .setFooter('Ends at ', 'https://media.discordapp.net/attachments/867344516600037396/881941206513377331/869185703228084285.gif')
                .setDescription(`React with the buttons to interact with giveaway.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**⌛ Ends:** <t:${whytime}:R>\n\n**🎉 Hosted By:** ***${message.user}***`)
                .addFields(
                  { name: '🏆 Winner(s):', value: `${options.winners || winers}` },
                  { name: '💝 People Entered', value: `***${enteroo - 1}***` },

                )

              m.edit({ embeds: [embed] })

            } else {

              button.reply({ content: 'You have entered to the giveaway.', ephemeral: true })
              await db.set(`giveaway_${button.message.id}_${button.user.id}`, button.user.id)

              let enteroo = await db.get(`giveaway_entered_${m.id}`)
              await db.set(`giveaway_entered_${button.message.id}`, enteroo + 1)

              const embed = new Discord.MessageEmbed()
                .setTitle(options.embedTitle || 'Giveaways')
                .setColor(0x075FFF)
                .setTimestamp(Number(Date.now() + ms(time)))
                .setFooter('Ends at ', 'https://media.discordapp.net/attachments/867344516600037396/881941206513377331/869185703228084285.gif')
                .setDescription(`React with the buttons to interact with giveaway.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**⌛ Ends:** <t:${whytime}:R>\n\n**🎉 Hosted By:** ***${message.user}***`)
                .addFields(
                  { name: '🏆 Winner(s):', value: `${options.winners || winers}` },
                  { name: '💝 People Entered', value: `***${enteroo + 1}***` },

                )

              m.edit({ embeds: [embed] })

            }
          }

        })

      })
    } else
      if (!options.slash || options.slash === false) {
        let interaction = message

        if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'You are not a admin to start the giveaway' });
        let args = options.args
        if (!args) throw new Error('Specify args in options.. When using slash: false | If you are trying to use it in slash commands.. Have slash: true in options')
        let ch = options.channel || interaction.channel
        let time = options.time || args[0]
        let winers = options.winner || args[1]
        let prize = options.prize || args.slice(2).join(' ')

        const enter = new Discord.MessageButton()
          .setLabel('Enter')
          .setStyle('SUCCESS')
          .setCustomId('enter-giveaway')

        const reroll = new Discord.MessageButton()
          .setLabel('Reroll')
          .setStyle('PRIMARY')
          .setDisabled(true)
          .setCustomId('reroll-giveaway')

        const end = new Discord.MessageButton()
          .setLabel('End')
          .setStyle('DANGER')
          .setCustomId('end-giveaway')

        let whytime = Number((Date.now() + ms(time)).toString().slice(0, -3))

        const row = new Discord.MessageActionRow()
          .addComponents([enter, reroll, end])

        const embed = new Discord.MessageEmbed()
          .setTitle(options.embedTitle || 'Giveaways')
          .setColor(0x075FFF)
          .setTimestamp(Number(Date.now() + ms(time)))
          .setFooter('Ends ', 'https://media.discordapp.net/attachments/867344516600037396/881941206513377331/869185703228084285.gif')
          .setDescription(`React with the buttons to interact with giveaway.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**⌛ Ends:** <t:${whytime}:R>\n\n**🎉 Hosted By:** ***${message.user}***`)
          .addFields(
            { name: '🏆 Winner(s):', value: `**${options.winners || winers}**` },
            { name: '💝 People Entered', value: `***0***` },

          )
        ch.send({ embeds: [embed], components: [row] }).then(async m => {
          interaction.reply({ content: 'Giveaway has started..', ephemeral: true })

          let timeroe = setTimeout(async () => {
            let wino = []

            interaction.guild.members.cache.forEach(async (mem) => {
              let givWin = await db.get(`giveaway_${m.id}_${mem.id}`)

              if (givWin === null || !givWin)
                return;
              else if (givWin === mem.id) {
                wino.push(givWin)
              }

              const embeddd = new Discord.MessageEmbed()
                .setTitle('Processing Data...')
                .setColor(0xcc0000)
                .setDescription(`Please wait.. We are Processing the winner with magiks`)
                .setFooter("Giveaway Ending.. Wait a moment.")


              m.edit({ embeds: [embeddd], components: [] })


            })


            setTimeout(async () => {
              let winner = []
              let winboiz = []

              if (wino.length === 0 || wino === []) {

                const embedod = new Discord.MessageEmbed()
                  .setTitle('No one Entered.')
                  .setColor(0xcc0000)
                  .setDescription(`**Sadly No one entered the giveaway ;(**\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**🎉 Hosted By:** ***${message.user}***`)
                  .addFields(
                    { name: '🏆 Winner(s):', value: `none` },
                    { name: '💝 People Entered', value: `***0***` },

                  )
                  .setFooter("Giveaway Ended.")

                m.edit({ embeds: [embedod], components: [] })

              } else {

                const enterr = new Discord.MessageButton()
                  .setLabel('Enter')
                  .setStyle('SUCCESS')
                  .setDisabled(true)
                  .setCustomId('enter-giveaway')

                const rerolll = new Discord.MessageButton()
                  .setLabel('Reroll')
                  .setStyle('PRIMARY')
                  .setCustomId('reroll-giveaway')

                const endd = new Discord.MessageButton()
                  .setLabel('End')
                  .setDisabled(true)
                  .setStyle('DANGER')
                  .setCustomId('end-giveaway')

                const roww = new Discord.MessageActionRow()
                  .addComponents([enterr, rerolll, endd])

                let winnerNumber = options.winners || winers

                for (let i = 0; winnerNumber > i; i++) {
                  await db.set(`giveaway_winnerCount_${m.id}`, winnerNumber)

                  let winnumber = Math.floor((Math.random() * wino.length))
                  if (wino[winnumber] === undefined) {
                    winner.push(`\u200b`)
                    winboiz.push('\u200b')
                    wino.splice(winnumber, 1);
                  } else {
                    let winnee = winner.push((`\n***<@${wino[winnumber]}>*** **(ID: ${wino[winnumber]})**`).replace(',', ''))
                    winboiz.push(`<@${wino[winnumber]}>`)
                    wino.splice(winnumber, 1);
                    await db.delete(`giveaway_${m.id}_${wino[winnumber]}`)
                  }
                }
                let entero = await db.get(`giveaway_entered_${m.id}`)

                const embedd = new Discord.MessageEmbed()
                  .setTitle(options.embedTitle || 'Giveaway Ended')
                  .setColor(0x3BB143)
                  .setDescription(`Giveaway ended. YAY.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**🎉 Hosted By:** ***${message.user}***`)
                  .addFields(
                    { name: '🏆 Winner(s):', value: `${winner}` },
                    { name: '💝 People Entered', value: `***${entero}***` },

                  )
                  .setFooter("Giveaway Ended.")


                const embb = new Discord.MessageEmbed()
                  .setColor(0x3BB143)
                  .setTitle('You just won the giveaway.')
                  .setDescription(`🏆 Winner(s): ***${winnerNumber}***`)
                  .setFooter("Dm the host to claim your prize 0_0")


                const gothere = new Discord.MessageButton()
                  .setLabel('View Giveaway')
                  .setStyle('LINK')
                  .setURL(button.message.url)

                const ro = new Discord.MessageActionRow()
                  .addComponents([gothere])

                m.channel.send({ content: `Congrats ${winboiz}. You just won the giveaway.`, embeds: [embb], components: [ro] }).then(async m => {
                  await db.set(`giveaway_${button.message.id}_yaywon`, m.id)
                })

                m.edit({ embeds: [embedd], components: [roww] })


              }
            }, 5000)
          }, ms(time))

          let collecto = m.createMessageComponentCollector({ type: 'BUTTON', time: ms(time) * 10 })

          collecto.on('collect', async button => {
            if (button.customId === 'end-giveaway') {
              if (button.member.permissions.has('ADMINISTRATOR')) {
                clearTimeout(timeroe)
              }
            }
            if (button.customId === 'enter-giveaway') {

              let rualive = await db.get(`giveaway_${button.message.id}_${button.user.id}`)

              if (rualive === button.user.id) {
                button.reply({ content: 'You have already entered the giveaway... Removing you from giveaways. Enter again if this is unintentional.', ephemeral: true })
                await db.delete(`giveaway_${button.message.id}_${button.user.id}`)

                let enteroo = await db.get(`giveaway_entered_${m.id}`)
                await db.set(`giveaway_entered_${button.message.id}`, enteroo - 1)

                const embed = new Discord.MessageEmbed()
                  .setTitle(options.embedTitle || 'Giveaways')
                  .setColor(0x075FFF)
                  .setTimestamp(Number(Date.now() + ms(time)))
                  .setFooter('Ends at ', 'https://media.discordapp.net/attachments/867344516600037396/881941206513377331/869185703228084285.gif')
                  .setDescription(`React with the buttons to interact with giveaway.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**⌛ Ends:** <t:${whytime}:R>\n\n**🎉 Hosted By:** ***${message.user}***`)
                  .addFields(
                    { name: '🏆 Winner(s):', value: `${options.winners || winers}` },
                    { name: '💝 People Entered', value: `***${enteroo - 1}***` },

                  )

                m.edit({ embeds: [embed] })

              } else {

                button.reply({ content: 'You have entered to the giveaway.', ephemeral: true })
                await db.set(`giveaway_${button.message.id}_${button.user.id}`, button.user.id)

                let enteroo = await db.get(`giveaway_entered_${m.id}`)
                await db.set(`giveaway_entered_${button.message.id}`, enteroo + 1)

                const embed = new Discord.MessageEmbed()
                  .setTitle(options.embedTitle || 'Giveaways')
                  .setColor(0x075FFF)
                  .setTimestamp(Number(Date.now() + ms(time)))
                  .setFooter('Ends at ', 'https://media.discordapp.net/attachments/867344516600037396/881941206513377331/869185703228084285.gif')
                  .setDescription(`React with the buttons to interact with giveaway.\n\n**🎁 Prize:** ***${options.prize || prize}***\n\n**⌛ Ends:** <t:${whytime}:R>\n\n**🎉 Hosted By:** ***${message.user}***`)
                  .addFields(
                    { name: '🏆 Winner(s):', value: `${options.winners || winers}` },
                    { name: '💝 People Entered', value: `***${enteroo + 1}***` },

                  )

                m.edit({ embeds: [embed] })

              }
            }

          })

        })
      }
  } catch (err) {
    console.log(`Error Occured. | giveawaySystem | Error: ${err.stack}`)
  }
}

module.exports = giveawaySystem;
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActivityType, AttachmentBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const http = require('http');

// Servidor para mantener vivo el bot en servicios como Koyeb
http.createServer((req, res) => { res.write("ShowMC | Sistema Online"); res.end(); }).listen(8080);

// --- CONFIGURACIÓN ACTUALIZADA ---
const TOKEN = 'MTQ2MTU2MTQ3OTA0NzQxMzg1Mg.Grvnr1.xqGxUw5nLSG6nwHjOy38PEq6Pf-TZtSXJMAVEc'; 
const CLIENT_ID = '1461561479047413852';
const MI_ID = '1458973988234727495'; 

// IDs Solicitados por el usuario
const ROL_PERMITIDO_1 = '1460923684347707542'; 
const ROL_PERMITIDO_2 = '1460923685727633454'; 
const CAT_TICKETS = '1461555248261894165'; 
const CANAL_LOGS = '1461555290406125855'; 
const IMAGEN_EMBED = 'https://media.discordapp.net/attachments/1461484900636164212/1461563409513316476/unnamed.jpg?ex=696b027f&is=6969b0ff&hm=c3d4e5bdd3b430b4824cd932691b21f241c1d5e31634fe6909e9d0b749ebe81b&=&format=webp';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const commands = [
    new SlashCommandBuilder().setName('setup-tickets').setDescription('🛠️ Desplegar panel de soporte ShowMC'),
    new SlashCommandBuilder()
        .setName('limpiar')
        .setDescription('🧹 Borrar mensajes')
        .addIntegerOption(o => o.setName('cantidad').setDescription('Número de mensajes').setRequired(true))
].map(c => c.toJSON());

client.once('ready', async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        client.user.setActivity('ShowMC en processing...🎮', { type: ActivityType.Playing });
        console.log("✅ ShowMC Bot Online");
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    // Verificación de Rangos Específicos
    const esStaff = interaction.user.id === MI_ID || 
                    interaction.member?.roles.cache.has(ROL_PERMITIDO_1) || 
                    interaction.member?.roles.cache.has(ROL_PERMITIDO_2);

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup-tickets') {
            if (!esStaff) return interaction.reply({ content: '❌ No tienes los rangos necesarios para usar este comando.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Centro de Asistencia ShowMC', iconURL: interaction.guild.iconURL() })
                .setTitle('📩 SISTEMA DE SOPORTE INTEGRAL')
                .setDescription('Bienvenido al soporte oficial. Selecciona la categoría adecuada.\n\n**Categorías:**\n❓ **Dudas:** Consultas generales.\n🛒 **Compras:** Problemas con la tienda.\n🚫 **Reportes:** Errores o jugadores.\n🤝 **Postulaciones:** Formar parte del equipo.\n🎥 **Media Team:** Rango Media.')
                .setColor(0x2b2d31)
                .setImage(IMAGEN_EMBED) 
                .setFooter({ text: 'ShowMC • Responderemos lo antes posible', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('menu_showmc').setPlaceholder('💎 Selecciona una categoría aquí').addOptions([
                    { label: 'Dudas / Problemas', value: 'soporte', emoji: '❓' },
                    { label: 'Compras / Tienda', value: 'compras', emoji: '🛒' },
                    { label: 'Reportes / Bugs', value: 'reportes', emoji: '🚫' },
                    { label: 'Postulaciones Staff', value: 'staff', emoji: '🤝' },
                    { label: 'Media Team', value: 'mediateam', emoji: '🎥' }
                ])
            );

            await interaction.channel.send({ embeds: [embed], components: [menu] });
            return interaction.reply({ content: '✅ Panel configurado correctamente.', ephemeral: true });
        }

        if (interaction.commandName === 'limpiar') {
            if (!esStaff) return interaction.reply({ content: '❌ No tienes permiso.', ephemeral: true });
            const cantidad = interaction.options.getInteger('cantidad');
            await interaction.channel.bulkDelete(cantidad > 100 ? 100 : cantidad, true);
            return interaction.reply({ content: `🧹 Borrados ${cantidad} mensajes.`, ephemeral: true });
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'menu_showmc') {
        const opcion = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${opcion}`).setTitle(`Soporte: ${opcion.toUpperCase()}`);
        const input = new TextInputBuilder().setCustomId('razon').setLabel('Explica tu caso detalladamente:').setStyle(TextInputStyle.Paragraph).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_')) {
        const tipo = interaction.customId.replace('modal_', '');
        const razon = interaction.fields.getTextInputValue('razon');

        const canal = await interaction.guild.channels.create({
            name: `${tipo}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CAT_TICKETS, 
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                { id: ROL_PERMITIDO_1, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: ROL_PERMITIDO_2, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const embedTicket = new EmbedBuilder()
            .setTitle(`✨ TICKET DE ${tipo.toUpperCase()}`)
            .setDescription(`Hola ${interaction.user}, el staff te atenderá pronto.\n\n**Razón:**\n\`\`\`${razon}\`\`\``)
            .setColor(0x00ff88);

        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('tomar_ticket').setLabel('Tomar Ticket').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger)
        );

        await canal.send({ content: `${interaction.user} | <@&${ROL_PERMITIDO_1}> <@&${ROL_PERMITIDO_2}>`, embeds: [embedTicket], components: [btns] });
        return interaction.reply({ content: `✅ Ticket creado en ${canal}`, ephemeral: true });
    }

    if (interaction.customId === 'tomar_ticket') {
        if (!esStaff) return interaction.reply({ content: 'Solo el Staff puede tomar tickets.', ephemeral: true });
        await interaction.channel.send({ content: `🙋‍♂️ El Staff **${interaction.user}** ha tomado este ticket.` });
        const rowMod = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('tomar_ticket').setLabel('En proceso...').setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger)
        );
        return interaction.update({ components: [rowMod] });
    }

    if (interaction.customId === 'cerrar_ticket') {
        if (!esStaff) return interaction.reply({ content: 'Solo el Staff puede cerrar tickets.', ephemeral: true });
        
        await interaction.reply('Generando transcripción...');
        const mensajes = await interaction.channel.messages.fetch({ limit: 100 });
        let log = `TRANSCRIPCIÓN SHOWMC - ${interaction.channel.name.toUpperCase()}\n------------------------------------------\n`;
        mensajes.reverse().forEach(m => {
            log += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
        });

        const attachment = new AttachmentBuilder(Buffer.from(log, 'utf-8'), { name: `log-${interaction.channel.name}.txt` });
        const logChannel = client.channels.cache.get(CANAL_LOGS); 
        
        if (logChannel) {
            await logChannel.send({ 
                content: `🔒 **Ticket Cerrado:** \`${interaction.channel.name}\` por ${interaction.user}`, 
                files: [attachment] 
            });
        }

        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(TOKEN);
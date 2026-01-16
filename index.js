const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActivityType, AttachmentBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const http = require('http');

// Servidor para Render / Puerto 8080
http.createServer((req, res) => { res.write("ShowMC | Sistema Online"); res.end(); }).listen(8080);

// --- CONFIGURACIÓN SEGURA ---
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = '1461561479047413852';
const MI_ID = '1458973988234727495'; 

// IDs del Servidor ShowMC
const ROL_PERMITIDO_1 = '1460923684347707542'; 
const ROL_PERMITIDO_2 = '1460923685727633454'; 
const CAT_TICKETS = '1461555248261894165'; 
const CANAL_LOGS = '1461555290406125855'; 
const IMAGEN_EMBED = 'https://media.discordapp.net/attachments/1461484900636164212/1461563409513316476/unnamed.jpg?ex=696b027f&is=6969b0ff&hm=c3d4e5bdd3b430b4824cd932691b21f241c1d5e31634fe6909e9d0b749ebe81b&=&format=webp';

// --- NUEVOS AJUSTES (Bienvenida y Verificación) ---
const CANAL_BIENVENIDA = '1460923924249448448'; 
const ROL_USUARIO = '1460923741541371914'; // ID de rol actualizada

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const commands = [
    new SlashCommandBuilder().setName('setup-tickets').setDescription('🛠️ Desplegar panel de soporte ShowMC'),
    new SlashCommandBuilder().setName('setup-verificacion').setDescription('🛡️ Desplegar panel de verificación'),
    new SlashCommandBuilder()
        .setName('limpiar')
        .setDescription('🧹 Borrar mensajes')
        .addIntegerOption(o => o.setName('cantidad').setDescription('Número de mensajes').setRequired(true))
].map(c => c.toJSON());

// --- SISTEMA DE BIENVENIDAS ---
client.on('guildMemberAdd', async member => {
    const canal = member.guild.channels.cache.get(CANAL_BIENVENIDA);
    if (!canal) return;

    const embedBienvenida = new EmbedBuilder()
        .setTitle('👋 ¡Bienvenido a ShowMC Network!')
        .setDescription(`Hola ${member}, gracias por unirte a nuestra comunidad.\n\n**Recuerda hacer lo siguiente:**\n🛡️ Verifícate en el canal correspondiente.\n📜 Lee las normas en <#1460923926900248577>.\n🎮 ¡Disfruta de tu estancia!`)
        .setColor(0x00fbff)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: `Miembro #${member.guild.memberCount}`, iconURL: member.guild.iconURL() })
        .setTimestamp();

    canal.send({ content: `¡Bienvenido ${member}!`, embeds: [embedBienvenida] });
});

client.once('ready', async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        client.user.setActivity('ShowMC Network | 2026', { type: ActivityType.Watching });
        console.log("✅ ShowMC Bot Online");
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    const esStaff = interaction.user.id === MI_ID || 
                    interaction.member?.roles.cache.has(ROL_PERMITIDO_1) || 
                    interaction.member?.roles.cache.has(ROL_PERMITIDO_2);

    if (interaction.isChatInputCommand()) {
        // --- SETUP VERIFICACIÓN ---
        if (interaction.commandName === 'setup-verificacion') {
            if (!esStaff) return interaction.reply({ content: '❌ No tienes permiso.', ephemeral: true });

            const embedVerif = new EmbedBuilder()
                .setTitle('🛡️ Centro de Verificación | ShowMC Network')
                .setDescription('¡Bienvenido a la comunidad oficial de **ShowMC Minecraft Server**! 🎮\n\nPara acceder a todos nuestros canales, participar en eventos y comenzar tu aventura en el servidor, presiona el botón de abajo para obtener tu rango de usuario.')
                .addFields({ name: '📌 Nota:', value: 'Al verificarte aceptas las normas de nuestra red de Minecraft.' })
                .setColor(0x00fbff)
                .setFooter({ text: 'ShowMC Network' });

            const btnVerif = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verificar_usuario').setLabel('Verificarse').setStyle(ButtonStyle.Success).setEmoji('✅')
            );

            await interaction.channel.send({ embeds: [embedVerif], components: [btnVerif] });
            return interaction.reply({ content: '✅ Panel de verificación enviado.', ephemeral: true });
        }

        if (interaction.commandName === 'setup-tickets') {
            if (!esStaff) return interaction.reply({ content: '❌ No tienes permiso.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'ShowMC Network', iconURL: interaction.guild.iconURL() })
                .setTitle('Soporte | Sistema de Ticket')
                .setDescription(
                    'Para comenzar una nueva solicitud de soporte, debes darle click al menú interactivo que aparece en la parte inferior y elegir la categoría correcta; de lo contrario, no recibirás soporte.\n\n' +
                    '**・ Categorías Disponibles:**\n' +
                    '> ❓ Soporte / Dudas\n' +
                    '> 🛒 Tienda / Compras\n' +
                    '> 👤 Unregister / Cuenta\n' +
                    '> ⚖️ Apelaciones\n' +
                    '> 🎥 Media Team\n' +
                    '> 🚫 Reportes Jugadores\n' +
                    '> 👮 Reportes Staff\n' +
                    '> 🔄 Revives / Rewards Boost\n\n' +
                    '**・ Información Importante:**\n' +
                    '| Abusar de nuestro sistema de tickets conllevará a sanciones no apelables.\n' +
                    '| Al abrir un ticket, ten siempre pruebas a mano (fotos/vídeos).\n' +
                    '| Los tickets inactivos por 4 horas se cerrarán automáticamente.\n\n' +
                    '**Antes de preguntar, revisa nuestras normas aquí:**\n<#1460923926900248577>'
                )
                .setColor(0x00fbff)
                .setImage(IMAGEN_EMBED)
                .setFooter({ text: 'ShowMC Network | Soporte 2026', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_showmc')
                    .setPlaceholder('💎 Selecciona una categoría aquí')
                    .addOptions([
                        { label: 'Soporte General', value: 'soporte', emoji: '❓' },
                        { label: 'Tienda', value: 'tienda', emoji: '🛒' },
                        { label: 'Unregister', value: 'unregister', emoji: '👤' },
                        { label: 'Apelaciones', value: 'apelaciones', emoji: '⚖️' },
                        { label: 'Media Team', value: 'mediateam', emoji: '🎥' },
                        { label: 'Reportes Jugadores', value: 'reportes_jugadores', emoji: '🚫' },
                        { label: 'Reportes Staff', value: 'reportes_staff', emoji: '👮' },
                        { label: 'Revives / Rewards', value: 'revives', emoji: '🔄' }
                    ])
            );

            await interaction.channel.send({ embeds: [embed], components: [menu] });
            return interaction.reply({ content: '✅ Panel enviado correctamente.', ephemeral: true });
        }

        if (interaction.commandName === 'limpiar') {
            if (!esStaff) return interaction.reply({ content: '❌ No tienes permiso.', ephemeral: true });
            const cantidad = interaction.options.getInteger('cantidad');
            await interaction.channel.bulkDelete(cantidad > 100 ? 100 : cantidad, true);
            return interaction.reply({ content: `🧹 Borrados ${cantidad} mensajes.`, ephemeral: true });
        }
    }

    // --- MANEJO DE VERIFICACIÓN ---
    if (interaction.customId === 'verificar_usuario') {
        const rol = interaction.guild.roles.cache.get(ROL_USUARIO);
        if (!rol) return interaction.reply({ content: '❌ Error: El rol de verificación no existe.', ephemeral: true });
        
        await interaction.member.roles.add(rol);
        return interaction.reply({ content: '✅ Te has verificado correctamente. ¡Bienvenido a ShowMC!', ephemeral: true });
    }

    // --- MANEJO DE TICKETS ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'menu_showmc') {
        const opcion = interaction.values[0];
        const modal = new ModalBuilder().setCustomId(`modal_${opcion}`).setTitle(`Ticket: ${opcion.replace('_', ' ').toUpperCase()}`);
        const input = new TextInputBuilder().setCustomId('razon').setLabel('Describe tu situación/pruebas:').setStyle(TextInputStyle.Paragraph).setRequired(true).setPlaceholder('Escribe aquí...');
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
            .setTitle(`✨ TICKET: ${tipo.toUpperCase()}`)
            .setDescription(`Hola ${interaction.user}, bienvenido al soporte de **ShowMC**.\nUn miembro del equipo te atenderá pronto.\n\n**Información proporcionada:**\n\`\`\`${razon}\`\`\``)
            .setColor(0x00fbff)
            .setFooter({ text: 'ShowMC Network' });

        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('tomar_ticket').setLabel('Tomar Ticket').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️'),
            new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await canal.send({ content: `${interaction.user} | <@&${ROL_PERMITIDO_1}> <@&${ROL_PERMITIDO_2}>`, embeds: [embedTicket], components: [btns] });
        return interaction.reply({ content: `✅ Tu ticket ha sido creado: ${canal}`, ephemeral: true });
    }

    if (interaction.customId === 'tomar_ticket') {
        if (!esStaff) return interaction.reply({ content: '❌ Solo el Staff puede tomar tickets.', ephemeral: true });
        await interaction.channel.send({ content: `✅ El Staff **${interaction.user}** se encargará de este ticket.` });
        const rowMod = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('tomar_ticket').setLabel('En proceso...').setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId('cerrar_ticket').setLabel('Cerrar Ticket').setStyle(ButtonStyle.Danger)
        );
        return interaction.update({ components: [rowMod] });
    }

    if (interaction.customId === 'cerrar_ticket') {
        if (!esStaff) return interaction.reply({ content: '❌ Solo el Staff puede cerrar tickets.', ephemeral: true });
        
        await interaction.reply('Generando logs y cerrando...');
        const mensajes = await interaction.channel.messages.fetch({ limit: 100 });
        let logText = `LOG TICKET SHOWMC - ${interaction.channel.name}\n\n`;
        mensajes.reverse().forEach(m => { logText += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`; });

        const attachment = new AttachmentBuilder(Buffer.from(logText, 'utf-8'), { name: `ticket-${interaction.channel.name}.txt` });
        const logChannel = client.channels.cache.get(CANAL_LOGS); 
        
        if (logChannel) {
            await logChannel.send({ 
                content: `🔒 **Ticket Cerrado:** \`${interaction.channel.name}\` | Cerrado por: ${interaction.user}`, 
                files: [attachment] 
            });
        }

        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(TOKEN);
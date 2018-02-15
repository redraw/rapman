require('./utils/Array.prototype.random')

const fs = require('fs')

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')

const Datamuse = require('./datamuse')

// egrep "\w{3,}" /usr/share/dict/american-english | egrep -v "'s$" > dict.txt
const dictWords = fs.readFileSync('dict.txt').toString().split('\n')

const bot = new Telegraf(process.env.BOT_TOKEN)

const tracks = [ // Icy
    'https://www.youtube.com/watch?v=SRf9BZoYndY',
    'https://www.youtube.com/watch?v=feaXAZqTink',
    'https://www.youtube.com/watch?v=E978VrYWbpU',
    'https://www.youtube.com/watch?v=3h3wFfQqh6g'
]

bot.use(session())

bot.start(ctx => {
    ctx.replyWithMarkdown(
        `I can only help you with single words, ` +
        `using the great [Datamuse API](https://www.datamuse.com/api/)\n` +
        `*NEW!* - Now you can /rap`
    )
})

bot.hears(/(meaning|sound|spelling|adjectives|nouns|rhymes)/i, ctx => {
    const type = ctx.match[1].toLowerCase()
    ctx.replyWithChatAction('typing')

    Datamuse.words(ctx.session.word, type, {max: 40})
        .then(res => {
            const words = res.map(i => i.word).join(' ~ ')
            ctx.replyWithMarkdown(`*${ctx.session.word}* ${type}\n${words}`)
        })
        .catch(err => ctx.reply(err))
})

bot.command('rap', ctx => {
    clearInterval(ctx.session.rapId)

    const rap = (() => {
        const word = dictWords.random();
        ctx.replyWithChatAction('typing')

        Datamuse.words(word, 'rhymes')
            .then(res => {
                const words = res.map(i => i.word).join(' ~ ')
                ctx.replyWithMarkdown(`*${word.toUpperCase()}*\n` + words)
            })
            .catch(err => ctx.reply(err))
    })

    ctx.session.rapId = setInterval(rap, 15000);

    ctx.reply(tracks.random(), Extra.markup(
        Markup.keyboard(['/finish']).resize()
    ))

    rap();
})

bot.command('finish', ctx => {
    clearInterval(ctx.session.rapId)
    ctx.reply('🤙', Extra.markup(Markup.removeKeyboard()))
})

bot.on('text', (ctx) => {
    console.log(`[telegram] ${ctx.message.from.first_name}: ${ctx.message.text}`)
    const word = ctx.message.text.split(" ").splice(-1)[0]
    ctx.session.word = word
    ctx.reply(word, Extra.markup(
        Markup.keyboard([
            'Similar meaning',
            'Similar sound',
            'Similar spelling',
            'Adjectives',
            'Nouns',
            'Rhymes',
            '/rap'
        ], {columns: 2})
    ))
})

bot.catch(err => {
    console.log('Ooops', err)
})

function start(i) {
    var i = i || 1
    try {
        bot.startPolling()
        i = 1;
    } catch (e) {
        console.log(e)
        setTimeout(() => start(i), 1000*i)
        i++;
    }
}

start()

// Zeit's Now hack
const {createServer} = require('http')
const server = createServer(() => {})
server.listen(3000)
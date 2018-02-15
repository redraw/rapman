const fetch = require('node-fetch')
const querystring = require('querystring')

module.exports = {
    words(word, type, opts) {
        return new Promise((resolve, reject) => {
            if (!word || !type) {
                reject('Missing word/type!')
            }

            let params = {
                'meaning': {ml: word},
                'sound': {sl: word},
                'spelling': {sp: word},
                'adjectives': {rel_jjb: word},
                'nouns': {rel_jja: word},
                'rhymes': {rel_rhy: word}
            }[type]
    
            // TODO: lc, rc, v
    
            const payload = Object.assign({
                max: 15
            }, params, {})

            const request = this.request(payload)
            resolve(request)
        })
    },
    request(obj) {
        const params = querystring.stringify(obj)
        return fetch(`https://api.datamuse.com/words?${params}`)
            .then(r => r.json())
    }
}
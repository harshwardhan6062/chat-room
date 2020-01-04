const generateMessage = (text, username) => {
    const msg = {
        username: username,
        text: text,
        createdAt: new Date().getTime()
    }
    return msg
}

module.exports = {
    generateMessage
}
const users = []

//add users
const addUser = ({id, username, room}) => {

    username = username.trim().toUpperCase()
    room = room.trim().toUpperCase()

    if(!username || !room)
    return {
        error: 'Username and Room should be provided!'
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(existingUser)
    return {
        error: 'A user with same username already exists in the same room!'
    }

    const user = { id, username, room }
    users.push(user)

    return { user }
}

//remove users
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index != -1)
    {
        return users.splice(index, 1)[0]
    }
}

//getUsers
const getUser = (id) => {
    const userFound = users.find((user) => {
        return id === user.id
    })

    return userFound
}

//getRoomUsers
const getRoomUsers = (room) => {
    return users.filter((user) => {
        return room === user.room
    })
}

module.exports = {
    getRoomUsers,
    getUser,
    addUser,
    removeUser
}
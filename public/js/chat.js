const socket = io()

const {username, chatRoom} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})
socket.emit('join' , {username, chatRoom} , (error) => {
    if(error)
    {
        alert(error)
        location.href = "/"
    }
})

const $form = document.querySelector('#messageForm')
const $messageInput = $form.querySelector('input')
const $sendMessageButton = $form.querySelector('button')
const $shareLocationButton = document.querySelector('#share-location')
const $messageLocation = document.querySelector('#message-location')
const $messageTempelate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#share-location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const autoscroll = () => {
    //new message element
    const $newMessage = $messageLocation.lastElementChild

    //height of the new message
    const $newMessageStyles = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt($newMessageStyles.marginBottom)
    const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin

    //visible height
    const $visibleHeight = $messageLocation.offsetHeight

    //height of message container
    const $containerHeight = $messageLocation.scrollHeight

    //how far have i scrolled
    const $scrollOffSet = $messageLocation.scrollTop + $visibleHeight

    if($containerHeight - $newMessageHeight <= $scrollOffSet)
    $messageLocation.scrollTop = $messageLocation.scrollHeight
}

socket.on('shareLocationMessage' , (locationURL) => {
    console.log(locationURL)
    const contentHTML = Mustache.render($locationTemplate,{
        username: locationURL.username,
        url: locationURL.text,
        createdAt: moment(locationURL.createdAt).format('h:mm a')
    })
    $messageLocation.insertAdjacentHTML('beforeend',contentHTML)

    autoscroll()
})

socket.on('renderUsersList', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room: room,
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('message' , (message) => {
    console.log('Message: ',message)
    const html = Mustache.render($messageTempelate , {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messageLocation.insertAdjacentHTML('beforeend' , html)

    autoscroll()
})

document.querySelector('#share-location').addEventListener('click' , () => {
    if(!navigator.geolocation)
    return console.log('Your system or browser does not support navigation!')

    //disabling the share location button
    $shareLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        latlong = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('shareLocation' , latlong , (status) => {
            
            //enabling the share location button
            $shareLocationButton.removeAttribute('disabled')

            console.log(status)
        })
    })
})

document.querySelector('#messageForm').addEventListener('submit' , (e) => {
    e.preventDefault()

    //disabling the send button
    $sendMessageButton.setAttribute('disabled','disabled')

    const message = document.querySelector('input').value

    socket.emit('sendMessage' , message , (error) => {
        //enabling the send button
        if(error)
        alert(error)
        
        $sendMessageButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
    })
})
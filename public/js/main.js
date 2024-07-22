const rootUrl = 'http://localhost:8000/';

const usernameKey = 'username';
const visibleNameKey = 'visibleName';

function getUser() {
    return {
        userName: localStorage.getItem(usernameKey),
        visibleName: localStorage.getItem(visibleNameKey),
    }
}

function setUser({userName, visibleName}) {
    localStorage.setItem(usernameKey, userName.toLowerCase())
    localStorage.setItem(visibleNameKey, visibleName)
}

function goToChatView() {
    window.location = '/'
}
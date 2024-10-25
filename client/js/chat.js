//nous selectionnons le paragraphe qui affiche le nombre de msg non lus dans le header
const UnreadMsg = document.getElementById("unread-msg")

//le containeur des conversations
const conversationContainer = document.getElementById("msg-container")

//le champ de saisie d'un message
const msgTextArea = document.getElementById("message")

//le champ de saisie du mot de recherche d'utilisateur
const searchUserField = document.getElementById("find-user-input")

//le containeur des messages reçu des utilisateurs
const userMsgList = document.getElementById("conversations-list")

//le bouton d'envoi du message
const sendMsg = document.getElementById("btn-send")

//bouton qui nous aider à retourner vers la liste des messages
const backToMsgBtn = document.getElementById("back-msg-list")

//liste de tous les cards des messages reçu
const msgCardsList = document.getElementsByClassName("msg-card")

//le b qui affiche le nom de la converstion selectionné
const selectedConversationName = document.getElementById("selectedConversationName")

//ecouteur d'evenement sur le bouton de retour sur la liste des conversations
backToMsgBtn.addEventListener("click", showMsgListContainer)

//la fonction qui affiche le containeur des conversations
function showConversationContainer() {
  //enlever la classe css qui rend invisible
  conversationContainer.classList.remove("invisible")
}

//la fonction qui cache le conteneur des conversations
function hideConversationContainer() {
  //ajouter la classe css qui rend invisible
  conversationContainer.classList.add("invisible")
}

//la fonction qui affiche le containeur des conversations reçu
function showMsgListContainer() {
  //enlever la classe css qui rend invisible
  userMsgList.classList.remove("invisible")
  hideConversationContainer()
}

//la fonction qui cache le conteneur des conversations reçu
function hideMsgListContainer() {
  //ajouter la classe css qui rend invisible
  if (window.innerWidth <= 825) {
    userMsgList.classList.add("invisible")
    showConversationContainer()
  }
}

//fonction pour ajouter l'écouter d'événement de click sur tous les éléments d'un tableau
function addClickEventListener(tab, action) {
  for (const element of tab) {
    element.addEventListener("click", action)
  }
}

//fonction gérer l'affichage des conversations par rapport à la taille d'écran
function manageConversationContainer() {
  if (window.innerWidth >= 825) {
    showConversationContainer()
  } else {
    hideConversationContainer()
  }
}

manageConversationContainer()

//ajoutons l'écouteur d'événement de clique sur les conversations-card
addClickEventListener(msgCardsList, function(e){ 
    
    //reinitialisons tout les conversations cards
    for (const element of msgCardsList) {
        element.classList.remove("bg-selected")
    }

    //recupérons la conversation-card cliqué
    const clickedConversation = e.currentTarget

    //affichons le nom de la conversation
    selectedConversationName.textContent="Iswa josué"

    //changeons maintenant son arriere plan pour lui donner l'apparence de la conversation selectionné
    clickedConversation.classList.add("bg-selected")

    hideMsgListContainer()
})

//écouter d'événement sur le changement de la taille d'écran
window.addEventListener("resize", manageConversationContainer)

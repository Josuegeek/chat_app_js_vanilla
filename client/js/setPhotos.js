//importons d'abord nos fonctions utililes qui se trouvent dans auth.js
import {storeUser, getUser, getConnectedUser, uploadImages, SERVER_URL} from "./auth.js"

//récuperer l'user connecté
let user = JSON.parse(getConnectedUser().slice(1, -1))

//les composants textes
const username = document.getElementById("username")
const email = document.getElementById("email")
const bio = document.getElementById("bio")

//preview de la photo de couverture
const couverturePreview = document.getElementById("couverture-preview")

//preview du  profil
const profilePreview = document.getElementById("profile-preview")

//les inputs des images
const profileInput = document.getElementById("profile")
const couvertureInput = document.getElementById("couverture")

//le bouton de soumission
const btnNext = document.getElementById("btn-next")

//le formulaire des images
const imagesForm = document.getElementById("images-form")

//interceptons le changement de l'input du profile(càd si sa valeur ou le fichier selectionné a changé)
profileInput.addEventListener("change", function(e){
    
    //recuperons l'image séléctioné dans le profile
    const file = profileInput.files[0]

    //si le fichier n'est pas null
    if (file) {
        //le lecteur de fichier
        const reader = new FileReader()

        //le programme à executer si le lecteur charge le fichier
        reader.onload = (e) => {
            //e represente l'événement onload et ça contient les valeurs nécessaires pour lire les résultat de la lecture
            profilePreview.src = e.target.result
        }

        //chargeons le fichier dans le lecteur
        reader.readAsDataURL(file)
    } else {
        profilePreview.src = ""
    }
})

//faisons la même chose pour l'input de couverture avec son preview
couvertureInput.addEventListener("change", function(e){
    
    //recuperons l'image séléctioné dans le profile
    const file = couvertureInput.files[0]

    //si le fichier n'est pas null
    if (file) {
        //le lecteur de fichier
        const reader = new FileReader()

        //le programme à executer si le lecteur charge le fichier
        reader.onload = (e) => {
            //e represente l'événement onload et ça contient les valeurs nécessaires pour lire les résultat de la lecture
            //console.log(`url(${e.target.readAsDataURL(e.target.result)})`)
            
            couverturePreview.src= e.target.result
        }

        //chargeons le fichier dans le lecteur
        reader.readAsDataURL(file)
    } else {
        couverturePreview.src = "../imgs/back2.jpg)"
    }
})

//variable pour empecher le formulaire d'être soumis pendant un traitement..
let isSubmitted=false

//soummission des images
imagesForm.addEventListener("submit", function(e){

    //annulons le comportement par defaut du formulaire
    e.preventDefault()

    //refouler l'execution si le formulaire est en cours de traitement
    if(isSubmitted){
        return
    }

    //signaler la soumission du formulaire et desactivons le bouton de soumission
    isSubmitted=true
    btnNext.disabled=true

    //la photo de profil et de couverture séléctionnées
    const profilePhoto = profileInput.files[0]
    const coverPhoto = couvertureInput.files[0]

    //vérifions si l'user a bien séléctionné les photos
    if(profilePhoto || coverPhoto){
        console.log(profilePhoto, coverPhoto)
        const formData = new FormData()
        if (profilePhoto) {
            formData.append("profile", profilePhoto)
        }
        if (coverPhoto) {
            formData.append("cover", coverPhoto)
        }

        // Récupérer l'utilisateur connecté
        const user = JSON.parse(getConnectedUser().slice(1, -1))
        formData.append("userid", user.userid)
        formData.append("name", user.name)
        formData.append("firstname", user.firstname)
        formData.append("bio", user.bio)
        formData.append("email", user.email)
        formData.append("action", "update")

        // Envoyer la requête
        uploadImages(formData).then(success => {
            if (success) {
                alert('Les photos sont uploadées')
                window.location.href = "index.html"
            } else {
                alert("Quelque chose s'est mal passé")
            }
            btnNext.textContent = "Aller à l'accueil"
            isSubmitted = false
            btnNext.disabled = false
        }).catch(error => {
            btnNext.textContent = "Aller à l'accueil"
            isSubmitted = false
            btnNext.disabled = false
            console.error('Une erreur est survenue lors de l\'upload des images :', error)
            alert(error)
        })
    } else {
        window.location.href = "index.html"
    }
})

updateInfos()

//fonction pour mettre à jour les infos
function updateInfos(){
    getUser(user.userid).then(success=>{
        storeUser(success.user)
        user = JSON.parse(getConnectedUser().slice(1, -1))
    })
    username.textContent=user.username+" " + user.firstname
    email.textContent=user.email
    bio.textContent=user.bio
    profilePreview.src=SERVER_URL+user.profile
    couverturePreview.src=SERVER_URL+user.cover
}
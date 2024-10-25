//importons d'abord nos fonctions utililes qui se trouvent dans auth.js
import {disconnect, isConnected, registerUser} from "./auth.js"

//disconnect()

//retourner l'utilisateur dans la page d'accueil s'il est déjà connecté mais qu'il tente d'ouvrir register
if(isConnected()){
    window.location.href="index.html"
}

//les champs de saisie
const nameInput = document.getElementById('name')
const firstnameInput = document.getElementById('firstname')
const bioInput =  document.getElementById('bio')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const confirmPasswordInput = document.getElementById('confirm-password')

//le bouton de soumission
const btnSubmit = document.getElementById('btn-submit')

//le formulaire
const registerForm =  document.getElementById('register-form')

//variable pour empecher le formulaire d'être soumis pendant un traitement..
let isSubmitted=false

//interceptons la soumission du formulaire
registerForm.addEventListener('submit', function(e){

    //annulons le comportement par defaut du formulaire
    e.preventDefault()

    //refouler l'execution si le formulaire est en cours de traitement
    if(isSubmitted){
        return
    }
    
    //signaler la soumission du formulaire et desactivons le bouton de soumission
    isSubmitted=true
    btnSubmit.disabled=true

    btnSubmit.textContent="patientez.."

    //vérifions que les mots de passes sont les mêmes
    if(passwordInput.value===confirmPasswordInput.value){
        const name=nameInput.value,firstname=firstnameInput.value,bio=bioInput.value,email=emailInput.value,password=passwordInput.value;
        
        //envoyons la requête de création d'utilisateur
        registerUser(name, firstname, bio, email, password).then(success =>{
            if(success){
                alert('Compte crée avec succès')
                window.location.href="setPhotos.html"
            }
            else{
                alert("Quelque chose s'est mal passé")
            }
            btnSubmit.textContent="Créer votre compte"
            isSubmitted = false
            btnSubmit.disabled=false
        }).catch(error =>{
            btnSubmit.textContent="Créer votre compte"
            isSubmitted = false
            btnSubmit.disabled=false
            alert(error)
        })
    }
    //sinon
    else{
        alert("les mots de passe doivent être les mêmes")
        btnSubmit.textContent="Créer votre compte"
        isSubmitted = false
        btnSubmit.disabled=false
    }
})
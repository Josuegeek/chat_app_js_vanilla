//l'adresse du serveur
export const SERVER_URL ="http://iswa-chat-server.com/"

//l'adresse de notre api serveur
const API_URL = SERVER_URL+"api.php"

//disconnect()

//fonction pour vérifier si l'utilisateur est connecté
export function isConnected() {
    return getConnectedUser() !== null
}

//fonction pour lire les information d'utilisateur connecté
export function getConnectedUser() {
    return localStorage.getItem("user")
}

//fonction pour lire l'utilisateur
export async function getUser(userIdOrEmail){
    
        //envoyons une requete vers le serveur en attendant sa reponse
        const response = await fetch(API_URL+`?userid=${userIdOrEmail}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            }
        })

        //nous recupérons la réponse du serveur dans notre cpnstante data
        const data = await response.json()

        //si nous recevons le message de succèss, on enregistre l'utilisateur que le serveur nous a renvoyé
        if (data.status === "success") {
            return data
        } else {
            alert(data.message)
            return null
        }
}

//fonction pour connecter l'utilisateur
export async function loginUser(email, password) {
    //envoyons une requete vers le serveur en attendant sa reponse
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    })

    //nous recupérons la réponse du serveur dans notre cpnstante data
    const data = await response.json()

    //si nous recevons le message de succèss, on enregistre l'utilisateur que le serveur nous a renvoyé
    if (data.status === "success") {
        storeUser(data.user)
        alert("Connexion réussie !")
        return true
    } else {
        alert(data.message)
        return false
    }
}

//fonction pour enregistrer un nouveau utilisateur
export async function registerUser(name, firstname, bio, email, password) {
    
        //envoyons une requete vers le serveur en attendant sa reponse
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `action=register&name=${encodeURIComponent(name)}&firstname=${encodeURIComponent(firstname)}&bio=${encodeURIComponent(bio)}
                                &email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        })

        //nous recupérons la réponse du serveur dans notre cpnstante data
        const data = await response.json()

        //si nous recevons le message de succèss, on enregistre l'utilisateur que le serveur nous a renvoyé
        if (data.status === "success") {
            getUser(email).then(success=>{
                storeUser(success.user)
            })
            return true
        } else {
            alert(data.message)
            return false
        }

}

//fonction pour uploder les images(profile et couverture)
export async function uploadImages(formData) {
    if (!isConnected()) {
        return false;
    }

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (data.status === "success") {
        console.log(data);
        return true;
    } else {
        console.log(data);
        alert(data.message);
        return false;
    }
}

// Fonction pour stocker l'utilisateur dans le stockage local
export function storeUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

// Fonction pour supprimer l'utilisateur
export function disconnect() {
    localStorage.removeItem("user")
    return true
}
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permet toutes les origines, ajustez selon vos besoins.
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // Méthodes autorisées.
header('Access-Control-Allow-Headers: Content-Type'); // En-têtes autorisés.

// Configuration de la connexion à la base de données
$host = 'localhost'; // Host de la base de données
$db   = 'chat_app';  // Nom de la base de données
$user = 'root';      // Utilisateur de la base de données
$pass = '';          // Mot de passe de la base de données

// Connexion à la base de données
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur de connexion à la base de données.']);
    exit;
}

// Fonction pour renvoyer la liste des utilisateurs
function getUsers($userid = null) {
    global $pdo;
    if ($userid) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE userid = ? OR email = ?");
        $stmt->execute([$userid, $userid]);
    } else {
        $stmt = $pdo->query("SELECT * FROM users");
    }
    return $stmt->fetchAll();
}

// Fonction pour renvoyer les messages d'un utilisateur
function getMessages($userid) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE ownerid = ? OR receiverid = ?");
    $stmt->execute([$userid, $userid]);
    return $stmt->fetchAll();
}

// Fonction pour gérer la connexion des utilisateurs
function loginUser($email, $password) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $updateStmt = $pdo->prepare("UPDATE users SET isOnline = 1 WHERE userid = ?");
        $updateStmt->execute([$user['userid']]);
        return $user;
    }
    return null;
}

// Fonction pour gérer l'inscription des utilisateurs avec upload d'image de profil
function registerUser($name, $firstname, $email, $password, $profileImage = null, $coverImage=null, $bio) {
    global $pdo;

    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        return ['status' => 'error', 'message' => 'L\'email est déjà utilisé.'];
    }

    // Hacher le mot de passe
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Préparer le chemin de l'image de profil et de couverture
    $profileImagePath = "";
    $coverImagePath = "";
    
    //si la photo de profile a été soumis
    if($profileImage){
        $profileImagePath = uploadImage($profileImage, "profile");
        if ($profileImagePath!=null) {
            return ['status' => 'error', 'message' => 'Erreur lors de l\'upload de l\'image.'];
        }
    }
    
    //si la photo de couverture a été soumis
    if($coverImage){
        $coverImagePath = uploadImage($coverImage, "cover");
        if ($coverImagePath!=null) {
            return ['status' => 'error', 'message' => 'Erreur lors de l\'upload de l\'image.'];
        }
    }
    

    // Insérer l'utilisateur dans la base de données
    $stmt = $pdo->prepare("INSERT INTO users (username, firstname, email, password, profile, cover, bio, isOnline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $firstname, $email, $hashedPassword, $profileImagePath, $coverImagePath, $bio, 1])) {
        return ['status' => 'success', 
                'message' => 'Inscription réussie', 
                'user' =>(object)['username'=>$name, 
                            'firstname'=>$firstname, 
                            'email'=>$email, 
                            'profile'=>$profileImage, 
                            'cover'=>$coverImage, 
                            'bio'=>$bio]];
    }
    return ['status' => 'error', 'message' => 'Erreur lors de l\'inscription.'];
}

// Fonction pour mettre à jour les informations de l'utilisateur
function updateUser($userid, $name, $firstname, $email, $profileImage, $coverImage, $bio) {
    global $pdo;

    // Préparer la requête de mise à jour
    $query = "UPDATE users SET username = ?, firstname = ?, email = ?, bio = ?";
    $params = [$name, $firstname, $email, $bio];
 
    $profileImagePath="";
    $coverImagePath="";

    // Ajouter le champ pour l'image de profil si spécifié
    if ($profileImage) {
        $profileImagePath =uploadImage($profileImage, "profile");
        
        if($profileImagePath!=null){
            $query .= ", profile = ?";
            $params[] = $profileImagePath;
        }
        else{
            return ['status' => 'error', 'message' => 'Erreur lors de upload d image profile'];
        } 
            
    }
    else{
        return ['status' => 'error', 'message' => 'Erreur lors de upload d image profile','imgProfile'=>$profileImage, 'imgCover'=>$coverImage];
    }
    if($coverImage){
        $coverImagePath=uploadImage($coverImage, "cover");
        
        if($coverImagePath!=null){
            $query .= ", cover = ?";
            $params[] = $coverImagePath;
        }
        else{
            return ['status' => 'error', 'message' => 'Erreur lors de upload d image cover'];
        }   
    }
    else{
        return ['status' => 'error', 'message' => 'Erreur lors de upload d image cover','imgProfile'=>$profileImage, 'imgCover'=>$coverImage];
    }

    $query .= " WHERE userid = ?";
    $params[] = $userid;

    // Exécuter la requête
    $stmt = $pdo->prepare($query);
    if ($stmt->execute($params)) {
        return ['status' => 'success', 'message' => 'Mise à jour réussie.', 'params'=>$params, 
                'imgProfile'=>$profileImage, 'imgCover'=>$coverImage];
    }
    return ['status' => 'error', 'message' => 'Erreur lors de la mise à jour.'];
}

// Fonction pour gérer la déconnexion
function logoutUser($userid) {
    global $pdo;
    // Mettre à jour isOnline à false
    $updateStmt = $pdo->prepare("UPDATE users SET isOnline = 0 WHERE userid = ?");
    $updateStmt->execute([$userid]);
    return ['status' => 'success', 'message' => 'Déconnexion réussie'];
}

// fonction pour uploder la photo de profil ou de couverture
function uploadImage($image, $type){
    $targetDir = "medias/profile/";
    
    //vérifier si c'est la photo de couverture
    if($type=="cover"){
        $targetDir = "medias/cover/";
    }

    $targetFile = $targetDir . basename($image["name"]);

    // Vérifier le type de fichier
    $check = getimagesize($image["tmp_name"]);
    if ($check === false) {
        return null;
    }

    // Déplacer le fichier uploadé
    if (move_uploaded_file($image["tmp_name"], $targetFile)) {
       return $targetFile; // Enregistrer le chemin de l'image
    } else {
        return null;
    }
}

// Vérifier le type de requête
$requestMethod = $_SERVER['REQUEST_METHOD'];

if ($requestMethod === 'GET') {
    if (isset($_GET['userid'])) {
        echo json_encode(['status' => 'success', 'user' => getUsers($_GET['userid'])]);
    } elseif (isset($_GET['messages']) && isset($_GET['userid'])) {
        echo json_encode(['status' => 'success', 'user' => getMessages($_GET['userid'])]);
    } else {
        echo json_encode(['status' => 'success', 'data' => getUsers()]);
    }
    exit;
}

if ($requestMethod === 'POST') {
    try{

        // Gérer la connexion
        if (isset($_POST['action']) && $_POST['action'] === 'login') {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $user = loginUser($email, $password);
            
            if ($user) {
                echo json_encode(['status' => 'success', 'user' => $user]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Identifiants invalides.']);
            }
            exit;
        }

        // Gérer l'inscription
        if (isset($_POST['action']) && $_POST['action'] === 'register') {
            $name = $_POST['name'] ?? '';
            $firstname = $_POST['firstname'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $bio = $_POST['bio'] ?? '';

            $profileImage = $_FILES['profile'] ?? null;
            $coverImage = $_FILES['cover'] ?? null;

            $response = registerUser($name, $firstname, $email, $password, $profileImage, $coverImage, $bio);
            echo json_encode($response);
            exit;
        }

        // Gérer la mise à jour de l'utilisateur
        if (isset($_POST['action']) && $_POST['action'] === 'update') {
            $userid = $_POST['userid'] ?? null;
            $name = $_POST['name'] ?? '';
            $firstname = $_POST['firstname'] ?? '';
            $email = $_POST['email'] ?? '';
            $bio = $_POST['bio'] ?? '';
            
            // Gestion de l'upload d'image
            $profileImage = $_FILES['profile'];
            $coverImage = $_FILES['cover'];

            $response = updateUser($userid, $name, $firstname, $email, $profileImage, $coverImage, $bio);
            echo json_encode($response);
            exit;
        }

        // Gérer la déconnexion
        if (isset($_POST['action']) && $_POST['action'] === 'logout') {
            $userid = $_POST['userid'] ?? null; // Récupérer l'ID de l'utilisateur
            echo json_encode(logoutUser($userid));
            exit;
        }

    }
    catch(Exception $exception){
        echo json_encode(['status' => 'error', 'message' => 'Error '.$exception->getMessage()]);
    }
}

// Répondre avec une méthode non autorisée
http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
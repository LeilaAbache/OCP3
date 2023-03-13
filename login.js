// ---------------------------------------------------------------//
// Appel fetch pour récupérer le userId et token d'authentification

const urlBase = "http://localhost:5678/api";
const urlLogin = urlBase + "/users/login";

// Pointe classe html .form et ajoute événement sur le submit
document
  .querySelector(".form")
  .addEventListener("submit", async function (event) {
    try {
      // Annule le comportement par défaut du navigateur (chargement d'une nouvelle page à la validation du formulaire)
      event.preventDefault();

      // Récupère les données eventuellement stockées dans le localStorage
      let dataResponse = window.localStorage.getItem("dataResponse");

      let messageErreurLogin = document.querySelector(".erreur-login");

      // Si aucune donnée sauvegardée dans le localStorage
      if (dataResponse === null) {
        // Envoie les données de connexion et demande à récupérer une reponse via fetch
        const response = await fetch(urlLogin, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("mot-de-passe").value,
          }),
        });
        dataResponse = await response.json();

        // Condition pour rediriger l'utilisateur sur la page home en cas de connexion
        if ("token" in dataResponse) {
          document.location.href = "index.html";

          // Convertis dataResponse en JSON avant de les enregistrer dans localStorage
          const valeurData = JSON.stringify(dataResponse);
          // Stockage des informations dans le localStorage
          window.localStorage.setItem("dataResponse", valeurData);
        } else {
          // Si erreur connexion, renvoie un msg d'erreur
          messageErreurLogin.style.visibility = "visible";
        }
      } else {
        //Si données déjà sauvegardées, les reconstruis en mémoire, afin de rester connecté tant que pas délogué
        dataResponse = JSON.parse(dataResponse);
      }
    } catch (error) {
      console.error(error);
    }
  });

// Récupère les data et les parse
let dataResponse = window.localStorage.getItem("dataResponse");
dataResponse = JSON.parse(dataResponse);
// pour rediriger automatiquement vers la page index si logged
if (dataResponse !== null && "token" in dataResponse) {
  document.location.href = "index.html";
}

// je fais un appel fetch à l'api pour récupérer les travaux et que je stocke dans une variable
// pour la réutiliser autant que necessaire sur index et eventuellement d'autres pages

const urlBase = "http://localhost:5678/api";

let jsonWorks = null;
export const getWorks = async function () {
  if (null === jsonWorks) {
    jsonWorks = await (await fetch(`${urlBase}/works`)).json();
  }
  return jsonWorks;
};

import { leer } from "./storage.js";

const examenes = leer("examenes");
console.log(examenes);
console.log(examenes[0].titulo);
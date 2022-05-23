import { createSnapshot } from "./src/droplet/create-snapshot.js";
import { copySnapshot } from "./src/droplet/copy-snapshot.js";
import {removeSnapshot} from "./src/remove-snapshot.js";
import {createVolumeSnapshot} from "./src/volume/create-snapshot.js";

console.log("*****************************************");
console.log("**      CREATE DROPLET SNAPSHOT        **");
console.log("*****************************************");
await createSnapshot();
console.log("*****************************************");
console.log("**       COPY DROPLET SNAPSHOT         **");
console.log("*****************************************");
await copySnapshot();
console.log("*****************************************");
console.log("**      CREATE VOLUME SNAPSHOT        **");
console.log("*****************************************");
await createVolumeSnapshot();
console.log("*********************************");
console.log("**     REMOVE OLD SNAPSHOT     **");
console.log("*********************************");
await removeSnapshot();
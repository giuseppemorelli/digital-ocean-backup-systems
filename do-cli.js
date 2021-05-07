import { createSnapshot } from "./src/create-snapshot.js";
import { copySnapshot } from "./src/copy-snapshot.js";
import { removeSnapshot } from "./src/remove-snapshot.js";

console.log("*********************************");
console.log("**      CREATE SNAPSHOT        **");
console.log("*********************************");
await createSnapshot();
console.log("*********************************");
console.log("**       COPY SNAPSHOT         **");
console.log("*********************************");
await copySnapshot();
console.log("*********************************");
console.log("**     REMOVE OLD SNAPSHOT     **");
console.log("*********************************");
await removeSnapshot();
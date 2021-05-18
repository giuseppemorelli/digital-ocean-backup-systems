import dotenv from 'dotenv'
import docli from 'digitalocean'

dotenv.config();
const apiKey = process.env.API_TOKEN || null;

if(apiKey !== null) {
    let client = docli.client(apiKey);
}
else {
    console.log("*********************************");
    console.log("  Missing Digital Ocean API KEY  ");
    console.log("*********************************");
    process.exit(0);
}

export default client
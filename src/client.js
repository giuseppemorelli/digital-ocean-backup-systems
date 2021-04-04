import dotenv from 'dotenv'
import docli from 'digitalocean'

dotenv.config();
let client = docli.client(process.env.API_TOKEN);

export default client
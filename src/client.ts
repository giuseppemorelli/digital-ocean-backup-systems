import { config } from 'dotenv';
import { createApiClient } from 'dots-wrapper';

// Load env variable from file
const env = config();
const apiKey = process.env.API_TOKEN || '';

if (apiKey === '') {
    console.log("*********************************");
    console.log("  Missing Digital Ocean API KEY  ");
    console.log("*********************************");
    process.exit(0);
}

const dots = createApiClient({token: apiKey});

export default dots
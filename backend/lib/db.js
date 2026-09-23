import mongoose from "mongoose";
import dotenv from "dotenv";
import * as dns from "node:dns";

import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file before using them
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

export const connectDB = async () => {
    try {
       await mongoose.connect(process.env.MONGO_URI);
       console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);

        // If DNS SRV lookup was refused, try using a public DNS server and retry once.
        const isSrvLookupError = error && (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('querySrv')));
        if (isSrvLookupError) {
            try {
                console.warn('SRV lookup failed; setting DNS to 8.8.8.8 and retrying...');
                dns.setServers(['8.8.8.8']);
                await mongoose.connect(process.env.MONGO_URI);
                console.log('MongoDB connected successfully after DNS fallback!');
                return;
            } catch (err2) {
                console.error('Retry after DNS fallback failed:', err2);
            }
        }

        process.exit(1);//exit with failure
    }
}


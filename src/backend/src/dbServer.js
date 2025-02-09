import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { supabase } from './supaBaseClient.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// -----------------------------------------
// Endpoint to upload images & store metadata
// -----------------------------------------
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log("Request received:", req.body, req.file); // Log the request body and file
    if (!req.file)
        return res.status(400).json({
            error: 'No file provided' 
        });

    console.log("File uploaded:", req.file.originalname); // Log the file name
    const safeOriginalName = req.file.originalname
  .replace(/\s+/g, '_')         // Replace spaces with underscores
  .replace(/[^\w.-]/g, '');      // Remove any character that is not alphanumeric, underscore, dot, or hyphen

const fileName = `${Date.now()}_${safeOriginalName}`;

    // Log the metadata
    console.log("Tags:", req.body.tags);
    console.log("Place:", req.body.place);
    console.log("Time:", req.body.time);

    const formattedTags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const place = req.body.place || '';
    const time = req.body.time || '';

    // Upload to Supabase Storage
    const { data, error } = await supabase
        .storage
        .from('test')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (error) {
        console.error("Supabase Storage Error:", error); // Log Supabase storage error
        return res.status(500).json({ error: error.message });
    }

    console.log("File uploaded to Supabase Storage:", fileName);

    // Get public URL
    const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('test')
        .getPublicUrl(fileName);

    if (publicUrlError) {
        console.error("Supabase Public URL Error:", publicUrlError); // Log public URL error
        return res.status(500).json({ error: publicUrlError.message });
    }

    const publicUrl = publicUrlData.publicUrl;
    console.log("Public URL:", publicUrl);

    // Insert into Supabase Table
    const { data: insertData, error: insertError } = await supabase
        .from('ImageTags')
        .insert([{ 
            ImageUrl: publicUrl, 
            tags: formattedTags,
            place: place,
            time: time
        }]);

    if (insertError) {
        console.error("Supabase Table Insert Error:", insertError); // Log table insertion error
        return res.status(500).json({ error: insertError.message });
    }

    console.log("Data inserted into Supabase Table:", insertData);
    return res.json({ url: publicUrl });
});

app.get("/images", async (req, res) => {
    const { data, error } = await supabase
      .from("ImageTags")
      .select("*");
  
    if (error) {
      console.error("Error fetching images:", error);
      return res.status(500).json({ error: error.message });
    }
    return res.json(data);
  });

// ------------------------------
// Start Server
// ------------------------------
const PORT = 6001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


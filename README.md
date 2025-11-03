# Jet Stamp - Digital Vaccination Certificates

A simple, standalone web application that allows veterinarians to issue digital vaccination certificates (stamps) that pet owners can save and anyone can verify.

## Features

- **Vet Interface**: Simple form to generate vaccination certificates
- **Certificate Generation**: Creates unique certificate IDs with QR codes
- **Pet Owner View**: Clean, printable certificate format with PDF download
- **Verification**: Public verification page to check certificate authenticity
- **Mobile-Friendly**: Responsive design works on all devices
- **Offline Support**: Coming soon

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Libraries**:
  - `better-sqlite3` - SQLite database
  - `qrcode` - QR code generation
  - `nanoid` - Unique ID generation
  - `pdfkit` - PDF generation

## Project Structure

```
jet-stamp/
├── server.js           # Express server and API routes
├── database.js         # SQLite database setup
├── package.json        # Dependencies
├── certificates.db     # SQLite database (created on first run)
├── public/
│   ├── vet.html        # Vet interface
│   ├── vet.js          # Vet interface logic
│   ├── certificate.html # Certificate view
│   ├── certificate.js   # Certificate view logic
│   ├── verify.html      # Verification page
│   ├── verify.js        # Verification logic
│   └── styles.css       # Global styles
└── README.md
```

## Database Schema

```sql
CREATE TABLE certificates (
  id TEXT PRIMARY KEY,           -- Unique 6-character alphanumeric ID
  vet_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  clinic_name TEXT,
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL,        -- dog, cat, or other
  vaccine_type TEXT NOT NULL,
  date_administered TEXT NOT NULL,
  next_due_date TEXT,
  created_at TEXT NOT NULL,
  qr_code TEXT                   -- Base64 encoded QR code image
);
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

The application will automatically:
- Create the SQLite database on first run
- Initialize the database schema
- Start the web server on port 3000

## Usage

### For Veterinarians

1. Navigate to `http://localhost:3000/vet`
2. Fill in the vaccination certificate form:
   - Veterinarian information (name, license, clinic)
   - Pet information (name, type)
   - Vaccination details (vaccine type, dates)
3. Click "Generate Certificate"
4. Share the generated link with the pet owner

### For Pet Owners

1. Receive the certificate link from your veterinarian
2. View the certificate at `/certificate/{ID}`
3. Options available:
   - Download as PDF
   - Share link
   - Print certificate

### For Verification

1. Scan the QR code on a certificate, or
2. Visit `/verify/{ID}` directly
3. View certificate details and verification status

## API Endpoints

### POST `/api/certificates`
Create a new vaccination certificate

**Request body:**
```json
{
  "vet_name": "Dr. Jane Smith",
  "license_number": "VET123456",
  "clinic_name": "Happy Paws Clinic",
  "pet_name": "Max",
  "pet_type": "dog",
  "vaccine_type": "Rabies",
  "date_administered": "2025-11-03",
  "next_due_date": "2026-11-03"
}
```

**Response:**
```json
{
  "success": true,
  "certificateId": "ABC123",
  "certificateUrl": "http://localhost:3000/certificate/ABC123"
}
```

### GET `/api/certificates/:id`
Retrieve certificate data

**Response:**
```json
{
  "id": "ABC123",
  "vet_name": "Dr. Jane Smith",
  "license_number": "VET123456",
  "clinic_name": "Happy Paws Clinic",
  "pet_name": "Max",
  "pet_type": "dog",
  "vaccine_type": "Rabies",
  "date_administered": "2025-11-03",
  "next_due_date": "2026-11-03",
  "created_at": "2025-11-03T12:00:00.000Z",
  "qr_code": "data:image/png;base64,..."
}
```

### GET `/api/certificates/:id/pdf`
Download certificate as PDF

Returns a PDF file for download.

## Deployment

### Local Deployment

The application is ready to run locally using the setup instructions above.

### Production Deployment

#### Option 1: Traditional Server

1. **Install Node.js** on your server

2. **Clone the repository** to your server

3. **Install dependencies**
   ```bash
   npm install --production
   ```

4. **Set the PORT environment variable** (optional)
   ```bash
   export PORT=3000
   ```

5. **Start with a process manager** (e.g., PM2)
   ```bash
   npm install -g pm2
   pm2 start server.js --name jet-stamp
   pm2 save
   pm2 startup
   ```

6. **Configure reverse proxy** (e.g., Nginx)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 2: Platform as a Service (PaaS)

**Heroku:**
```bash
# Install Heroku CLI and login
heroku create your-app-name
git push heroku main
```

**Railway / Render / Fly.io:**
- Connect your Git repository
- Set start command: `npm start`
- Deploy automatically on push

#### Option 3: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t jet-stamp .
docker run -p 3000:3000 -v $(pwd)/certificates.db:/app/certificates.db jet-stamp
```

## Environment Variables

- `PORT` - Server port (default: 3000)

## Security Considerations

This is an MVP application. For production use, consider:

1. **Authentication**: Add user authentication for veterinarians
2. **Authorization**: Implement role-based access control
3. **HTTPS**: Use SSL/TLS certificates
4. **Input Validation**: Enhanced server-side validation
5. **Rate Limiting**: Prevent abuse
6. **Database Backups**: Regular automated backups
7. **Audit Logging**: Track all certificate operations

## Future Enhancements

- [ ] Offline mode support (PWA)
- [ ] User authentication
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Certificate expiration reminders
- [ ] Batch certificate generation
- [ ] Analytics dashboard
- [ ] Mobile app (iOS/Android)

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

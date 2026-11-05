# BBMS Backend

This backend provides the REST API for the Blood Bank Management System using Express.js, Firebase Authentication, and Cloud Firestore.

## Scripts

```bash
npm install
npm run dev
npm start
```

## Environment

Copy `.env.example` to `.env`. Set the Firebase project ID and point `GOOGLE_APPLICATION_CREDENTIALS` to a Firebase service-account JSON file stored outside this repository. The frontend and backend must use the same Firebase project; never commit the service-account file.

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for the source Firestore
const sourceServiceAccount = require('./crify-development-firebase-adminsdk-o9a6c-c902c52549.json');
const sourceConfig = {
    credential: admin.credential.cert(sourceServiceAccount),
    databaseURL: 'https://crify-development.firebaseio.com',
};
const sourceApp = admin.initializeApp(sourceConfig, 'sourceApp');
const sourceFirestore = sourceApp.firestore();

// Initialize Firebase Admin SDK for the destination Firestore
const destinationServiceAccount = require('./pumpkins-kindergarten-firebase-adminsdk-8bgbu-0223d55e1e.json');
const destinationConfig = {
    credential: admin.credential.cert(destinationServiceAccount),
    databaseURL: 'https://pumpkins-kindergarten.firebaseio.com',
};
const destinationApp = admin.initializeApp(destinationConfig, 'destinationApp');
const destinationFirestore = destinationApp.firestore();

async function copyData() {
    try {
        // await copyCollection('roles', 'roles');
        // await copyCollection('extra', 'extra');
        // await copyCollection('creators', 'creators');
        // await copyCollection('admins', 'admins');
        console.log('Data copy completed successfully.');
    } catch (error) {
        console.error('Error copying data:', error);
    } finally {
        // Close Firebase Admin apps
        await sourceApp.delete();
        await destinationApp.delete();
    }
}

async function copyCollection(sourcePath, destinationPath) {
    const sourceCollectionRef = sourceFirestore.collection(sourcePath);
    const destinationCollectionRef = destinationFirestore.collection(destinationPath);

    const sourceSnapshot = await sourceCollectionRef.get();

    for (const docSnapshot of sourceSnapshot.docs) {
        const documentId = docSnapshot.id;

        // Check for nested collections inside the document
        const nestedCollections = await docSnapshot.ref.listCollections();

        if (nestedCollections.length > 0) {
            // Recursively copy nested collections
            const collectionIds = nestedCollections.map(col => {
                const nestedSourcePath = `${sourcePath}/${documentId}/${col.id}`;
                const nestedDestinationPath = `${destinationPath}/${documentId}/${col.id}`;
                copyCollection(nestedSourcePath, nestedDestinationPath);
            });
        }

        // Copy the current document
        const data = docSnapshot.data();
        await destinationCollectionRef.doc(documentId).set(data);
    }
}
// Run the data copy process
copyData();
import { db, auth } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export async function fetchApiDetails() {
  try {
    // Wait for user authentication state to be resolved
    const currentUser = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        resolve(user);
        unsubscribe();
      });
    });

    if (!currentUser) {
      throw new Error('User is not logged in. Please sign in to continue.');
    }

    console.log('Fetching API details for user:', currentUser.uid);

    // Fetch API Key from Firestore
    const apiKeyRef = doc(db, 'apiKeys', 'currentKey');
    const apiKeySnap = await getDoc(apiKeyRef);

    if (!apiKeySnap.exists()) {
      throw new Error('API Key document does not exist in Firestore.');
    }

    const { key: apiKey } = apiKeySnap.data();
    if (!apiKey) {
      throw new Error('API Key is missing in Firestore document.');
    }
    console.log('API Key fetched successfully:');

    // Fetch API URL from Firestore
    const apiURLRef = doc(db, 'apiKeys', 'apiURL');
    const apiURLSnap = await getDoc(apiURLRef);

    if (!apiURLSnap.exists()) {
      throw new Error('API URL document does not exist in Firestore.');
    }

    const { url: apiURL } = apiURLSnap.data();
    if (!apiURL) {
      throw new Error('API URL is missing in Firestore document.');
    }
    console.log('API URL fetched successfully:');

    return { apiKey, apiURL };

  } catch (error) {
    console.error('Error fetching API details:', error);
    throw new Error(`Failed to fetch API details: ${error.message}`);
  }
}

export async function generateAndSendJson(formData) {
  try {
    // Defensive checks: Ensure required fields exist and have valid types
    if (!formData.title || typeof formData.title !== 'string') {
      throw new Error('Missing or invalid title in form data.');
    }

    if (!Array.isArray(formData.cloudProviders) || formData.cloudProviders.length === 0) {
      throw new Error('Missing or invalid cloudProviders in form data.');
    }

    if (!formData.relationships || typeof formData.relationships !== 'string') {
      throw new Error('Missing or invalid relationships in form data.');
    }

    if (!formData.icons || !Array.isArray(formData.icons)) {
      throw new Error('Missing or invalid icons in form data.');
    }

    if (!formData.clusteringDetails || typeof formData.clusteringDetails !== 'string') {
      throw new Error('Missing or invalid clusteringDetails in form data.');
    }

    // Fetch API details
    const { apiKey, apiURL } = await fetchApiDetails();

    // Generate the JSON payload
    const jsonData = {
      Taitoru: formData.title,
      KuraudoPurobaida: formData.cloudProviders,
      KankeiNoSetsumei: formData.relationships,
      Risousu: formData.icons,
      KurasutaNoSetsumei: formData.clusteringDetails,
    };

    console.log('Sending JSON payload:', JSON.stringify(jsonData, null, 2));

    // Send the POST request
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(jsonData),
    });

    console.log('Response Status:', response.status);

    const result = await response.text(); // Get the SVG as text
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status} - ${result}`);
    }

    console.log('SVG response received successfully.');
    console.log('API response:', result);

    return result;

  } catch (error) {
    console.error('Error generating and sending JSON:', error);
    throw new Error(`Failed to generate and send JSON: ${error.message}`);
  }
}

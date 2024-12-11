// src/lib/generateRequest.js
import { db, auth } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export async function fetchApiDetails() {
  // Check if the user is authenticated
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User is not logged in. Please sign in to continue.');
  }

  try {
    console.log('Fetching API details for user:', currentUser.uid);

    // Fetch API Key
    const apiKeyRef = doc(db, 'apiKeys', 'currentKey');
    const apiKeySnap = await getDoc(apiKeyRef);

    if (!apiKeySnap.exists()) {
      throw new Error('API Key document does not exist in Firestore.');
    }

    const { key: apiKey } = apiKeySnap.data();
    console.log('API Key fetched successfully.');

    // Fetch API URL
    const apiURLRef = doc(db, 'apiKeys', 'apiURL');
    const apiURLSnap = await getDoc(apiURLRef);

    if (!apiURLSnap.exists()) {
      throw new Error('API URL document does not exist in Firestore.');
    }

    const { url: apiURL } = apiURLSnap.data();
    console.log('API URL fetched successfully.');

    return { apiKey, apiURL };
  } catch (error) {
    console.error('Error fetching API details:', error);
    throw error;
  }
}

export async function generateAndSendJson(formData) {
  try {
    const { apiKey, apiURL } = await fetchApiDetails();

    // Generate the JSON payload
    const jsonData = {
      Taitoru: formData.title,
      KuraudoPurobaida: formData.cloudProviders,
      KankeiNoSetsumei: formData.relationships,
      Risousu: formData.icons,
      KurasutaNoSetsumei: formData.clusteringDetails,
    };

    console.log('Sending JSON payload:', jsonData);

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

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const result = await response.text(); // Get the SVG as text
    console.log('SVG response received successfully.');
    console.log('API response:', result);
    return result;

  } catch (error) {
    console.error('Error generating and sending JSON:', error);
    throw error;
  }
}

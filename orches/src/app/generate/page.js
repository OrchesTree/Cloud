'use client';
import { useState, useEffect } from 'react';
import { filterIcons } from './iconSearch';
import Navbar from '@/components/Navbar';

import { generateAndSendJson } from '@/lib/generateRequest';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'; // Import useRouter

const cloudProviders = ['AWS', 'Azure', 'Google Cloud', 'IBM Cloud', 'Oracle Cloud', 'Alibaba'];

export default function Generate() {
  
  const router = useRouter(); // Initialize router

  const [formData, setFormData] = useState({
    title: '',
    cloudProviders: [],
    icons: [],
    clusteringDetails: '',
    relationships: '',
    iconSearch: '',
  });


  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [svgResponse, setSvgResponse] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);



   // Check user authentication
   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const [filteredIcons, setFilteredIcons] = useState([]);

  const handleProviderSelect = (provider) => {
    setFormData((prev) => {
      const updatedProviders = prev.cloudProviders.includes(provider)
        ? prev.cloudProviders.filter((p) => p !== provider)
        : [...prev.cloudProviders, provider];
  
      // Safeguard: Ensure filteredIcons is always an array
      const newFilteredIcons = filterIcons(updatedProviders, prev.iconSearch) || [];
      setFilteredIcons(newFilteredIcons);
  
      return { ...prev, cloudProviders: updatedProviders };
    });
  };
  
  

  // Handle general input change
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   if (name === 'iconSearch') {
  //     setFormData({ ...formData, iconSearch: value });
  //     setFilteredIcons(filterIcons(formData.cloudProviders, value));
  //   } else {
  //     setFormData({ ...formData, [name]: value });
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
  
      if (name === 'iconSearch') {
        const newFilteredIcons = filterIcons(prev.cloudProviders, value) || [];
        setFilteredIcons(newFilteredIcons);
      }
  
      return updatedFormData;
    });
  };
  

  // Handle icon selection
  const handleIconSelect = (icon) => {
    setFormData((prev) => {
      const icons = prev.icons.includes(icon)
        ? prev.icons.filter((i) => i !== icon)
        : [...prev.icons, icon];
      return { ...prev, icons };
    });
  };

  // Remove selected icon
  const handleIconRemove = (icon) => {
    setFormData((prev) => ({
      ...prev,
      icons: prev.icons.filter((i) => i !== icon),
    }));
  };

   // Handle form submission
   const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user) {
      toast.error('Please sign in to generate the JSON.');
      return;
    }
  
    setLoadingSubmit(true); // Set loading state to true
  
    try {
      const result = await generateAndSendJson(formData);
      setSvgResponse(result);
      toast.success('SVG generated and received successfully!');
  
      // Store the SVG data in session storage and navigate to the editor page
      sessionStorage.setItem('svgData', result);
      router.push('/editor');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingSubmit(false); // Reset loading state to false
    }
  };
  

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-1000 to-black flex flex-col items-center overflow-y-auto text-white relative">

    <Navbar />
  
    {/* Overlay */}
    {loading ? (
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
        <p className="text-white text-2xl font-bold">Loading</p>
      </div>
    ) : !user && (
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
        <p className="text-white text-2xl font-bold">Please sign in to access this page.</p>
      </div>
    )}
  
    {/* Form */}
    <form onSubmit={handleSubmit} className="w-full max-w-4xl p-6 rounded-md backdrop-blur-md scrollbar-hidden">
  
      {/* Title */}
      <div className="flex flex-col mb-4">
        <label className="block text-gray-300 font-medium mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg text-white"
          placeholder="Enter title"
          required
        />
      </div>
  
      {/* Cloud Providers */}
      <div className="flex flex-col mb-4">
        <label className="block text-gray-300 font-medium mb-2">Select Cloud Providers</label>
        <div className="flex flex-wrap gap-2">
          {cloudProviders.map((provider) => (
            <button
              type="button"
              key={provider}
              onClick={() => handleProviderSelect(provider)}
              className={`px-4 py-2 rounded-full border border-gray-800 ${
                formData.cloudProviders.includes(provider) ? 'bg-gray-800 text-white' : 'bg-gray-850 text-gray-300'
              }`}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>
  
      {/* Search Icons */}
      <div className="flex flex-col mb-6">
        <label className="block text-gray-300 font-medium mb-2">Search Icons</label>
        <input
          type="text"
          name="iconSearch"
          value={formData.iconSearch}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg text-white"
          placeholder="Search for icons"
        />
      </div>
  
      {/* Necessary Icons with Checkboxes */}
      <div className="flex flex-col mb-6">
        <label className="block text-gray-300 font-medium mb-2">Select Necessary Icons</label>
        <div className="max-h-60 overflow-auto border border-gray-600 bg-gray-800 rounded-lg p-2 scrollbar-hidden">
          {filteredIcons.length > 0 ? (
            filteredIcons.map(({ key, highlighted }) => (
              <button
                type="button"
                key={key}
                onClick={() => handleIconSelect(key)}
                className={`w-full text-left px-2 py-1 mb-1 ${
                  formData.icons.includes(key) ? 'bg-gray-700 text-white rounded-lg' : 'bg-gray-800 text-gray-300'
                }`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            ))
          ) : (
            <p className="text-gray-400">Search for more icons above.</p>
          )}
        </div>
      </div>
  
      {/* Selected Icons Display */}
      {formData.icons.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {formData.icons.map((icon) => (
            <div key={icon} className="flex items-center bg-gray-700 px-3 py-1 rounded text-white">
              <span>{icon}</span>
              <button
                type="button"
                onClick={() => handleIconRemove(icon)}
                className="ml-2 font-bold text-white-500 hover:text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
  
      {/* Clustering Details */}
      <div className="flex flex-col mb-4">
        <label className="block text-gray-300 font-medium mb-2">How are these cloud provider resources clustered or grouped?</label>
        <textarea
          name="clusteringDetails"
          value={formData.clusteringDetails}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg text-white scrollbar-hidden"
          placeholder="Describe clustering details"
          rows="3"
          required
        />
      </div>
  
      {/* Relationships */}
      <div className="flex flex-col mb-4">
        <label className="block text-gray-300 font-medium mb-2">Describe the relationships between these resources and clusters/groups</label>
        <textarea
          name="relationships"
          value={formData.relationships}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg text-white scrollbar-hidden"
          placeholder="Describe relationships between resources"
          rows="3"
          required
        />
      </div>
  
      {/* Submit Button */}
      <button
      type="submit"
      className="w-full bg-gray-900 text-white py-2 rounded-lg mt-4 mb-9 hover:bg-gray-800 transition flex items-center justify-center"
      disabled={loadingSubmit}
     >
      {loadingSubmit ? (
        <span className="flex items-center justify-center">
          <span className="ml-1 animate-blink">... ... ...</span>
        </span>
      ) : (
        'Generate'
      )}
    </button>
  
      {/* Display Generated SVG */}
      {svgResponse && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Generated SVG:</h2>
          <div className="border border-gray-600 p-4 rounded-lg bg-gray-800" dangerouslySetInnerHTML={{ __html: svgResponse }} />
        </div>
      )}
    </form>
  
  </div>

  );
}
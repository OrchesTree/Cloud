'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { filterIcons } from './iconSearch';

const cloudProviders = ['AWS', 'Azure', 'Google Cloud', 'IBM Cloud', 'Oracle Cloud', 'Alibaba'];

export default function Generate() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    cloudProviders: [],
    icons: [],
    clusteringDetails: '',
    relationships: '',
    iconSearch: '',
  });

  const [filteredIcons, setFilteredIcons] = useState([]);

  // Handle cloud provider selection
  const handleProviderSelect = (provider) => {
    setFormData((prev) => {
      const cloudProviders = prev.cloudProviders.includes(provider)
        ? prev.cloudProviders.filter((p) => p !== provider)
        : [...prev.cloudProviders, provider];
      return { ...prev, cloudProviders };
    });
    setFilteredIcons(filterIcons(formData.cloudProviders, formData.iconSearch));
  };

  // Handle general input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'iconSearch') {
      setFormData({ ...formData, iconSearch: value });
      setFilteredIcons(filterIcons(formData.cloudProviders, value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
  const handleSubmit = (e) => {
    e.preventDefault();

    const output = {
      'Provide a title of your cloud system architecture': formData.title,
      'Select cloud providers': formData.cloudProviders,
      'Select resources used in this cloud system architecture': formData.icons,
      'How are these cloud provider resources clustered or grouped? Describe in detail':
        formData.clusteringDetails,
      'Describe the relationships between these resources and clusters/groups':
        formData.relationships,
    };

    alert(JSON.stringify(output, null, 2));
  };

  return (
    <div className="min-h-screen w-full p-4 bg-yellow-50 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Cloud System Architecture Generator</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-yellow-100 p-5 rounded-md">
        {/* Title */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Enter title"
            required
          />
        </div>

        {/* Cloud Providers */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 font-medium mb-2">Select Cloud Providers</label>
          <div className="flex flex-wrap gap-2">
            {cloudProviders.map((provider) => (
                <button
                  type="button"
                  key={provider}
                  onClick={() => handleProviderSelect(provider)}
                  className={`px-4 py-2 rounded border ${
                    formData.cloudProviders.includes(provider) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {provider}
                </button>
              ))}

          </div>
        </div>

        {/* Search Icons */}
        <div className="flex flex-col mb-6">
          <label className="block text-gray-700 font-medium mb-2">Search Icons</label>
          <input
            type="text"
            name="iconSearch"
            value={formData.iconSearch}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Search for icons"
          />
        </div>

        {/* Necessary Icons with Checkboxes */}
        <div className="flex flex-col mb-6">
          <label className="block text-gray-700 font-medium mb-2">Select Necessary Icons</label>
          <div className="max-h-60 overflow-auto border rounded p-2">
          {filteredIcons.length > 0 ? (
            filteredIcons.map(({ key, highlighted }) => (
              <button
                type="button"
                key={key}
                onClick={() => handleIconSelect(key)}
                className={`w-full text-left px-2 py-1 mb-1 ${
                  formData.icons.includes(key) ? 'bg-blue-100 text-black' : 'bg-yellow-100'
                }`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            ))
          ) : (
            <p className="text-gray-500">No icons found.</p>
          )}

          </div>
        </div>

          {/* Selected Icons Display */}
          {formData.icons.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {formData.icons.map((icon) => (
              <div key={icon} className="flex items-center bg-blue-100 px-3 py-1 rounded">
                <span>{icon}</span>
                <button
                  type="button"
                  onClick={() => handleIconRemove(icon)}
                  className="ml-2 text-red-500 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}


        {/* Clustering Details */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 font-medium mb-2">How are these cloud provider resources clustered or grouped?</label>
          <textarea
            name="clusteringDetails"
            value={formData.clusteringDetails}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Describe clustering details"
            rows="3"
            required
          />
        </div>

        {/* Relationships */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 font-medium mb-2">Describe the relationships between these resources and clusters/groups</label>
          <textarea
            name="relationships"
            value={formData.relationships}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Describe relationships between resources"
            rows="3"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 transition"
        >
          Generate JSON
        </button>

         {/* Navigation Buttons */}
         <div className="flex justify-between mt-6">
          <button
            type="button"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
            onClick={() => router.push('/editor')}
          >
            Go to Editor Page
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
            onClick={() => router.push('/')}
          >
            Go to Home Page
          </button>
        </div>
      </form>
    </div>
  );
}

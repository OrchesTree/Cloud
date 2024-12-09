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

  const handleChange = (e) => {
    const { name, value, options } = e.target;
    if (name === 'cloudProviders') {
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setFormData({ ...formData, cloudProviders: selectedOptions });
      setFilteredIcons(filterIcons(selectedOptions, formData.iconSearch));
    } else if (name === 'iconSearch') {
      setFormData({ ...formData, iconSearch: value });
      setFilteredIcons(filterIcons(formData.cloudProviders, value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleIconSelect = (icon) => {
    setFormData((prev) => {
      const icons = prev.icons.includes(icon)
        ? prev.icons.filter((i) => i !== icon)
        : [...prev.icons, icon];
      return { ...prev, icons };
    });
  };

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
          <select
            name="cloudProviders"
            value={formData.cloudProviders}
            onChange={handleChange}
            multiple
            className="w-full px-4 py-2 border rounded"
            required
          >
            {cloudProviders.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        {/* Search Icons */}
        <div className="flex flex-col mb-4">
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
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 font-medium mb-2">Select Necessary Icons</label>
          <div className="max-h-60 overflow-auto border rounded p-2">
            {filteredIcons.length > 0 ? (
              filteredIcons.map(({ key, highlighted }) => (
                <div key={key} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={formData.icons.includes(key)}
                    onChange={() => handleIconSelect(key)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={key}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                    className="text-sm"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No icons found. Try adjusting your search or cloud provider selection.</p>
            )}
          </div>
        </div>

        {/* Clustering Details */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            How are these cloud provider resources clustered or grouped? Describe in detail
          </label>
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
          <label className="block text-gray-700 font-medium mb-2">
            Describe the relationships between these resources and clusters/groups
          </label>
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

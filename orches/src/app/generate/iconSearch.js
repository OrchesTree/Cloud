import iconDescriptor from './icon_descriptor.json';

// Function to clean strings (remove special characters and lowercase them)
const cleanString = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// Mapping of cloud providers to potential aliases
const providerMapping = {
  'AWS': ['aws'],
  'Azure': ['azure'],
  'Google Cloud': ['google', 'gcp'],
  'IBM Cloud': ['ibm'],
  'Oracle Cloud': ['oracle', 'oci'],
  'Alibaba': ['alibaba'],
};

/**
 * Filters icons based on selected cloud providers and search query.
 *
 * @param {string[]} selectedProviders - List of selected cloud providers (e.g., AWS, Azure).
 * @param {string} searchQuery - User's search query.
 * @returns {Array<{ key: string, highlighted: string }>} - List of filtered icon keys with highlighted matches.
 */
export const filterIcons = (selectedProviders, searchQuery) => {

  // if (!selectedProviders || !searchQuery) return []; // Early return if no selectedProviders or searchQuery

  // Step 1: Filter icons by selected providers
  let providerFilteredIcons = Object.keys(iconDescriptor).filter((iconKey) =>
    selectedProviders.some((provider) =>
      providerMapping[provider]?.some((alias) =>
        iconKey.toLowerCase().includes(alias.toLowerCase())
      )
    )
  );

  // Debugging output
  console.log('Selected Providers:', selectedProviders);

  // Step 2: Clean the search query and split by spaces
  const cleanedQuery = searchQuery
    .split(/\s+/)
    .map((word) => cleanString(word))
    .filter(Boolean);

  // Step 3: Filter icons by checking if all search words are present in any segments
  const searchFilteredIcons = providerFilteredIcons
    .filter((iconKey) => {
      const cleanedIconKey = cleanString(iconKey);
      const iconSegments = iconKey.split('.').map(cleanString);

      // Segment-based matching
      const segmentMatch = cleanedQuery.every((word) =>
        iconSegments.some((segment) => segment.includes(word))
      );

      // Joint string matching
      const jointMatch = cleanedQuery.every((word) => cleanedIconKey.includes(word));

      return segmentMatch || jointMatch;
    })
    .map((iconKey) => ({
      key: iconKey,
      highlighted: getHighlightedText(iconKey, cleanedQuery),
    }));

    return searchFilteredIcons.length > 0 ? searchFilteredIcons : []; // Return empty array if no matches
  };

/**
 * Highlights the matched parts of the text.
 *
 * @param {string} text - The original text.
 * @param {string[]} searchWords - Array of search words.
 * @returns {string} - The text with matched parts wrapped in <mark> tags.
 */
const getHighlightedText = (text, searchWords) => {
  let result = text;
  searchWords.forEach((word) => {
    if (word) {
      const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
      result = result.replace(regex, '<mark style="background-color:rgb(220, 220, 220); color: #000; padding: 2px 4px; border-radius: 10px;">$1</mark>');
    }
  });
  return result;
};

/**
 * Escapes special characters in a string for use in a regular expression.
 *
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import defaultData from './default_prompt.json';
import DotBackground from '@/components/DotBackground';


const googleProvider = new GoogleAuthProvider();


const cloudProviders = ['AWS', 'Azure', 'Google Cloud', 'IBM Cloud', 'Oracle Cloud', 'Alibaba'];


export default function Generate() {
// Autofill form data with default JSON
const handleDefault = () => {
 if (isDefaultApplied) {
   // Reset form
   setFormData({
     title: '',
     cloudProviders: [],
     icons: [],
     clusteringDetails: '',
     relationships: '',
     iconSearch: '',
   });
   setFilteredIcons([]);


   // Reset the height of textareas to the default size (1 row)
   setTimeout(() => {
     const clusteringDetailsTextarea = document.querySelector('[name="clusteringDetails"]');
     const relationshipsTextarea = document.querySelector('[name="relationships"]');


     if (clusteringDetailsTextarea) {
       clusteringDetailsTextarea.style.height = 'auto'; // Reset height
       clusteringDetailsTextarea.style.height = '2.5rem'; // Fixed height for 1 row (approximate)
     }


     if (relationshipsTextarea) {
       relationshipsTextarea.style.height = 'auto'; // Reset height
       relationshipsTextarea.style.height = '2.5rem'; // Fixed height for 1 row (approximate)
     }
   }, 0); // Delay to ensure DOM updates are applied before resizing
 } else {
   // Apply default data
   setFormData(defaultData);
   setFilteredIcons(filterIcons(defaultData.cloudProviders, defaultData.iconSearch) || []);


   // Adjust the height of textareas for clusteringDetails and relationships after autofill
   setTimeout(() => {
     const clusteringDetailsTextarea = document.querySelector('[name="clusteringDetails"]');
     const relationshipsTextarea = document.querySelector('[name="relationships"]');


     if (clusteringDetailsTextarea) {
       clusteringDetailsTextarea.style.height = 'auto'; // Reset height
       clusteringDetailsTextarea.style.height = `${clusteringDetailsTextarea.scrollHeight}px`; // Adjust to fit content
     }


     if (relationshipsTextarea) {
       relationshipsTextarea.style.height = 'auto'; // Reset height
       relationshipsTextarea.style.height = `${relationshipsTextarea.scrollHeight}px`; // Adjust to fit content
     }
   }, 0); // Delay to ensure DOM updates are applied before resizing
 }
 setIsDefaultApplied(!isDefaultApplied); // Toggle the button state
};


 const router = useRouter(); // Initialize router


 const [formData, setFormData] = useState({
   title: '',
   cloudProviders: [],
   icons: [],
   clusteringDetails: '',
   relationships: '',
   iconSearch: '',
 });


 const [isDefaultApplied, setIsDefaultApplied] = useState(false); // To toggle button functionality
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [svgResponse, setSvgResponse] = useState(null);
 const [loadingSubmit, setLoadingSubmit] = useState(false);
 const [showDots, setShowDots] = useState(false); // State to control DotBackground rendering


 const [animateInputs, setAnimateInputs] = useState(false);




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


  // Handle Google Login
  const handleGoogleLogin = async () => {
   try {
     await signInWithPopup(auth, googleProvider);
     toast.success('Successfully signed in!');
   } catch (error) {
     switch (error.code) {
       case 'auth/popup-closed-by-user':
         toast.info('Sign-in popup closed. Please try again.');
         break;
       case 'auth/network-request-failed':
         toast.error('Network error. Please check your connection and try again.');
         break;
       case 'auth/cancelled-popup-request':
         toast.info('Sign-in popup request was cancelled. Please try again.');
         break;
       default:
         toast.error(`Login failed: ${error.message}`);
     }
   }
 };


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
    setLoadingSubmit(true);
   setAnimateInputs(true); // Trigger input animation
    // Trigger the dots animation
   setShowDots(true);
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
     setLoadingSubmit(false);
     setShowDots(false);
      // Reset the animation after a delay
     setTimeout(() => setAnimateInputs(false), 1000);
   }
 };
 


 return (
   <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-1000 to-black flex flex-col items-center overflow-y-auto text-white relative scrollbar-hidden">

     <div className="flex w-full min-h-screen">

       {/* Left Fixed Div */}
       <div className="hidden lg:flex fixed top-[6rem] bottom-[2rem] left-4 w-64 bg-gray-900 rounded-lg flex-col items-center justify-between shadow-lg p-4 z-10">

         <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center mb-4">
           <p className="text-white">Upper Div 1</p>
         </div>
         <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center mb-4">
           <p className="text-white">Upper Div 2</p>
         </div>
         <button
           type="button"
           form="generateForm"
           onClick={handleDefault}
           disabled={loadingSubmit}
           className={`w-full py-3 mt-auto rounded-lg transition flex items-center justify-center shadow-md ${
             loadingSubmit
               ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
               : 'bg-gray-800 text-white hover:bg-gray-700'
           }`}
         >
           {isDefaultApplied ? 'Clear Default' : 'Click for a Demo Prompt'}
         </button>
       </div>
        {/* Form */}
       <div className="flex-1 lg:ml-64 lg:mr-64 flex justify-center items-start p-6">
         <form
           id="generateForm"
           onSubmit={handleSubmit}
           className="w-full max-w-4xl p-6 rounded-lg shadow-md flex flex-col gap-4 z-10"
         >


                               {/* Title */}
                               <div className="flex flex-col mb-4">
                                 <label className="block text-gray-300 font-medium mb-2">Title</label>
                                 <input
                                   type="text"
                                   name="title"
                                   value={formData.title}
                                   onChange={handleChange}
                                   className={`w-full px-4 py-2 bg-gray-800 rounded-lg text-white ${
                                     animateInputs ? 'animate-gradient' : ''
                                   }`}
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
                                       formData.cloudProviders.includes(provider)
                                         ? `bg-gray-800 text-white ${animateInputs ? 'animate-gradient' : ''}` // Animate only if Generate is clicked
                                         : 'bg-gray-850 text-gray-300'
                                     }`}
                                   >
                                     {provider}
                                   </button>
                                 ))}
                               </div>
                             </div>


                               {/* Necessary Icons with Checkboxes */}
                               <div className="flex flex-col mb-1">
                                 <label className="block text-gray-300 font-medium mb-2">Select Necessary Icons</label>
                                 {/* Search Icons */}
                                 <div className="flex flex-col mb-6">
                                   <input
                                     type="text"
                                     name="iconSearch"
                                     value={formData.iconSearch}
                                     onChange={handleChange}
                                     className="w-full px-4 py-2 bg-gray-900 rounded-full text-white"
                                     placeholder=" 🔎  Search for icons"
                                   />
                                 </div>


                                 {filteredIcons.length > 0 && (           
                                   <div className="max-h-60 overflow-auto bg-gray-800 rounded-lg p-2 scrollbar-hidden mb-3">
                                   {filteredIcons.map(({ key, highlighted }) => (
                                     <button
                                       type="button"
                                         key={key}
                                         onClick={() => handleIconSelect(key)}
                                         className={`w-full text-left px-2 py-1 mb-1 ${
                                           formData.icons.includes(key) ? 'bg-gray-700 text-white rounded-lg' : 'bg-gray-800 text-gray-300'
                                         }`}
                                         dangerouslySetInnerHTML={{ __html: highlighted }}
                                       />
                                     ))}
                                   </div>
                                 )}


                               </div>
                          
                             {/* Selected Icons Display */}
                           {formData.icons.length > 0 && (
                           <div className="flex flex-wrap gap-2 mb-6">
                             <p className="w-full text-gray-300 font-medium mb-2">Selected Icons</p>
                             {formData.icons.map((icon) => (
                               <div
                                 key={icon}
                                 className="flex items-center bg-gray-900 px-3 py-1 rounded-lg text-white"
                               >
                                 <span
                                   className={animateInputs ? 'animate-gradient' : ''}
                                   style={{
                                     background: animateInputs
                                       ? 'linear-gradient(45deg, #00f, #8e44ad, #ff69b4, #4b0082, #87cefa, #f8f8ff)'
                                       : 'none',
                                     WebkitBackgroundClip: animateInputs ? 'text' : 'initial',
                                     WebkitTextFillColor: animateInputs ? 'transparent' : 'initial',
                                   }}
                                 >
                                   {icon}
                                 </span>
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
                               <label className="block text-gray-300 font-medium mb-2">
                                 How are these cloud provider resources clustered or grouped?
                               </label>
                               <textarea
                               name="clusteringDetails"
                               value={formData.clusteringDetails}
                               onChange={(e) => {
                                 handleChange(e);
                                 e.target.style.height = 'auto'; // Reset height to calculate scrollHeight
                                 e.target.style.height = `${e.target.scrollHeight}px`; // Set height to fit content
                               }}
                               className={`w-full px-4 py-2 bg-gray-800 rounded-lg text-white scrollbar-hidden ${
                                 animateInputs ? 'animate-gradient' : ''
                               }`}
                               placeholder="Describe clustering details"
                               rows="1"
                               style={{ overflow: 'hidden' }} // Prevent scrollbar from appearing
                               required
                             />
                             </div>


                             {/* Relationships */}
                             <div className="flex flex-col mb-4">
                               <label className="block text-gray-300 font-medium mb-2">
                                 Describe the relationships between these resources and clusters/groups
                               </label>
                               <textarea
                               name="relationships"
                               value={formData.relationships}
                               onChange={(e) => {
                                 handleChange(e);
                                 e.target.style.height = 'auto'; // Reset height to calculate scrollHeight
                                 e.target.style.height = `${e.target.scrollHeight}px`; // Set height to fit content
                               }}
                               className={`w-full px-4 py-2 bg-gray-800 rounded-lg text-white scrollbar-hidden ${
                                 animateInputs ? 'animate-gradient' : ''
                               }`}
                               placeholder="Describe relationships between resources"
                               rows="1"
                               style={{ overflow: 'hidden' }} // Prevent scrollbar from appearing
                               required
                             />
                             </div>


                           {/* For smaller screens */}
                           <div className="block lg:hidden w-full mt-6 space-y-4">
                                 <div className="w-full bg-gray-800 rounded-lg p-4">
                                   <div className="w-full h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                                     <p className="text-white">Upper Div 1</p>
                                   </div>
                                   <div className="w-full h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                                     <p className="text-white">Upper Div 2</p>
                                   </div>
                                   <button
                                     type="button"
                                     form="generateForm"
                                     onClick={handleDefault}
                                     disabled={loadingSubmit}
                                     className={`w-full py-3 mt-4 rounded-lg transition flex items-center justify-center shadow-md ${
                                       loadingSubmit
                                         ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                         : 'bg-gray-800 text-white hover:bg-gray-700'
                                     }`}
                                   >
                                     {isDefaultApplied ? 'Clear Default' : 'Click for a Demo Prompt'}
                                   </button>
                                 </div>
                                 <div className="w-full bg-gray-800 rounded-lg p-4">
                                   <button
                                     type="submit"
                                     form="generateForm"
                                     className={`w-full py-3 rounded-lg transition flex items-center justify-center shadow-md ${
                                       loadingSubmit ? 'animate-gradient bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'
                                     }`}
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
                                 </div>
                               </div>


                             {/* Display Generated SVG */}
                             {svgResponse && (
                               <div className="mt-8">
                                 <h2 className="text-2xl font-bold mb-4">Generated SVG:</h2>
                                 <div className="p-4 rounded-lg bg-gray-800" dangerouslySetInnerHTML={{ __html: svgResponse }} />
                               </div>
                             )}
                           </form>
                           </div>


 {/* Right Fixed Div */}
     <div className="hidden lg:flex fixed top-[6rem] bottom-[2rem] right-4 w-64 bg-gray-900 rounded-lg flex-col items-center justify-between shadow-lg p-4 z-10">
     <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center mb-4">
           <p className="text-white">Upper Div 1</p>
         </div>
         <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center mb-4">
           <p className="text-white">Upper Div 2</p>
         </div>
       <button
         type="submit"
         form="generateForm"
         className={`w-full py-3 mt-auto rounded-lg transition flex items-center justify-center shadow-md ${
           loadingSubmit ? 'animate-gradient bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700'
         }`}
         disabled={loadingSubmit}
       >
         {loadingSubmit ? (
           <span className="flex items-center justify-center">
             <span className="ml-1 animate-blink">Generating</span>
           </span>
         ) : (
           'Generate'
         )}
       </button>
     </div>
   </div>




   <Navbar />
    {/* Overlay */}
   {loading ? (
     <div className="absolute inset-0 bg-gray-900 bg-opacity-0 flex justify-center items-center z-10">
     </div>
   ) : !user && (
     <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-md flex justify-center items-center z-20">
       <button
             onClick={handleGoogleLogin}
             className={`px-4 py-1 rounded-full mr-8 ${'bg-white text-black hover:bg-gray-800 hover:text-white'
             }`}
           >
             Sign in to Generate
           </button>
     </div>
  
   )}


   {/* Render DotBackground when showDots is true */}
   {showDots && (
     <div className="absolute inset-0">
       <DotBackground />
     </div>
   )}
  </div>


 );
}




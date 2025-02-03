import { useState, useEffect } from 'react';

const useFetch = (url) => {
   const [data, setData] = useState([]);
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         setError(null);

         try {
            const res = await fetch(url);
            if (!res.ok) {
               throw new Error('Failed to fetch');
            }
            const result = await res.json();
            console.log('Fetched data:', result); // Log the result
            setData(result); // Set the data directly as it's already an array
         } catch (error) {
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [url]);

   return {
      data,
      error,
      loading
   };
};

export default useFetch;

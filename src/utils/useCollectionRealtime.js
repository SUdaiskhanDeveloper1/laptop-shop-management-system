import { useEffect } from "react";
import { useData } from "../context/DataContext";

export default function useCollectionRealtime(collectionName) {
  const { collections, loading, fetchCollection } = useData();

  useEffect(() => {
    // Only call fetchCollection if data is not present and not currently loading.
    // fetchCollection itself now has a check using refs, so we are safe either way.
    if (!collections[collectionName] && !loading[collectionName]) {
      fetchCollection(collectionName);
    }
  }, [collectionName, fetchCollection]); // collections and loading intentionally omitted to prevent re-triggers

  return { 
    data: collections[collectionName] || [], 
    loading: loading[collectionName] === true && !collections[collectionName] 
  };
}

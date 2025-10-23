import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export default function useCollectionRealtime(collectionName) {
  const [data, setData] = useState([]);

  useEffect(() => {
    
    const unsub = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setData(list);
      },
      (error) => {
        console.error("Firestore error:", error);
      }
    );

    return () => unsub();
  }, [collectionName]);

  return { data };
}

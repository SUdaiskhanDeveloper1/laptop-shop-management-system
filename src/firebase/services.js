import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

export async function exportCollectionCSV(collectionName) {
  if (!db) {
    console.error('exportCollectionCSV: Firebase not initialized (db is null).');
    return null;
  }

  const snapshot = await getDocs(collection(db, collectionName));
  if (snapshot.empty) return null;

  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const keys = Object.keys(items[0]);
  const csv = [
    keys.join(","),
    ...items.map((item) => keys.map((key) => `"${item[key] || ""}"`).join(",")),
  ].join("\n");

  return csv;
}

export async function updateSale(saleData) {
  const { id, ...data } = saleData;
  const saleDoc = doc(db, "sales", id);
  return await updateDoc(saleDoc, data);
}

export async function deleteSale(id) {
  const saleDoc = doc(db, "sales", id);
  return await deleteDoc(saleDoc);
}

export const addLaptop = async (data) => {
  try {
    if (!db) {
      console.error('addLaptop: Firebase not initialized (db is null).');
      return null;
    }

    const docRef = await addDoc(collection(db, "laptops"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    console.log("Laptop added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding laptop:", error);
  }
};

export const getLaptops = async () => {
  try {
    if (!db) {
      console.error('getLaptops: Firebase not initialized (db is null).');
      return [];
    }

    const q = query(collection(db, "laptops"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching laptops:", error);
  }
};

export const updateLaptop = async (id, newData) => {
  try {
    if (!db) {
      console.error('updateLaptop: Firebase not initialized (db is null).');
      return null;
    }

    const docRef = doc(db, "laptops", id);
    await updateDoc(docRef, newData);
    console.log("Laptop updated:", id);
  } catch (error) {
    console.error("Error updating laptop:", error);
  }
};

export const deleteLaptop = async (id) => {
  try {
    if (!db) {
      console.error('deleteLaptop: Firebase not initialized (db is null).');
      return null;
    }

    await deleteDoc(doc(db, "laptops", id));
    console.log("Laptop deleted:", id);
  } catch (error) {
    console.error("Error deleting laptop:", error);
  }
};

export const addSupplier = async (data) => {
  try {
    if (!db) {
      console.error('addSupplier: Firebase not initialized (db is null).');
      return null;
    }

    const docRef = await addDoc(collection(db, "suppliers"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding supplier:", error);
  }
};

export const getSuppliers = async () => {
  try {
    if (!db) {
      console.error('getSuppliers: Firebase not initialized (db is null).');
      return [];
    }

    const snapshot = await getDocs(collection(db, "suppliers"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
  }
};

export const updateSupplier = async (id, newData) => {
  try {
    if (!db) {
      console.error('updateSupplier: Firebase not initialized (db is null).');
      return null;
    }

    const docRef = doc(db, "suppliers", id);
    await updateDoc(docRef, newData);
  } catch (error) {
    console.error("Error updating supplier:", error);
  }
};

export const deleteSupplier = async (id) => {
  try {
    if (!db) {
      console.error('deleteSupplier: Firebase not initialized (db is null).');
      return null;
    }

    await deleteDoc(doc(db, "suppliers", id));
  } catch (error) {
    console.error("Error deleting supplier:", error);
  }
};

export const addPurchase = async (data) => {
  try {
    if (!db) {
      console.error('addPurchase: Firebase not initialized (db is null).');
      return null;
    }

    const docRef = await addDoc(collection(db, "purchases"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding purchase:", error);
  }
};

export const addSale = async (data) => {
  try {
    if (!db) {
      console.error('addSale: Firebase not initialized (db is null).');
      return null;
    }

    const docRef = await addDoc(collection(db, "sales"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding sale:", error);
  }
};

export const getProfitSummary = async () => {
  try {
    if (!db) {
      console.error('getProfitSummary: Firebase not initialized (db is null).');
      return { totalSales: 0, totalPurchases: 0, profit: 0 };
    }

    const sales = await getSales();
    const purchases = await getPurchases();

    const totalSales = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalPurchases = purchases.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );
    const profit = totalSales - totalPurchases;

    return {
      totalSales,
      totalPurchases,
      profit,
    };
  } catch (error) {
    console.error("Error calculating profit:", error);
  }
};

import { Timestamp } from "firebase/firestore";

export const getSales = async () => {
  if (!db) {
    console.error('getSales: Firebase not initialized (db is null).');
    return [];
  }

  const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getPurchases = async () => {
  if (!db) {
    console.error('getPurchases: Firebase not initialized (db is null).');
    return [];
  }

  const q = query(collection(db, "purchases"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getTotals = async () => {
  try {
    if (!db) {
      console.error('getTotals: Firebase not initialized (db is null).');
      return {
        totalLaptops: 0,
        totalStock: 0,
        totalSalesCount: 0,
        totalPurchasesCount: 0,
        totalSalesAmount: 0,
        totalPurchasesAmount: 0,
        totalExpenseAmount: 0,
        profit: 0,
      };
    }

    const laptopsSnap = await getDocs(collection(db, "laptops"));
    const laptops = laptopsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const totalLaptops = laptops.length;
    const totalStock = laptops.reduce(
      (s, l) => s + (Number(l.quantity) || 0),
      0
    );

    const sales = await getSales();
    const purchases = await getPurchases();
    const totalSalesCount = sales.length;
    const totalPurchasesCount = purchases.length;
    const totalSalesAmount = sales.reduce(
      (s, it) => s + Number(it.totalSale || it.amount || 0),
      0
    );
    const totalPurchasesAmount = purchases.reduce(
      (s, it) => s + Number(it.totalCost || it.amount || 0),
      0
    );

    const totalExpenseAmount = totalPurchasesAmount; // alias
    const profit = totalSalesAmount - totalPurchasesAmount;

    return {
      totalLaptops,
      totalStock,
      totalSalesCount,
      totalPurchasesCount,
      totalSalesAmount,
      totalPurchasesAmount,
      totalExpenseAmount,
      profit,
    };
  } catch (e) {
    console.error("Error getTotals:", e);
  }
};

function isoDateToString(tsOrIso) {
  if (!tsOrIso) return "";
  if (tsOrIso.toDate) return tsOrIso.toDate().toISOString();
  return typeof tsOrIso === "string" ? tsOrIso : "";
}

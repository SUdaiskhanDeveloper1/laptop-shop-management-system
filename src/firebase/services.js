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
    const docRef = await addDoc(collection(db, "laptops"), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    // console.log("Laptop added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding laptop:", error);
  }
};

export const getLaptops = async () => {
  try {
    const q = query(collection(db, "laptops"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching laptops:", error);
  }
};

export const updateLaptop = async (id, newData) => {
  try {
    const docRef = doc(db, "laptops", id);
    await updateDoc(docRef, newData);
    console.log("Laptop updated:", id);
  } catch (error) {
    console.error("Error updating laptop:", error);
  }
};

export const deleteLaptop = async (id) => {
  try {
    await deleteDoc(doc(db, "laptops", id));
    console.log("Laptop deleted:", id);
  } catch (error) {
    console.error("Error deleting laptop:", error);
  }
};

export const addSupplier = async (data) => {
  try {
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
    const snapshot = await getDocs(collection(db, "suppliers"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
  }
};

export const updateSupplier = async (id, newData) => {
  try {
    const docRef = doc(db, "suppliers", id);
    await updateDoc(docRef, newData);
  } catch (error) {
    console.error("Error updating supplier:", error);
  }
};

export const deleteSupplier = async (id) => {
  try {
    await deleteDoc(doc(db, "suppliers", id));
  } catch (error) {
    console.error("Error deleting supplier:", error);
  }
};

export const addPurchase = async (data) => {
  try {
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
    const sales = await getSales();
    const purchases = await getPurchases();

    const totalSales = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalPurchases = purchases.reduce(
      (sum, p) => sum + (p.amount || 0),
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

// import { Timestamp } from "firebase/firestore";

export const getSales = async () => {
  const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getPurchases = async () => {
  const q = query(collection(db, "purchases"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getTotals = async () => {
  try {
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

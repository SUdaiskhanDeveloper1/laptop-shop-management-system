import { apiFetch } from "../api";

export async function exportCollectionCSV(collectionName) {
  try {
    // We can use the specialized routes here if available
    const specializedRoutes = ['laptops', 'sales', 'purchases', 'suppliers', 'expenses', 'additional_sales'];
    const endpoint = specializedRoutes.includes(collectionName) ? `/${collectionName}` : `/collections/${collectionName}`;
    
    const items = await apiFetch(endpoint);
    if (!items || items.length === 0) return null;

    const keys = Object.keys(items[0]).filter(k => k !== 'id');
    const csv = [
      keys.join(","),
      ...items.map((item) => keys.map((key) => `"${item[key] || ""}"`).join(",")),
    ].join("\n");

    return csv;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateSale(saleData) {
  const { id, ...data } = saleData;
  return await apiFetch(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteSale(id) {
  return await apiFetch(`/sales/${id}`, { method: 'DELETE' });
}

export const addLaptop = async (data) => {
  try {
    const res = await apiFetch('/laptops', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.id;
  } catch (error) {
    console.error("Error adding laptop:", error);
  }
};

export const getLaptops = async () => {
  try {
    return await apiFetch('/laptops');
  } catch (error) {
    console.error("Error fetching laptops:", error);
    return [];
  }
};

export const updateLaptop = async (id, newData) => {
  try {
    await apiFetch(`/laptops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    });
    console.log("Laptop updated:", id);
  } catch (error) {
    console.error("Error updating laptop:", error);
  }
};

export const deleteLaptop = async (id) => {
  try {
    await apiFetch(`/laptops/${id}`, { method: 'DELETE' });
    console.log("Laptop deleted:", id);
  } catch (error) {
    console.error("Error deleting laptop:", error);
  }
};

export const addSupplier = async (data) => {
  try {
    const res = await apiFetch('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.id;
  } catch (error) {
    console.error("Error adding supplier:", error);
  }
};

export const getSuppliers = async () => {
  try {
    return await apiFetch('/suppliers');
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
};

export const updateSupplier = async (id, newData) => {
  try {
    await apiFetch(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
  }
};

export const deleteSupplier = async (id) => {
  try {
    await apiFetch(`/suppliers/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Error deleting supplier:", error);
  }
};

export const addPurchase = async (data) => {
  try {
    const res = await apiFetch('/purchases', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.id;
  } catch (error) {
    console.error("Error adding purchase:", error);
  }
};

export const addSale = async (data) => {
  try {
    const res = await apiFetch('/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.id;
  } catch (error) {
    console.error("Error adding sale:", error);
  }
};

export const getSales = async () => {
  try {
    return await apiFetch('/sales');
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getPurchases = async () => {
  try {
    return await apiFetch('/purchases');
  } catch (error) {
    console.error(error);
    return [];
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

export const getTotals = async () => {
  try {
    const laptops = await getLaptops();
    const totalLaptops = laptops.length;
    const totalStock = laptops.reduce(
      (s, l) => s + (Number(l.quantity) || 0),
      0
    );

    const sales = await getSales();
    const purchases = await getPurchases();
    const expenses = await apiFetch('/expenses').catch(() => []);
    
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
    const totalExpenseAmount = expenses.reduce(
      (s, it) => s + Number(it.amount || 0),
      0
    );

    const profit = totalSalesAmount - totalPurchasesAmount - totalExpenseAmount;

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

export function isoDateToString(tsOrIso) {
  if (!tsOrIso) return "";
  if (tsOrIso.toDate) return tsOrIso.toDate().toISOString(); // fallback for old firebase data if any
  return typeof tsOrIso === "string" ? tsOrIso : "";
}

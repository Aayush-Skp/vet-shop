"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  category: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/verify", { credentials: "include" });
      const data = await res.json();
      if (!data.authenticated) {
        router.replace("/admin");
        return;
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    async function load() {
      try {
        const res = await fetch("/api/admin/products", { credentials: "include" });
        if (res.status === 401) {
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        setProducts(data.products || []);
        if (data.error && !data.products?.length) {
          setError(data.error);
        }
      } catch {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authChecked, router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/admin");
    router.refresh();
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete");
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      setError("Failed to delete product");
    }
  }

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/products" className="text-lg font-semibold text-slate-800">
              Curavet Admin
            </Link>
            <nav className="flex gap-4">
              <Link href="/admin/products" className="text-teal-600 font-medium">
                Products
              </Link>
              <Link href="/" target="_blank" className="text-slate-500 hover:text-slate-700">
                View Site
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
          >
            Add Product
          </Link>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Setup required</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2">See ADMIN_SETUP.md in the project root for setup instructions.</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 mb-4">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Category</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Rs. {p.price.toLocaleString()}
                      {p.discount > 0 && (
                        <span className="text-amber-600 text-sm ml-1">({p.discount}% off)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

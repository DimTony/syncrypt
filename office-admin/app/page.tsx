"use client";

import { useEffect, useState, useCallback } from "react";

interface RecordItem {
  _id: string;
  sub: string;
  key: string;
  seen: boolean;
  processing: boolean;
  batchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RecordsPage() {
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [ready, setReady] = useState(false);

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset authorization on every page mount/reload.
  useEffect(() => {
    let active = true;

    fetch("/api/mfa/reset", {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to initialize MFA");
      })
      .catch(() => {
        if (active)
          setError("Unable to initialize verification. Reload the page.");
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchRecords = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/users?page=${page}&limit=${limit}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.status === 401) {
        setVerified(false);
        setRecords([]);
        throw new Error("Your MFA session has expired.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Unable to fetch records");
      }

      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch records only after successful MFA verification.
  useEffect(() => {
    if (verified) {
      fetchRecords(pagination.page, pagination.limit);
    }
  }, [verified, pagination.page, pagination.limit, fetchRecords]);

  async function verifyMFA(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit MFA code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Incorrect MFA code");
      }

      setCode("");
      setPagination((prev) => ({
        ...prev,
        page: 1,
      }));
      setVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  function changePage(page: number) {
    if (page < 1 || page > pagination.totalPages || page === pagination.page)
      return;

    setPagination((prev) => ({ ...prev, page }));
  }

  // MFA screen
  if (!verified) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form
          onSubmit={verifyMFA}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
              🔐
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Security Verification
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            disabled={!ready || loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-4 text-center text-3xl tracking-[0.5em] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          />

          {error && (
            <p className="mt-3 text-center text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={!ready || loading || code.length !== 6}
            className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!ready
              ? "Initializing..."
              : loading
                ? "Verifying..."
                : "Verify & Continue"}
          </button>
        </form>
      </main>
    );
  }

  // Records screen
  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Records</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view your records.
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Verified
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <p className="text-sm text-gray-600">
              Total records: {pagination.total}
            </p>

            <select
              value={pagination.limit}
              onChange={(e) =>
                setPagination((prev) => ({
                  ...prev,
                  page: 1,
                  limit: Number(e.target.value),
                }))
              }
              className="rounded-lg border border-gray-300 p-2 text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>

          {error && <div className="p-4 text-sm text-red-600">{error}</div>}

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Password</th>
                  <th className="px-6 py-4">Seen</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      Loading records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{record.sub}</td>
                      <td className="px-6 py-4">{record.key}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          {record.seen ? "Seen" : "Unseen"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {loading ? (
              <p className="py-8 text-center text-gray-500">
                Loading records...
              </p>
            ) : records.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No records found.
              </p>
            ) : (
              records.map((record) => (
                <div
                  key={record._id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {record.sub}
                    </h3>

                    <span className={`${record.seen ? "text-green-700" : "text-red-300"} rounded-full bg-green-100 px-2 py-1 text-xs`}>
                      {record.seen ? "true" : "false"}
                    </span>
                  </div>

                  <p className="mt-2 break-all text-sm text-gray-600">
                    {record.key}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Pagination controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages || 1}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                {pagination.page}
              </span>

              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

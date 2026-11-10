"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { LuCopy, LuChevronDown } from "react-icons/lu";

import MobileWarning from "@/components/ui/MobileWarning";
import { useToaster } from "@/components/ui/Toaster";
import { useIsMobile } from "@/lib/useIsMobile";
import { encryptText, decryptText } from "@/lib/cipher";
import type { CheckEncryptionResponse } from "@/app/api/check-encryption/route";
import type { EncryptionStatus } from "@/models/Device";

// Shape returned by https://ipwho.is (note: `country`, not `country_name`)
interface GeoInfo {
  success?: boolean;
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: { id: string };
  connection?: { isp: string };
}

type IpInfo = Partial<GeoInfo> & { ip: string };
type Method = "encrypt" | "decrypt";

const Spinner = () => (
  <div
    className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
    aria-label="Loading"
  />
);

interface PanelProps {
  title: string;
  inputLabel: string;
  input: string;
  setInput: (v: string) => void;
  actionLabel: string;
  onAction: () => void;
  onClear: () => void;
  outputLabel: string;
  output: string;
  isCopied: boolean;
  onCopy: (text: string) => void;
}

const CipherPanel: React.FC<PanelProps> = ({
  title,
  inputLabel,
  input,
  setInput,
  actionLabel,
  onAction,
  onClear,
  outputLabel,
  output,
  isCopied,
  onCopy,
}) => (
  <div className="w-full rounded-md bg-white p-4 shadow-sm">
    <p className="mb-4 font-bold">{title}</p>

    {/* Floating label textarea */}
    <div className="relative w-full">
      <textarea
        id={`${title}-input`}
        placeholder=" "
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="peer h-40 w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
      <label
        htmlFor={`${title}-input`}
        className="pointer-events-none absolute -top-2.5 left-2 bg-white px-0.5 text-sm text-gray-900 transition-all
                   peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-3 peer-placeholder-shown:text-gray-500
                   peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-gray-900"
      >
        {inputLabel}
      </label>
    </div>

    <div className="my-4 flex w-full items-center justify-center gap-2">
      <button
        type="button"
        onClick={onAction}
        className="rounded-md bg-gradient-to-r from-[#2FB8E4] to-[#1B71FF] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 active:opacity-80"
      >
        {actionLabel}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md border border-[#1B71FF] px-4 py-2 text-sm font-medium text-[#1B71FF] transition hover:bg-blue-50"
      >
        Clear
      </button>
    </div>

    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <p>{outputLabel}</p>
        <button
          type="button"
          aria-label="Copy to clipboard"
          disabled={!output}
          onClick={() => output && onCopy(output)}
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LuCopy className={isCopied ? "text-green-600" : "text-gray-700"} />
        </button>
      </div>
      <textarea
        value={output}
        readOnly
        className="min-h-40 w-full resize-none rounded-md border border-gray-300 bg-gray-50 p-3 text-sm outline-none"
      />
    </div>
  </div>
);

const Landing: React.FC = () => {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptionStatus, setEncryptionStatus] =
    useState<EncryptionStatus>("pending");
  const [method, setMethod] = useState<Method | "">("");
  const [cipherKey, setCipherKey] = useState("");
  const [contentVisible, setContentVisible] = useState(false);

  const [textToEncrypt, setTextToEncrypt] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [textToDecrypt, setTextToDecrypt] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const { toast, toaster } = useToaster();
  const isMobile = useIsMobile();

  // Prevents double-initialisation (React Strict Mode, breakpoint flips)
  const initialized = useRef(false);

  // Fade transition when switching between encrypt/decrypt
  useEffect(() => {
    if (!method) return;

    setContentVisible(false);
    const timer = setTimeout(() => setContentVisible(true), 300);
    return () => clearTimeout(timer);
  }, [method]);

  useEffect(() => {
    if (!isMobile || initialized.current) return;
    initialized.current = true;

    const initializeApp = async () => {
      try {
        // ALWAYS record the visit, including app version 2
        await axios
          .post("/api/record-visit")
          .catch((error) => console.error("Failed to record visit:", error));

        // Version 2 bypasses encryption verification
        if (process.env.NEXT_PUBLIC_APP_VERSION === "2") {
          setIsEncrypted(true);
          setEncryptionStatus("verified");
          setLoading(false);
          // setAppReady(true);
          return;
        }

        // The server resolves the IP itself; geo lookup runs in parallel for display.
        const [encryptionResult, geoResult] = await Promise.allSettled([
          axios.get<CheckEncryptionResponse>("/api/check-encryption"),
          axios.get<GeoInfo>("https://ipwho.is/"),
        ]);

        if (geoResult.status === "fulfilled" && geoResult.value.data?.ip) {
          setIpInfo(geoResult.value.data);
        } else if (geoResult.status === "rejected") {
          console.warn("Location lookup failed:", geoResult.reason);
        }

        if (encryptionResult.status === "fulfilled") {
          const data = encryptionResult.value.data;
          setIsEncrypted(data.encrypted);
          if (data.encryptionStatus) setEncryptionStatus(data.encryptionStatus);

          // Fall back to the server-seen IP if the geo lookup failed
          if (data.ip) {
            setIpInfo((prev) => prev ?? { ip: data.ip as string });
          }
        } else {
          console.error("Encryption check failed:", encryptionResult.reason);
          setIsEncrypted(false);
          toast({
            title: "Encryption Check Failed",
            description: "Could not verify if your connection is encrypted",
            type: "warning",
          });
        }
      } catch (error) {
        console.error("App initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [isMobile, toast]);

  const recordEncryptionActivity = async (action: Method) => {
    if (!cipherKey.trim()) {
      console.warn("Missing cipher key");
      return;
    }

    try {
      await axios.post("/api/record-encryption", { key: cipherKey, action });
    } catch (error) {
      console.error("Failed to record encryption activity:", error);
    }
  };

  const validate = (text: string, label: string): boolean => {
    if (!text) {
      toast({ title: "Error", description: `Please enter text to ${label}`, type: "error" });
      return false;
    }
    if (!cipherKey) {
      toast({ title: "Error", description: "Please enter a cipher key", type: "error" });
      return false;
    }
    return true;
  };

  const handleEncrypt = async () => {
    if (!validate(textToEncrypt, "encrypt")) return;
    setEncryptedText(encryptText(textToEncrypt, cipherKey));
    await recordEncryptionActivity("encrypt");
  };

  const handleDecrypt = async () => {
    if (!validate(textToDecrypt, "decrypt")) return;
    setDecryptedText(decryptText(textToDecrypt, cipherKey));
    await recordEncryptionActivity("decrypt");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({ title: "Copied!", description: "Text copied to clipboard", type: "success" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text: ", err);
      toast({ title: "Error", description: "Failed to copy text", type: "error" });
    }
  };

  // Not resolved yet (first client render)
  if (isMobile === undefined) return null;

  // Hide Landing on desktop
  if (!isMobile) return <MobileWarning />;

  if (loading) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <main className="app flex h-dvh w-dvw flex-col items-start gap-2 overflow-y-auto p-4">
        <div className="flex w-full items-center">
          <Link href="/">
            <img src="/logoFull.svg" alt="logo" className="w-20" />
          </Link>
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          {/* Device status badge */}
          <div className="flex items-center gap-2">
            <p>Device Status:</p>
            <span
              className={`flex items-center rounded-full px-2.5 py-0.5 text-sm ${
                isEncrypted ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
              }`}
            >
              <span
                className={`mr-1.5 h-2 w-2 rounded-full ${
                  isEncrypted ? "bg-green-600" : "bg-red-600"
                }`}
              />
              {isEncrypted ? "Encrypted" : "Unencrypted"}
            </span>
          </div>

          {ipInfo && (
            <div className="mt-4 w-full rounded-md bg-black/70 p-3 text-sm text-white">
              <p>IP: {ipInfo.ip}</p>
              {ipInfo.city && (
                <>
                  <p>
                    Location: {ipInfo.city}, {ipInfo.region}, {ipInfo.country}
                  </p>
                  {ipInfo.connection && <p>ISP: {ipInfo.connection.isp}</p>}
                </>
              )}
            </div>
          )}

          {!isEncrypted && (
            <div className="mt-4 flex w-full flex-col items-start gap-2">
              <hr className="w-full border-t border-black/10" />

              {encryptionStatus === "pending" && (
                <div className="w-full rounded-md bg-[#FFFBEA] p-4">
                  <p className="font-bold text-[#B7791F]">Pending Verification</p>
                  <p className="text-sm text-gray-600">
                    Your encryption request is being reviewed.
                  </p>
                </div>
              )}

              <a
                href="https://device-encryption.vercel.app/"
                className="block w-full rounded bg-blue-600 px-4 py-2.5 text-center text-white transition hover:bg-blue-700"
              >
                Go To Encryptor
              </a>
            </div>
          )}

          {isEncrypted && (
            <>
              <div className="mt-4 w-full">
                <label htmlFor="cipher-key" className="mb-1.5 block text-sm font-medium">
                  Cipher Key: <span className="text-red-500">*</span>
                </label>
                <input
                  id="cipher-key"
                  required
                  placeholder="Enter cipher here"
                  value={cipherKey}
                  onChange={(e) => setCipherKey(e.target.value)}
                  className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="mt-2 w-full">
                <label htmlFor="method" className="mb-1.5 block text-sm font-medium">
                  Type:
                </label>
                <div className="relative">
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as Method | "")}
                    className={`w-full appearance-none rounded-md bg-gray-100 px-3 py-2 pr-9 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/40 ${
                      method ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="encrypt">Encrypt</option>
                    <option value="decrypt">Decrypt</option>
                  </select>
                  <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </>
          )}

          {isEncrypted && cipherKey.trim() && method && (
            <div
              className={`mt-3 w-full transition-opacity duration-300 ease-in-out ${
                contentVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {method === "encrypt" && (
                <CipherPanel
                  title="Encryption Panel"
                  inputLabel="Enter text to encrypt"
                  input={textToEncrypt}
                  setInput={setTextToEncrypt}
                  actionLabel="Encrypt"
                  onAction={handleEncrypt}
                  onClear={() => {
                    setTextToEncrypt("");
                    setEncryptedText("");
                  }}
                  outputLabel="Encrypted Text:"
                  output={encryptedText}
                  isCopied={isCopied}
                  onCopy={handleCopy}
                />
              )}

              {method === "decrypt" && (
                <CipherPanel
                  title="Decryption Panel"
                  inputLabel="Enter text to decrypt"
                  input={textToDecrypt}
                  setInput={setTextToDecrypt}
                  actionLabel="Decrypt"
                  onAction={handleDecrypt}
                  onClear={() => {
                    setTextToDecrypt("");
                    setDecryptedText("");
                  }}
                  outputLabel="Decrypted Text:"
                  output={decryptedText}
                  isCopied={isCopied}
                  onCopy={handleCopy}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {toaster}
    </>
  );
};

export default Landing;

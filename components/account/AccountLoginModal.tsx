"use client";

import { useState, useEffect, useRef } from "react";
import { X, RotateCcw, AlertCircle, Loader2 } from "lucide-react";

interface AccountLoginModalProps {
  onSuccess: (userData: { phone: string; fullName: string; token?: string }) => void;
  onClose?: () => void;
}

const IndianFlagIcon = () => (
  <svg className="w-6 h-4 shrink-0 rounded-[2px] shadow-xs" viewBox="0 0 900 600">
    <rect width="900" height="200" fill="#FF9933" />
    <rect y="200" width="900" height="200" fill="#FFFFFF" />
    <rect y="400" width="900" height="200" fill="#138808" />
    <circle cx="450" cy="300" r="75" fill="none" stroke="#000080" strokeWidth="12" />
    <circle cx="450" cy="300" r="16" fill="#000080" />
    {[...Array(24)].map((_, i) => (
      <line
        key={i}
        x1="450"
        y1="300"
        x2={450 + 75 * Math.cos((i * 15 * Math.PI) / 180)}
        y2={300 + 75 * Math.sin((i * 15 * Math.PI) / 180)}
        stroke="#000080"
        strokeWidth="4"
      />
    ))}
  </svg>
);

const PhoneOutlineIcon = ({ className = "w-5 h-5 text-slate-400" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
  </svg>
);

export default function AccountLoginModal({ onSuccess, onClose }: AccountLoginModalProps) {
  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string>("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.length > 10) {
      digits = digits.slice(-10);
    }
    setPhone(digits);
    if (error) setError(null);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDevOtpNotice(null);

    try {
      const res = await fetch("/aquaforceforautocare/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || "Customer",
          phone,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Unable to connect to verification server. Please try again.");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setVerificationToken(data.token || "");
      if (data.devOtp) {
        setDevOtpNotice(data.devOtp);
      }

      setStep("OTP");
      setResendTimer(30);
      setCanResend(false);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (error) setError(null);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      handleVerifyCode(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    if (pasted.length === 6) {
      handleVerifyCode(pasted);
    } else {
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/aquaforceforautocare/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: code,
          fullName: fullName.trim() || "Customer",
          token: verificationToken,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Unable to verify code. Please try again.");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect OTP. Please check and try again.");
      }

      onSuccess({
        fullName: fullName.trim() || data.verifiedUser?.fullName || "Customer",
        phone,
        token: verificationToken,
      });
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[460px] bg-white rounded-2xl sm:rounded-[20px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden text-[#0f172a] font-open-sans border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Close Button (Exact Light Grey Circle in Top Right) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      )}

      {/* Modal Header & Title */}
      <div className="w-full px-5 xs:px-6 sm:px-7 pt-6 sm:pt-7 pb-3">
        <h2 className="text-[20px] sm:text-[24px] font-bold font-montserrat text-[#0f172a] tracking-tight leading-snug">
          {step === "DETAILS" ? "Access Your Account" : "Enter Verification Code"}
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#64748b] font-open-sans mt-0.5">
          {step === "DETAILS"
            ? "Enter your details to view orders, express tracking & warranty"
            : `OTP sent to +91 ${phone ? `${phone.slice(0, 5)} ${phone.slice(5)}` : "98765 43210"}`}
        </p>
      </div>

      {/* Form Body */}
      <div className="w-full px-5 xs:px-6 sm:px-7 pb-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2 font-open-sans">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {devOtpNotice && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between font-open-sans flex-wrap gap-1.5">
            <span>
              Sandbox OTP: <strong className="text-sm font-montserrat font-bold tracking-wider text-amber-950">{devOtpNotice}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const digits = devOtpNotice.split("");
                setOtp(digits);
                handleVerifyCode(devOtpNotice);
              }}
              className="text-[11px] font-bold text-[#005da6] underline hover:text-[#004780] font-montserrat cursor-pointer"
            >
              Auto-fill & Submit
            </button>
          </div>
        )}

        {step === "DETAILS" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-[14px] font-semibold text-[#1e293b] mb-2 font-open-sans">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Ramesh Kumar"
                className="w-full h-12 px-4 bg-white border border-[#e2e8f0] focus:border-[#005da6] rounded-[10px] text-[15px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-all font-open-sans"
                autoFocus
              />
            </div>

            {/* Mobile Number Input with Indian Flag and Phone Icon */}
            <div>
              <label className="block text-[14px] font-semibold text-[#1e293b] mb-2 font-open-sans">
                Mobile Number
              </label>
              <div className="relative flex items-center w-full h-12 bg-white border border-[#e2e8f0] focus-within:border-[#005da6] rounded-[10px] px-3.5 transition-all">
                {/* Left: Flag + +91 */}
                <div className="flex items-center gap-2 pr-2.5 border-r border-slate-200 select-none">
                  <IndianFlagIcon />
                  <span className="text-[14px] font-medium text-[#0f172a] tracking-wide font-open-sans">+91</span>
                </div>

                {/* Input field */}
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full h-full pl-3 pr-2 bg-transparent text-[15px] text-[#0f172a] font-medium tracking-wide placeholder:text-[#94a3b8] outline-none font-open-sans"
                />

                {/* Right: Phone outline icon */}
                <PhoneOutlineIcon className="w-5 h-5 text-[#94a3b8] shrink-0 pointer-events-none" />
              </div>

              <p className="text-[13px] text-[#94a3b8] mt-2 font-open-sans">
                We will send a 6-digit OTP to access your account securely.
              </p>
            </div>

            {/* Bottom Border & Action Button */}
            <div className="pt-4 pb-2 mt-4 border-t border-[#f1f5f9] -mx-5 xs:-mx-6 sm:-mx-7 px-5 xs:px-6 sm:px-7">
              <button
                type="submit"
                disabled={isLoading || phone.length !== 10 || fullName.trim().length < 2}
                className="w-full h-12 bg-[#005da6] hover:bg-[#004d8c] active:bg-[#003d73] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold font-montserrat text-[13px] sm:text-[14px] tracking-wider uppercase rounded-[10px] shadow-[0_4px_14px_rgba(0,93,166,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>SENDING OTP...</span>
                  </>
                ) : (
                  <span>SEND OTP TO LOGIN</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[14px] font-semibold text-[#1e293b] font-open-sans">
                  Enter 6-digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("DETAILS");
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                  }}
                  className="text-[12px] font-semibold text-[#005da6] hover:underline font-open-sans cursor-pointer"
                >
                  Change Number
                </button>
              </div>

              {/* 6 Individual OTP boxes with responsive flex widths */}
              <div className="flex items-center justify-between gap-1.5 xs:gap-2 sm:gap-2.5 pt-0.5 w-full">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    placeholder={digit ? "" : "•"}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="flex-1 min-w-0 aspect-square max-w-[50px] sm:max-w-[54px] h-11 xs:h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-montserrat border border-[#e2e8f0] focus:border-[#005da6] rounded-[10px] sm:rounded-[12px] outline-none transition-all bg-white text-[#0f172a] placeholder:text-slate-300 placeholder:text-xl sm:placeholder:text-2xl shadow-2xs focus:ring-2 focus:ring-[#005da6]/20"
                  />
                ))}
              </div>
            </div>

            {/* Resend Row with 00:30 Timer on the right */}
            <div className="flex items-center justify-between text-[13px] text-[#64748b] font-open-sans pt-1">
              <div>
                <span>Didn&apos;t receive the code? </span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="text-[#005da6] font-bold hover:underline cursor-pointer inline-flex items-center gap-1 font-montserrat text-xs uppercase"
                  >
                    <RotateCcw size={11} />
                    <span>Resend OTP</span>
                  </button>
                ) : (
                  <span className="text-[#005da6] font-bold select-none font-montserrat text-xs uppercase">
                    Resend OTP
                  </span>
                )}
              </div>

              <span className="font-montserrat text-[13px] text-[#64748b] font-medium tracking-wider select-none">
                00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
              </span>
            </div>

            {/* Bottom Border & VERIFY OTP Button */}
            <div className="pt-4 pb-2 mt-4 border-t border-[#f1f5f9] -mx-5 xs:-mx-6 sm:-mx-7 px-5 xs:px-6 sm:px-7">
              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={isLoading || otp.some((d) => d === "")}
                className="w-full h-12 bg-[#005da6] hover:bg-[#004d8c] active:bg-[#003d73] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold font-montserrat text-[13px] sm:text-[14px] tracking-wider uppercase rounded-[10px] shadow-[0_4px_14px_rgba(0,93,166,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>VERIFYING...</span>
                  </>
                ) : (
                  <span>VERIFY OTP</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

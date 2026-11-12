export const focusRing =
  "focus-within:border-[#BD9655] focus-within:ring-[3px] focus-within:ring-[#BD9655]/25";
export const focusOutline =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#BD9655]";

export const inputCls =
  "w-full min-h-[45px] rounded border border-[#cfd2cf] bg-white px-[13px] py-[11px] text-sm text-[#263746] outline-none transition-colors placeholder:text-[#8e9395] focus:border-[#BD9655] focus:ring-[3px] focus:ring-[#BD9655]/20 aria-[invalid=true]:border-[#c4574a] disabled:cursor-not-allowed disabled:bg-[#f4f4f1] disabled:text-[#8e9395] motion-reduce:transition-none";
export const textareaCls = `${inputCls} min-h-[100px] resize-y leading-relaxed`;
export const fileInputCls = `${inputCls} p-[9px]`;

export const optionBase = `flex min-h-[42px] cursor-pointer items-center gap-2 rounded border px-[13px] py-[9px] text-[13px] transition-colors motion-reduce:transition-none ${focusRing}`;
export const optionOn = "border-[#BD9655] bg-[#fbf8f2] text-[#002950]";
export const optionOff = "border-[#d3d5d1] text-[#4d565d]";
export const optionDisabled = "!cursor-not-allowed opacity-50";

export const btnBase = `inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-3 rounded px-4 text-[13px] font-bold no-underline transition-colors sm:min-h-[46px] sm:px-[21px] motion-reduce:transition-none ${focusOutline}`;
export const btnPrimary = `${btnBase} border border-[#002950] bg-[#002950] text-white hover:bg-[#06406f] disabled:cursor-not-allowed disabled:opacity-60`;
export const btnSecondary = `${btnBase} border border-[#d6d8d6] bg-white text-[#35424d] hover:bg-[#f7f7f5]`;
export const linkBtn = `cursor-pointer border-0 bg-transparent font-semibold text-[#8b5d27] underline ${focusOutline}`;

export const twoCol = "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[14px]";
export const hintCls = "-mt-[3px] mb-px text-xs leading-normal text-[#6f757a]";
export const eyebrowCls = "text-[11px] font-bold tracking-[1.7px]";

// Font now inherits from your layout instead of hard-coded Arial.
export const pageCls =
  "min-h-screen bg-[#F7F7F5] px-[14px] pb-[25px] text-[#202a34] sm:px-6 sm:pb-10";
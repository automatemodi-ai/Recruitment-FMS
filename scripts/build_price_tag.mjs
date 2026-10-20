import fs from 'fs';
import path from 'path';

// Destination directories
const targets = [
  'C:/Softwares/Modi-furniture/frontend/src/components/showroom-ims',
  'C:/Users/ok/Desktop/Modi-furniture/frontend/src/components/showroom-ims',
];

// Helper to ensure dirs exist
targets.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. PriceTagCard.tsx
const priceTagCardCode = `"use client";

import React, { useRef } from "react";
import { QrCodeSvg } from "./QrCodeSvg";
import { ImageIcon } from "lucide-react";

export interface PriceTagData {
  id: string;
  name: string;             // e.g. "MIRA"
  subtitle: string;         // e.g. "(REVOLVING)"
  code: string;             // e.g. "Code- MC-MRA-HB-BK"
  website: string;          // e.g. "www.modifurniture.com"
  price: number;            // e.g. 14500 (Base Price in INR)
  gstPercent: number;       // e.g. 18 (%)
  gstAmount?: number;       // Auto-calculated or manual override
  netPrice?: number;        // Auto-calculated or manual override
  tableSize?: string;       // e.g. "Size: (W) x (D) x (H)" or "1200 x 600 x 750 mm"
  showTableSize?: boolean;  // toggle table specs
  showColours?: boolean;    // toggle colour checkboxes
  colours?: string[];       // colour names / codes
  qrCodeUrl?: string;       // QR link (default: https://www.modifurniture.com)
  imageUrl?: string;        // Product photo URL or Base64 data
  imageScale?: number;      // 50 - 200%
  imageOffsetY?: number;    // -50px to 50px
  imageOffsetX?: number;    // -50px to 50px
  imageFit?: "contain" | "cover";
  format?: "card" | "standee"; // "card" = Image 2 front face; "standee" = Image 1 folding tent
  copies?: number;
}

export function calculatePriceTag(tag: Partial<PriceTagData>) {
  const price = Number(tag.price) || 0;
  const gstPercent = tag.gstPercent !== undefined ? Number(tag.gstPercent) : 18;
  const calculatedGst = Math.round((price * gstPercent) / 100);
  const calculatedNet = price + calculatedGst;

  const gstAmount = tag.gstAmount !== undefined && !isNaN(Number(tag.gstAmount))
    ? Number(tag.gstAmount)
    : calculatedGst;

  const netPrice = tag.netPrice !== undefined && !isNaN(Number(tag.netPrice))
    ? Number(tag.netPrice)
    : price + gstAmount;

  return {
    price,
    gstPercent,
    gstAmount,
    netPrice,
  };
}

export function formatINR(val: number): string {
  if (isNaN(val)) return "0/-";
  return val.toLocaleString("en-IN") + "/-";
}

interface PriceTagCardProps {
  tag: PriceTagData;
  mode?: "card" | "standee" | "horizontal";
  showCutLines?: boolean;
  scale?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onImageUpload?: (file: File) => void;
  className?: string;
  isPrint?: boolean;
}

export function PriceTagCard({
  tag,
  mode = "card",
  showCutLines = true,
  scale = 1,
  isSelected = false,
  onClick,
  onImageUpload,
  className = "",
  isPrint = false,
}: PriceTagCardProps) {
  const calc = calculatePriceTag(tag);
  const actualFormat = mode === "standee" || tag.format === "standee" ? "standee" : "card";
  const isHorizontal = mode === "horizontal";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  // Modern Geometric Triangles Pattern for Standee Inverted Header (Panel 1 from Image 1)
  const geometricSvgPattern = (
    <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="modi-geo-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 0 L14 14 L0 28 Z" fill="#e11d48" opacity="0.18" />
          <path d="M28 0 L14 14 L28 28 Z" fill="#dc2626" opacity="0.22" />
          <path d="M0 0 L28 0 L14 14 Z" fill="#f43f5e" opacity="0.15" />
          <path d="M0 28 L28 28 L14 14 Z" fill="#b91c1c" opacity="0.25" />
          <polygon points="7,7 21,7 14,21" fill="#fb7185" opacity="0.12" />
          <polygon points="14,0 28,14 14,28 0,14" fill="none" stroke="#e11d48" strokeWidth="0.5" opacity="0.3" />
        </pattern>
        <mask id="geo-mask">
          <linearGradient id="geo-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <rect width="100%" height="100%" fill="url(#geo-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#modi-geo-pattern)" mask="url(#geo-mask)" />
    </svg>
  );

  // Front Face Section (Exact Image 1 & Image 2 design)
  const renderFrontFace = () => (
    <div className="flex flex-col flex-1 bg-white relative overflow-hidden select-none">
      {/* 1. Header Row */}
      <div className="px-2 pt-1.5 pb-1 flex items-start justify-between gap-1">
        {/* Left: Product Name & Model Type */}
        <div className="flex flex-col min-w-0 pr-1">
          <h2
            className="text-[#DA2128] font-black uppercase tracking-tight leading-none text-left truncate"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "13.5pt", fontWeight: 900 }}
          >
            {tag.name || "NAME"}
          </h2>
          <span
            className="text-slate-900 font-bold leading-tight mt-0.5 text-left truncate"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "7.5pt", fontWeight: 700 }}
          >
            {tag.subtitle || "(REVOLVING)"}
          </span>
        </div>

        {/* Right: Red Website Pill Badge & Item Code */}
        <div className="flex flex-col items-end shrink-0 pl-1">
          <span
            className="bg-[#DA2128] text-white rounded-full font-bold px-2 py-0.5 leading-none inline-flex items-center justify-center whitespace-nowrap shadow-xs"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "6.5pt", fontWeight: 700 }}
          >
            {tag.website || "www.modifurniture.com"}
          </span>
          <span
            className="text-slate-900 font-bold leading-tight mt-1 text-right whitespace-nowrap"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "7pt", fontWeight: 700 }}
          >
            {tag.code ? (tag.code.startsWith("Code-") ? tag.code : "Code- " + tag.code) : "Code- MC-MRA-HB-BK"}
          </span>
        </div>
      </div>

      {/* 2. Middle Product Image Area */}
      <div className="flex-1 min-h-[110px] max-h-[145px] relative flex items-center justify-center px-2 py-1 overflow-hidden bg-white">
        {tag.imageUrl ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: "scale(" + ((tag.imageScale || 100) / 100) + ") translate(" + (tag.imageOffsetX || 0) + "px, " + (tag.imageOffsetY || 0) + "px)",
              transition: isPrint ? "none" : "transform 0.15s ease",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tag.imageUrl}
              alt={tag.name || "Product"}
              className="max-h-[135px] max-w-full object-contain pointer-events-none drop-shadow-xs"
              loading="eager"
            />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-slate-300 hover:text-[#DA2128] hover:bg-red-50/50 rounded-lg p-3 transition-colors cursor-pointer border border-dashed border-slate-200 w-full h-[115px]"
          >
            <ImageIcon className="w-8 h-8 stroke-1 text-slate-300" />
            <span
              className="text-[9px] font-bold mt-1 text-slate-400"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Upload Product Photo
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Optional Table Specifications Tag (Image 1 feature) */}
        {tag.showTableSize && (
          <div
            className="absolute right-2 bottom-1.5 text-right font-bold text-slate-800 leading-tight"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "6.5pt" }}
          >
            <span className="text-[#DA2128] mr-0.5">◀</span> Table:
            <br />
            <span className="text-[5.5pt] text-slate-600 font-semibold">
              {tag.tableSize || "Size: (W) x (D) x (H)"}
            </span>
          </div>
        )}

        {/* Optional Colours Swatches (Image 1 feature) */}
        {tag.showColours && (
          <div
            className="absolute left-2 bottom-1.5 flex items-center gap-1 font-bold text-slate-800 leading-tight"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "6.5pt" }}
          >
            <span>Colours :</span>
            <span className="w-2.5 h-2.5 border border-slate-400 inline-block bg-slate-900 rounded-2xs" />
            <span className="w-2.5 h-2.5 border border-slate-400 inline-block bg-slate-400 rounded-2xs" />
          </div>
        )}
      </div>

      {/* 3. Bottom Red Pricing Block (Modi Furniture Brand Bar) */}
      <div
        className="bg-[#DA2128] text-white px-2.5 py-1.5 flex flex-col justify-between shrink-0"
        style={{ minHeight: "88px" }}
      >
        {/* Pricing rows */}
        <div className="flex flex-col items-center justify-center w-full">
          <div
            className="w-full flex items-center justify-between text-white font-bold leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "8pt", fontWeight: 700 }}
          >
            <span className="pl-3">Price ₹</span>
            <span className="pr-3">{formatINR(calc.price)}</span>
          </div>
          <div
            className="w-full flex items-center justify-between text-white font-bold leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "8pt", fontWeight: 700 }}
          >
            <span className="pl-3">GST {calc.gstPercent}% ₹</span>
            <span className="pr-3">{formatINR(calc.gstAmount)}</span>
          </div>

          {/* Thin White Divider Line */}
          <div className="w-[75%] border-b border-white/80 my-0.5" />

          <div
            className="w-full flex items-center justify-between text-white font-black leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "9pt", fontWeight: 900 }}
          >
            <span className="pl-3">Net Price ₹</span>
            <span className="pr-3">{formatINR(calc.netPrice)}</span>
          </div>
        </div>

        {/* Brand Logo & QR Code Row */}
        <div className="flex items-end justify-between mt-0.5 pt-0.5">
          {/* Brand Logo: MODI FURNITURE ■ */}
          <div className="flex flex-col leading-none pb-0.5">
            <span
              className="text-white font-black tracking-tight leading-none"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "14pt", fontWeight: 900 }}
            >
              MODI
            </span>
            <span
              className="text-white font-extrabold tracking-widest leading-none mt-0.5 flex items-center gap-0.5"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "6pt", fontWeight: 800 }}
            >
              FURNITURE<span className="w-1 h-1 bg-white inline-block ml-0.5" />
            </span>
          </div>

          {/* QR Code in Clean White Square */}
          <div className="bg-white p-0.5 rounded-xs shadow-xs shrink-0 flex items-center justify-center">
            <QrCodeSvg
              value={tag.qrCodeUrl || "https://www.modifurniture.com?sku=" + encodeURIComponent(tag.code || tag.name)}
              size={34}
              className="w-[34px] h-[34px]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Standee Mode (Image 1 Full Standee with Fold Flaps)
  if (actualFormat === "standee") {
    return (
      <div
        onClick={onClick}
        className={"relative bg-white text-slate-900 transition-shadow " +
          (showCutLines ? "border border-dashed border-slate-700 " : "") +
          (isSelected ? "ring-2 ring-[#DA2128] ring-offset-2 shadow-lg " : "shadow-md ") + className}
        style={{
          width: "235px",
          minHeight: "640px",
          fontFamily: "'Lato', sans-serif",
          transform: scale !== 1 ? "scale(" + scale + ")" : undefined,
          transformOrigin: "top left",
        }}
      >
        {/* Panel 0: Top Edge Flap paste inside (Upside Down) */}
        <div
          className="h-[40px] border-b border-dashed border-slate-400 bg-slate-50 flex items-center justify-center relative"
          style={{ transform: "rotate(180deg)" }}
        >
          <span
            className="text-slate-600 font-semibold tracking-wider"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "9pt" }}
          >
            paste inside
          </span>
        </div>

        {/* Panel 1: Inverted Header with Geometric Pattern & Upside-down MODI FURNITURE */}
        <div
          className="h-[150px] relative border-b border-dashed border-slate-400 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-t from-red-50/80 via-white to-red-100/50"
          style={{ transform: "rotate(180deg)" }}
        >
          {geometricSvgPattern}
          <div className="relative z-10 flex flex-col items-center justify-center text-center leading-none">
            <span
              className="text-[#DA2128] font-black tracking-tighter leading-none"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "24pt", fontWeight: 900 }}
            >
              MODI
            </span>
            <span
              className="text-slate-900 font-extrabold tracking-[0.22em] leading-none mt-1 flex items-center justify-center gap-1"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "10pt", fontWeight: 800 }}
            >
              <span className="w-2 h-2 bg-[#DA2128] inline-block" />FURNITURE
            </span>
          </div>
        </div>

        {/* Panel 2: Front Face (The Main Price Tag) */}
        <div className="min-h-[330px] flex flex-col border-b border-dashed border-slate-400">
          {renderFrontFace()}
        </div>

        {/* Panel 3: Bottom Fold Flap 1 */}
        <div className="h-[44px] border-b border-dashed border-slate-400 bg-slate-50/60 flex items-center justify-center text-slate-300 text-[8pt] font-mono">
          [ Fold Line 1 ]
        </div>

        {/* Panel 4: Bottom Fold Flap 2 */}
        <div className="h-[44px] bg-slate-100/40 flex items-center justify-center text-slate-300 text-[8pt] font-mono">
          [ Fold Base Tab ]
        </div>
      </div>
    );
  }

  // Standard Card Mode (Image 2 Style - Compact Showroom Price Tag)
  return (
    <div
      onClick={onClick}
      className={"price-tag-card relative bg-white text-slate-900 flex flex-col transition-all overflow-hidden " +
        (showCutLines ? "border border-dashed border-slate-400 " : "") +
        (isSelected ? "ring-2 ring-[#DA2128] ring-offset-2 shadow-xl " : "shadow-md ") +
        (isHorizontal ? "horizontal-card " : "") + className}
      style={{
        width: "235px",
        height: "330px",
        fontFamily: "'Lato', sans-serif",
        transform: scale !== 1 ? "scale(" + scale + ")" : undefined,
        transformOrigin: "top left",
      }}
    >
      {renderFrontFace()}
    </div>
  );
}
`;

// Write PriceTagCard.tsx
targets.forEach(dir => {
  fs.writeFileSync(path.join(dir, 'PriceTagCard.tsx'), priceTagCardCode, 'utf8');
});

console.log('PriceTagCard.tsx updated with SVG mask.');

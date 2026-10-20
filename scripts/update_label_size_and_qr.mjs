import fs from 'fs';
import path from 'path';

const targets = [
  'C:/Softwares/Modi-furniture/frontend/src/components/showroom-ims',
  'C:/Users/ok/Desktop/Modi-furniture/frontend/src/components/showroom-ims',
];

targets.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Updated PriceTagCard.tsx with exact 6.896 cm x 10.7 cm sizing and user's QR
const priceTagCardCode = `"use client";

import React, { useRef } from "react";
import { QrCodeSvg } from "./QrCodeSvg";
import { ImageIcon } from "lucide-react";

export interface PriceTagData {
  id: string;
  name: string;             // e.g. "BANO" or "MIRA"
  subtitle: string;         // e.g. "(CAFE CHAIR)" or "(REVOLVING)"
  code: string;             // e.g. "Code- MC-BNO-A-WT"
  website: string;          // e.g. "www.modifurniture.com"
  price: number;            // e.g. 2400 (Base Price in INR)
  gstPercent: number;       // e.g. 18 (%)
  gstAmount?: number;       // Auto-calculated or manual override
  netPrice?: number;        // Auto-calculated or manual override
  tableSize?: string;       // e.g. "Size: (W) x (D) x (H)"
  showTableSize?: boolean;  // toggle table specs
  showColours?: boolean;    // toggle colour checkboxes
  colours?: string[];       // colour names / codes
  qrCodeUrl?: string;       // Dynamic QR link
  qrCodeImageUrl?: string;  // Static QR Image (defaults to user's uploaded QR /templates/modi-qr.png)
  imageUrl?: string;        // Product photo URL or Base64 data
  imageScale?: number;      // 50 - 200%
  imageOffsetY?: number;    // -50px to 50px
  imageOffsetX?: number;    // -50px to 50px
  imageFit?: "contain" | "cover";
  format?: "card" | "standee"; // "card" = Standard label; "standee" = folding tent
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

  // Modern Geometric Triangles Pattern for Standee Inverted Header
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

  // Front Face Section (Exact CorelDRAW 6.896 cm x 10.7 cm Proportion)
  const renderFrontFace = () => (
    <div className="flex flex-col flex-1 bg-white relative overflow-hidden select-none">
      {/* 1. Header Row */}
      <div className="px-2.5 pt-2 pb-1 flex items-start justify-between gap-1">
        {/* Left: Product Name & Subtitle */}
        <div className="flex flex-col min-w-0 pr-1">
          <h2
            className="text-[#DA2128] font-black uppercase tracking-tight leading-none text-left truncate"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "14pt", fontWeight: 900 }}
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
            className="bg-[#DA2128] text-white rounded-full font-bold px-2.5 py-0.5 leading-none inline-flex items-center justify-center whitespace-nowrap shadow-xs"
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
      <div className="flex-1 min-h-[140px] max-h-[185px] relative flex items-center justify-center px-2 py-1.5 overflow-hidden bg-white">
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
              className="max-h-[175px] max-w-full object-contain pointer-events-none drop-shadow-xs"
              loading="eager"
            />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-slate-300 hover:text-[#DA2128] hover:bg-red-50/50 rounded-lg p-3 transition-colors cursor-pointer border border-dashed border-slate-200 w-full h-[140px]"
          >
            <ImageIcon className="w-9 h-9 stroke-1 text-slate-300" />
            <span
              className="text-[9.5px] font-bold mt-1 text-slate-400"
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

        {/* Optional Table Specifications Tag */}
        {tag.showTableSize && (
          <div
            className="absolute right-2 bottom-1.5 text-right font-bold text-slate-800 leading-tight"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "7pt" }}
          >
            <span className="text-[#DA2128] mr-0.5">◀</span> Table:
            <br />
            <span className="text-[6pt] text-slate-600 font-semibold">
              {tag.tableSize || "Size: (W) x (D) x (H)"}
            </span>
          </div>
        )}

        {/* Optional Colours Swatches */}
        {tag.showColours && (
          <div
            className="absolute left-2 bottom-1.5 flex items-center gap-1 font-bold text-slate-800 leading-tight"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "7pt" }}
          >
            <span>Colours :</span>
            <span className="w-3 h-3 border border-slate-400 inline-block bg-slate-900 rounded-2xs" />
            <span className="w-3 h-3 border border-slate-400 inline-block bg-slate-400 rounded-2xs" />
          </div>
        )}
      </div>

      {/* 3. Bottom Red Pricing Block (Modi Furniture Brand Bar) */}
      <div
        className="bg-[#DA2128] text-white px-3 py-2 flex flex-col justify-between shrink-0"
        style={{ minHeight: "105px" }}
      >
        {/* Pricing rows */}
        <div className="flex flex-col items-center justify-center w-full">
          <div
            className="w-full flex items-center justify-between text-white font-bold leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "8.5pt", fontWeight: 700 }}
          >
            <span className="pl-4">Price ₹</span>
            <span className="pr-4">{formatINR(calc.price)}</span>
          </div>
          <div
            className="w-full flex items-center justify-between text-white font-bold leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "8.5pt", fontWeight: 700 }}
          >
            <span className="pl-4">GST {calc.gstPercent}% ₹</span>
            <span className="pr-4">{formatINR(calc.gstAmount)}</span>
          </div>

          {/* Thin White Divider Line */}
          <div className="w-[75%] border-b border-white/80 my-1" />

          <div
            className="w-full flex items-center justify-between text-white font-black leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "10pt", fontWeight: 900 }}
          >
            <span className="pl-4">Net Price ₹</span>
            <span className="pr-4">{formatINR(calc.netPrice)}</span>
          </div>
        </div>

        {/* Brand Logo & QR Code Row */}
        <div className="flex items-end justify-between mt-1 pt-0.5">
          {/* Brand Logo: MODI FURNITURE ■ */}
          <div className="flex flex-col leading-none pb-0.5">
            <span
              className="text-white font-black tracking-tight leading-none"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "15pt", fontWeight: 900 }}
            >
              MODI
            </span>
            <span
              className="text-white font-extrabold tracking-widest leading-none mt-0.5 flex items-center gap-0.5"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "6.5pt", fontWeight: 800 }}
            >
              FURNITURE<span className="w-1 h-1 bg-white inline-block ml-0.5" />
            </span>
          </div>

          {/* User's Exact QR Code in Clean White Square */}
          <div className="bg-white p-0.5 rounded-xs shadow-xs shrink-0 flex items-center justify-center">
            {tag.qrCodeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tag.qrCodeImageUrl}
                alt="QR Code"
                className="w-[38px] h-[38px] object-contain"
                loading="eager"
              />
            ) : tag.qrCodeUrl ? (
              <QrCodeSvg
                value={tag.qrCodeUrl}
                size={38}
                className="w-[38px] h-[38px]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/templates/modi-qr.png"
                alt="QR Code"
                className="w-[38px] h-[38px] object-contain"
                loading="eager"
              />
            )}
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
          width: "68.96mm",
          minHeight: "260mm",
          fontFamily: "'Lato', sans-serif",
          transform: scale !== 1 ? "scale(" + scale + ")" : undefined,
          transformOrigin: "top left",
        }}
      >
        {/* Panel 0: Top Edge Flap paste inside (Upside Down) */}
        <div
          className="h-[18mm] border-b border-dashed border-slate-400 bg-slate-50 flex items-center justify-center relative"
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
          className="h-[50mm] relative border-b border-dashed border-slate-400 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-t from-red-50/80 via-white to-red-100/50"
          style={{ transform: "rotate(180deg)" }}
        >
          {geometricSvgPattern}
          <div className="relative z-10 flex flex-col items-center justify-center text-center leading-none">
            <span
              className="text-[#DA2128] font-black tracking-tighter leading-none"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "26pt", fontWeight: 900 }}
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

        {/* Panel 2: Front Face (The Main Price Tag - Exact 107mm height) */}
        <div className="h-[107mm] flex flex-col border-b border-dashed border-slate-400">
          {renderFrontFace()}
        </div>

        {/* Panel 3: Bottom Fold Flap 1 */}
        <div className="h-[16mm] border-b border-dashed border-slate-400 bg-slate-50/60 flex items-center justify-center text-slate-300 text-[8pt] font-mono">
          [ Fold Line 1 ]
        </div>

        {/* Panel 4: Bottom Fold Flap 2 */}
        <div className="h-[16mm] bg-slate-100/40 flex items-center justify-center text-slate-300 text-[8pt] font-mono">
          [ Fold Base Tab ]
        </div>
      </div>
    );
  }

  // Standard Card Mode (Exact CorelDRAW Label Size: 6.896 cm x 10.7 cm)
  return (
    <div
      onClick={onClick}
      className={"price-tag-card relative bg-white text-slate-900 flex flex-col transition-all overflow-hidden " +
        (showCutLines ? "border border-dashed border-slate-400 " : "") +
        (isSelected ? "ring-2 ring-[#DA2128] ring-offset-2 shadow-xl " : "shadow-md ") +
        (isHorizontal ? "horizontal-card " : "") + className}
      style={{
        width: "68.96mm",
        height: "107mm",
        minWidth: "68.96mm",
        minHeight: "107mm",
        fontFamily: "'Lato', sans-serif",
        transform: scale !== 1 ? "scale(" + scale + ")" : undefined,
        transformOrigin: "top left",
        boxSizing: "border-box",
      }}
    >
      {renderFrontFace()}
    </div>
  );
}
`;

// 2. Updated PriceTagSheet.tsx with exact CorelDRAW 6.896 cm x 10.7 cm dimensions
const priceTagSheetCode = `"use client";

import React from "react";
import { PriceTagCard, PriceTagData } from "./PriceTagCard";

export type SheetLayoutType = "5-tag" | "7-tag" | "standee-3" | "grid-6";

interface PriceTagSheetProps {
  tags: PriceTagData[];
  layout?: SheetLayoutType;
  showCutLines?: boolean;
  selectedTagId?: string;
  onSelectTag?: (tag: PriceTagData) => void;
  scale?: number;
  isPrint?: boolean;
}

export function PriceTagSheet({
  tags,
  layout = "5-tag",
  showCutLines = true,
  selectedTagId,
  onSelectTag,
  scale = 1,
  isPrint = false,
}: PriceTagSheetProps) {
  // Expand tags based on copies requested
  const expandedTags: PriceTagData[] = [];
  tags.forEach((t) => {
    const count = Math.max(1, t.copies || 1);
    for (let i = 0; i < count; i++) {
      expandedTags.push(t);
    }
  });

  // Render Layout: 5-tag (Exact 6.896 cm x 10.7 cm size: 3 cards top, 2 cards bottom)
  const render5TagLayout = () => {
    const topRow = expandedTags.slice(0, 3);
    const bottomRow = expandedTags.slice(3, 5);

    return (
      <div
        className="w-full h-full flex flex-col justify-between box-border"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "10mm 1.5mm",
        }}
      >
        {/* Top Row: 3 vertical cards of 68.96mm x 107mm */}
        <div className="flex justify-between items-start w-full">
          {[0, 1, 2].map((idx) => {
            const tag = topRow[idx];
            if (!tag) {
              return (
                <div
                  key={"empty-top-" + idx}
                  className="border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-300 text-xs font-mono select-none"
                  style={{ width: "68.96mm", height: "107mm" }}
                >
                  <span>Slot {idx + 1}</span>
                  <span className="text-[9px] text-slate-400 mt-1">6.896 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-5tag-top-" + idx}
                style={{ width: "68.96mm", height: "107mm" }}
                className="overflow-hidden shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>

        {/* Center decorative cut guideline for cutter */}
        {showCutLines && (
          <div className="w-full flex items-center justify-center py-2 text-slate-400 text-[8pt] font-mono select-none">
            <span className="w-full border-b border-dashed border-slate-300 mr-2" />
            <span className="whitespace-nowrap px-2 bg-white">✂ Cut Guide Line · 6.896 cm × 10.7 cm</span>
            <span className="w-full border-b border-dashed border-slate-300 ml-2" />
          </div>
        )}

        {/* Bottom Row: 2 cards centered */}
        <div className="flex justify-center items-start gap-[16mm] w-full">
          {[0, 1].map((idx) => {
            const tag = bottomRow[idx];
            if (!tag) {
              return (
                <div
                  key={"empty-bot-" + idx}
                  className="border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-300 text-xs font-mono select-none"
                  style={{ width: "68.96mm", height: "107mm" }}
                >
                  <span>Slot {idx + 4}</span>
                  <span className="text-[9px] text-slate-400 mt-1">6.896 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-5tag-bot-" + idx}
                style={{ width: "68.96mm", height: "107mm" }}
                className="overflow-hidden shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Layout: 7-tag (Exact CorelDRAW Match: 3 Top + 1 Rotated + 3 Bottom)
  const render7TagLayout = () => {
    const row1 = expandedTags.slice(0, 3);
    const middleCard = expandedTags[3];
    const row3 = expandedTags.slice(4, 7);

    return (
      <div
        className="w-full h-full flex flex-col justify-between box-border"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "7mm 1.5mm",
        }}
      >
        {/* Row 1: 3 vertical cards (68.96mm x 107mm) */}
        <div className="flex justify-between items-start w-full">
          {[0, 1, 2].map((idx) => {
            const tag = row1[idx];
            if (!tag) {
              return (
                <div
                  key={"r1-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-300 text-xs font-mono"
                  style={{ width: "68.96mm", height: "107mm" }}
                >
                  <span>Slot {idx + 1}</span>
                  <span className="text-[8px] text-slate-400">6.896 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-r1-" + idx}
                style={{ width: "68.96mm", height: "107mm" }}
                className="overflow-hidden shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>

        {/* Row 2 (Middle): 1 horizontal rotated card (107mm wide x 68.96mm tall in CorelDRAW) */}
        <div className="flex justify-center items-center my-[1mm]">
          {middleCard ? (
            <div
              key={middleCard.id + "-mid"}
              className="relative overflow-hidden shrink-0 flex items-center justify-center border border-dashed border-slate-400"
              style={{ width: "107mm", height: "68.96mm" }}
            >
              {/* Rotate 90 degrees counter-clockwise so when cut out it is exactly 6.896 cm x 10.7 cm */}
              <div
                className="origin-center"
                style={{
                  width: "68.96mm",
                  height: "107mm",
                  transform: "rotate(-90deg)",
                }}
              >
                <PriceTagCard
                  tag={middleCard}
                  mode="card"
                  showCutLines={false}
                  isSelected={!isPrint && selectedTagId === middleCard.id}
                  onClick={() => onSelectTag?.(middleCard)}
                  isPrint={isPrint}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div
              className="border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-300 text-xs font-mono"
              style={{ width: "107mm", height: "68.96mm" }}
            >
              <span>Middle Slot 4 (Rotated)</span>
              <span className="text-[8px] text-slate-400">10.7 × 6.896 cm</span>
            </div>
          )}
        </div>

        {/* Row 3: 3 vertical cards (68.96mm x 107mm) */}
        <div className="flex justify-between items-start w-full">
          {[0, 1, 2].map((idx) => {
            const tag = row3[idx];
            if (!tag) {
              return (
                <div
                  key={"r3-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-300 text-xs font-mono"
                  style={{ width: "68.96mm", height: "107mm" }}
                >
                  <span>Slot {idx + 5}</span>
                  <span className="text-[8px] text-slate-400">6.896 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-r3-" + idx}
                style={{ width: "68.96mm", height: "107mm" }}
                className="overflow-hidden shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Layout: Standee Tent Stand (Image 1 full tent cards)
  const renderStandeeLayout = () => {
    const standees = expandedTags.slice(0, 3);

    return (
      <div
        className="w-full h-full flex justify-between items-stretch box-border"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "8mm 1.5mm",
        }}
      >
        {[0, 1, 2].map((idx) => {
          const tag = standees[idx];
          if (!tag) {
            return (
              <div
                key={"standee-empty-" + idx}
                className="border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-300 text-xs font-mono"
                style={{ width: "68.96mm", height: "280mm" }}
              >
                Standee Slot {idx + 1}
              </div>
            );
          }
          return (
            <div
              key={tag.id + "-standee-" + idx}
              style={{ width: "68.96mm", height: "280mm" }}
              className="overflow-hidden shrink-0"
            >
              <PriceTagCard
                tag={tag}
                mode="standee"
                showCutLines={showCutLines}
                isSelected={!isPrint && selectedTagId === tag.id}
                onClick={() => onSelectTag?.(tag)}
                isPrint={isPrint}
                className="w-full h-full"
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Render Layout: Grid 6 (2 rows of 3 vertical cards of 68.96mm x 107mm)
  const renderGrid6Layout = () => {
    const row1 = expandedTags.slice(0, 3);
    const row2 = expandedTags.slice(3, 6);

    return (
      <div
        className="w-full h-full flex flex-col justify-between box-border"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "10mm 1.5mm",
        }}
      >
        <div className="flex justify-between items-start w-full">
          {[0, 1, 2].map((idx) => {
            const tag = row1[idx];
            if (!tag) {
              return (
                <div
                  key={"g6-r1-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-sm flex items-center justify-center text-slate-300 text-xs font-mono"
                  style={{ width: "68.96mm", height: "107mm" }}
                >
                  Slot {idx + 1}
                </div>
              );
            }
            return (
              <div key={tag.id + "-g6-r1-" + idx} style={{ width: "68.96mm", height: "107mm" }} className="overflow-hidden shrink-0">
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>

        {showCutLines && (
          <div className="w-full flex items-center justify-center py-2 text-slate-400 text-[8pt] font-mono select-none">
            <span className="w-full border-b border-dashed border-slate-300 mr-2" />
            <span className="whitespace-nowrap px-2 bg-white">✂ Cut Guide Line</span>
            <span className="w-full border-b border-dashed border-slate-300 ml-2" />
          </div>
        )}

        <div className="flex justify-between items-start w-full">
          {[0, 1, 2].map((idx) => {
            const tag = row2[idx];
            if (!tag) {
              return (
                <div
                  key={"g6-r2-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-sm flex items-center justify-center text-slate-300 text-xs font-mono"
                  style={{ width: "68.96mm", height: "107mm" }}
                >
                  Slot {idx + 4}
                </div>
              );
            }
            return (
              <div key={tag.id + "-g6-r2-" + idx} style={{ width: "68.96mm", height: "107mm" }} className="overflow-hidden shrink-0">
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="a4-print-sheet-wrapper flex justify-center items-center select-none"
      style={{
        transform: scale !== 1 ? "scale(" + scale + ")" : undefined,
        transformOrigin: "top center",
      }}
    >
      <div
        id="modi-price-tag-a4-sheet"
        className={"a4-sheet bg-white relative transition-shadow " +
          (isPrint ? "shadow-none border-0" : "shadow-2xl border border-slate-300")}
        style={{
          width: "210mm",
          height: "297mm",
          minWidth: "210mm",
          minHeight: "297mm",
          fontFamily: "'Lato', sans-serif",
          boxSizing: "border-box",
        }}
      >
        {layout === "5-tag" && render5TagLayout()}
        {layout === "7-tag" && render7TagLayout()}
        {layout === "standee-3" && renderStandeeLayout()}
        {layout === "grid-6" && renderGrid6Layout()}
      </div>
    </div>
  );
}
`;

// 3. Updated PriceTagTab.tsx
const priceTagTabCode = `"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Printer,
  Plus,
  Trash2,
  Copy,
  Upload,
  RefreshCw,
  Search,
  Sparkles,
  Sliders,
  Eye,
  FileSpreadsheet,
  Layers,
  Tag,
  Check,
  ChevronDown,
  CheckSquare,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FolderOpen,
  QrCode as QrIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { request } from "@/api/client";
import { PriceTagCard, PriceTagData, calculatePriceTag, formatINR } from "./PriceTagCard";
import { PriceTagSheet, SheetLayoutType } from "./PriceTagSheet";

// Default preset matching CorelDRAW "Website All in One catalogue.cdr" (6.896 cm x 10.7 cm) with user QR
const DEFAULT_CORELDRAW_TAGS: PriceTagData[] = [
  {
    id: "tag-bano-1",
    name: "BANO",
    subtitle: "(CAFE CHAIR)",
    code: "MC-BNO-A-WT",
    website: "www.modifurniture.com",
    price: 2400,
    gstPercent: 18,
    gstAmount: 432,
    netPrice: 2832,
    imageUrl: "/templates/chairs/bano-wt.png",
    qrCodeImageUrl: "/templates/modi-qr.png",
    imageScale: 100,
    imageOffsetY: 0,
    imageOffsetX: 0,
    showTableSize: false,
    showColours: false,
    format: "card",
    copies: 1,
  },
  {
    id: "tag-bano-2",
    name: "BANO",
    subtitle: "(CAFE CHAIR)",
    code: "MC-BNO-A-GY",
    website: "www.modifurniture.com",
    price: 2400,
    gstPercent: 18,
    gstAmount: 432,
    netPrice: 2832,
    imageUrl: "/templates/chairs/bano-gy.png",
    qrCodeImageUrl: "/templates/modi-qr.png",
    imageScale: 100,
    imageOffsetY: 0,
    imageOffsetX: 0,
    showTableSize: false,
    showColours: false,
    format: "card",
    copies: 1,
  },
  {
    id: "tag-bano-3",
    name: "BANO",
    subtitle: "(CAFE CHAIR)",
    code: "MC-BNO-A-BK",
    website: "www.modifurniture.com",
    price: 2400,
    gstPercent: 18,
    gstAmount: 432,
    netPrice: 2832,
    imageUrl: "/templates/chairs/bano-bk.png",
    qrCodeImageUrl: "/templates/modi-qr.png",
    imageScale: 100,
    imageOffsetY: 0,
    imageOffsetX: 0,
    showTableSize: false,
    showColours: false,
    format: "card",
    copies: 1,
  },
  {
    id: "tag-bano-4",
    name: "BANO",
    subtitle: "(CAFE CHAIR)",
    code: "MC-BNO-WT",
    website: "www.modifurniture.com",
    price: 2200,
    gstPercent: 18,
    gstAmount: 396,
    netPrice: 2596,
    imageUrl: "/templates/chairs/bano-wt.png",
    qrCodeImageUrl: "/templates/modi-qr.png",
    imageScale: 100,
    imageOffsetY: 0,
    imageOffsetX: 0,
    showTableSize: false,
    showColours: false,
    format: "card",
    copies: 1,
  },
  {
    id: "tag-tatva-1",
    name: "TATVA",
    subtitle: "(CAFE CHAIR)",
    code: "MC-TVA-RD",
    website: "www.modifurniture.com",
    price: 2400,
    gstPercent: 18,
    gstAmount: 432,
    netPrice: 2832,
    imageUrl: "/templates/chairs/tatva-rd.png",
    qrCodeImageUrl: "/templates/modi-qr.png",
    imageScale: 100,
    imageOffsetY: 0,
    imageOffsetX: 0,
    showTableSize: false,
    showColours: false,
    format: "card",
    copies: 1,
  },
  {
    id: "tag-tatva-2",
    name: "TATVA",
    subtitle: "(CAFE CHAIR)",
    code: "MC-TVA-GY",
    website: "www.modifurniture.com",
    price: 2400,
    gstPercent: 18,
    gstAmount: 432,
    netPrice: 2832,
    imageUrl: "/templates/chairs/tatva-gn.png",
    qrCodeImageUrl: "/templates/modi-qr.png",
    imageScale: 100,
    imageOffsetY: 0,
    imageOffsetX: 0,
    showTableSize: false,
    showColours: false,
    format: "card",
    copies: 1,
  },
  {
    id: "tag-mira-1",
    name: "MIRA",
    subtitle: "(REVOLVING)",
    code: "MC-MRA-HB-BK",
    website: "www.modifurniture.com",
    price: 14500,
    gstPercent: 18,
    gstAmount: 2610,
    netPrice: 17110,
    imageUrl: "/templates/chairs/mira-bk.png",
    qrCodeImageUrl: "/templates/modi-qr.png",
    imageScale: 100,
    imageOffsetY: 0,
    imageOffsetX: 0,
    showTableSize: false,
    showColours: false,
    format: "card",
    copies: 1,
  },
];

interface PriceTagTabProps {
  refreshKey?: number;
  categories?: { name: string; subcategories: { name: string }[] }[];
  initialProducts?: any[];
}

export function PriceTagTab({
  refreshKey = 0,
  categories = [],
  initialProducts,
}: PriceTagTabProps) {
  // Tags currently loaded in the generator
  const [tags, setTags] = useState<PriceTagData[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, idx) => ({
        id: "prod-" + (p.itemCode || idx) + "-" + Date.now(),
        name: (p.itemName || p.name || "PRODUCT").toUpperCase(),
        subtitle: p.subcategory || p.category || "(REVOLVING)",
        code: p.itemCode || p.sku || "MC-" + idx,
        website: "www.modifurniture.com",
        price: Number(p.unitCostINR || p.price || p.sellingPrice) || 2400,
        gstPercent: 18,
        imageUrl: p.imageUrl || "",
        qrCodeImageUrl: "/templates/modi-qr.png",
        imageScale: 100,
        imageOffsetY: 0,
        imageOffsetX: 0,
        showTableSize: false,
        showColours: false,
        format: "card",
        copies: 1,
      }));
    }
    // Default to the 5 tags requested
    return DEFAULT_CORELDRAW_TAGS.slice(0, 5);
  });

  const [selectedTagId, setSelectedTagId] = useState<string>(() => tags[0]?.id || "");
  const selectedTag = tags.find((t) => t.id === selectedTagId) || tags[0];

  const [layout, setLayout] = useState<SheetLayoutType>("5-tag");
  const [showCutLines, setShowCutLines] = useState(true);
  const [viewMode, setViewMode] = useState<"sheet" | "card">("sheet");
  const [zoomScale, setZoomScale] = useState(0.85);

  // Database Products picker modal
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedDbCodes, setSelectedDbCodes] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  // Load database products for selection
  useEffect(() => {
    async function loadProducts() {
      setDbLoading(true);
      try {
        const res = await request("/api/showroom-ims/products?limit=100");
        if (res?.data?.records) {
          setDbProducts(res.data.records);
        } else if (Array.isArray(res?.data)) {
          setDbProducts(res.data);
        }
      } catch (e) {
        console.error("Failed to load products for price tags:", e);
      } finally {
        setDbLoading(false);
      }
    }
    loadProducts();
  }, [refreshKey]);

  // Update selected tag fields
  const updateSelectedTag = (updates: Partial<PriceTagData>) => {
    if (!selectedTag) return;
    setTags((prev) =>
      prev.map((t) => (t.id === selectedTag.id ? { ...t, ...updates } : t))
    );
  };

  // Add a new blank tag
  const handleAddBlankTag = () => {
    const newTag: PriceTagData = {
      id: "tag-" + Date.now(),
      name: "NEW PRODUCT",
      subtitle: "(CAFE CHAIR)",
      code: "MC-NEW-01",
      website: "www.modifurniture.com",
      price: 2400,
      gstPercent: 18,
      gstAmount: 432,
      netPrice: 2832,
      imageUrl: "",
      qrCodeImageUrl: "/templates/modi-qr.png",
      imageScale: 100,
      imageOffsetY: 0,
      imageOffsetX: 0,
      showTableSize: false,
      showColours: false,
      format: "card",
      copies: 1,
    };
    setTags((prev) => [...prev, newTag]);
    setSelectedTagId(newTag.id);
  };

  // Duplicate current tag
  const handleDuplicateTag = (tag: PriceTagData) => {
    const dup: PriceTagData = {
      ...tag,
      id: "tag-" + Date.now(),
      name: tag.name,
    };
    setTags((prev) => [...prev, dup]);
    setSelectedTagId(dup.id);
  };

  // Delete tag
  const handleDeleteTag = (id: string) => {
    if (tags.length <= 1) {
      alert("At least one price tag must remain on the sheet.");
      return;
    }
    setTags((prev) => prev.filter((t) => t.id !== id));
    if (selectedTagId === id) {
      const remaining = tags.filter((t) => t.id !== id);
      setSelectedTagId(remaining[0]?.id || "");
    }
  };

  // Handle local image upload for product photo
  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateSelectedTag({ imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Handle custom QR upload
  const handleQrFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateSelectedTag({ qrCodeImageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Import selected products from database
  const handleImportSelectedProducts = () => {
    const chosen = dbProducts.filter((p) => selectedDbCodes.includes(p.itemCode));
    if (chosen.length === 0) return;

    const newTags: PriceTagData[] = chosen.map((p, idx) => {
      const price = Number(p.unitCostINR || p.price || 2400);
      const gst = 18;
      const gstAmt = Math.round((price * gst) / 100);
      return {
        id: "imported-" + p.itemCode + "-" + Date.now() + "-" + idx,
        name: (p.itemName || "PRODUCT").toUpperCase(),
        subtitle: p.subcategory || p.category || "(CAFE CHAIR)",
        code: p.itemCode || "MC-" + idx,
        website: "www.modifurniture.com",
        price: price,
        gstPercent: gst,
        gstAmount: gstAmt,
        netPrice: price + gstAmt,
        imageUrl: p.imageUrl || "",
        qrCodeImageUrl: "/templates/modi-qr.png",
        imageScale: 100,
        imageOffsetY: 0,
        imageOffsetX: 0,
        showTableSize: false,
        showColours: false,
        format: "card",
        copies: 1,
      };
    });

    setTags((prev) => [...prev, ...newTags]);
    setSelectedTagId(newTags[0]?.id || selectedTagId);
    setSelectedDbCodes([]);
    setShowPickerModal(false);
  };

  // Load Preset
  const handleLoadPreset = (count = 5) => {
    const sample = DEFAULT_CORELDRAW_TAGS.slice(0, count);
    setTags(sample);
    setSelectedTagId(sample[0]?.id || "");
    if (count === 5) setLayout("5-tag");
    else if (count === 7) setLayout("7-tag");
  };

  // High-Precision Native A4 Print Function
  const handlePrint = () => {
    const sheetElement = document.getElementById("modi-price-tag-a4-sheet");
    if (!sheetElement) {
      window.print();
      return;
    }

    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    if (!doc) {
      window.print();
      frame.remove();
      return;
    }

    doc.open();
    doc.write(\`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Modi Furniture - Price Tags (6.896 cm x 10.7 cm)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Lato', sans-serif !important;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
    }
    .a4-sheet {
      width: 210mm !important;
      height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      box-shadow: none !important;
      border: none !important;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="font-family: 'Lato', sans-serif;">
  \${sheetElement.outerHTML}
</body>
</html>\`);
    doc.close();

    frame.contentWindow?.addEventListener("afterprint", () => frame.remove(), { once: true });

    void doc.fonts.ready.then(() => {
      setTimeout(() => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setTimeout(() => frame.remove(), 60000);
      }, 350);
    });
  };

  const selectedCalc = selectedTag ? calculatePriceTag(selectedTag) : null;

  return (
    <div className="space-y-4">
      {/* Top Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DA2128] text-white flex items-center justify-center shadow-md shadow-red-900/20">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Price Tag Generator & Print Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                CorelDRAW Size: 6.896 cm × 10.7 cm
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Formatted for 6.896 cm × 10.7 cm labels with Modi Furniture QR code and Lato typography
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Selector */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => { setLayout("5-tag"); }}
              className={"px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer " +
                (layout === "5-tag" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              title="Print 5 Tags on A4 Sheet (6.896 cm × 10.7 cm)"
            >
              5 Tags / A4
            </button>
            <button
              onClick={() => { setLayout("7-tag"); }}
              className={"px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer " +
                (layout === "7-tag" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              title="CorelDRAW Exact Match: 7 Tags per Sheet (3 Top + 1 Rotated + 3 Bottom)"
            >
              7 Tags (CorelDRAW)
            </button>
            <button
              onClick={() => { setLayout("standee-3"); }}
              className={"px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer " +
                (layout === "standee-3" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              title="Print Foldable Tent Standees with Inverted Header"
            >
              Standee (Image 1)
            </button>
          </div>

          {/* Import / Preset Buttons */}
          <button
            onClick={() => setShowPickerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <span>Select Products ({dbProducts.length})</span>
          </button>

          <button
            onClick={() => handleLoadPreset(layout === "7-tag" ? 7 : 5)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Load CorelDRAW Bano & Tatva sample set"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Load BANO / TATVA Preset</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DA2128] hover:bg-[#b8191f] text-white text-xs font-extrabold transition-all shadow-md shadow-red-900/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Editor Column + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 Cols): Card Customizer & Queue */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tag Selector / Queue Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Cards on Sheet ({tags.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddBlankTag}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#DA2128] hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Blank
                </button>
                <button
                  onClick={() => handleDuplicateTag(selectedTag)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
              </div>
            </div>

            {/* Horizontal thumbnail pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
              {tags.map((t, idx) => {
                const isCurrent = t.id === selectedTagId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTagId(t.id)}
                    className={"flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer " +
                      (isCurrent
                        ? "border-[#DA2128] bg-red-50/70 text-[#DA2128] shadow-xs"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white")}
                  >
                    <span>{idx + 1}. {t.name || "UNNAMED"}</span>
                    {tags.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(t.id);
                        }}
                        className="text-slate-400 hover:text-red-600 p-0.5"
                        title="Remove tag"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Editor for the Selected Tag */}
          {selectedTag && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#DA2128]" />
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Customize Tag: {selectedTag.name || "Untitled"}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="neutral">6.896 × 10.7 cm</Badge>
                  <Badge variant="success">Lato Font</Badge>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* 1. Product Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Product Name *</label>
                  <input
                    type="text"
                    value={selectedTag.name}
                    onChange={(e) => updateSelectedTag({ name: e.target.value.toUpperCase() })}
                    placeholder="e.g. BANO"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128] font-bold uppercase"
                  />
                </div>

                {/* 2. Subtitle / Type */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Subtitle / Model</label>
                  <input
                    type="text"
                    value={selectedTag.subtitle}
                    onChange={(e) => updateSelectedTag({ subtitle: e.target.value })}
                    placeholder="e.g. (CAFE CHAIR)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128] font-bold"
                  />
                </div>

                {/* 3. Product Code */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Product Code *</label>
                  <input
                    type="text"
                    value={selectedTag.code}
                    onChange={(e) => updateSelectedTag({ code: e.target.value })}
                    placeholder="e.g. MC-BNO-A-WT"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128] font-mono font-bold"
                  />
                </div>

                {/* 4. Website Pill */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Website URL Pill</label>
                  <input
                    type="text"
                    value={selectedTag.website}
                    onChange={(e) => updateSelectedTag({ website: e.target.value })}
                    placeholder="www.modifurniture.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>

                {/* 5. Base Price */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Base Price (₹) *</label>
                  <input
                    type="number"
                    value={selectedTag.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const gstAmt = Math.round((p * (selectedTag.gstPercent || 18)) / 100);
                      updateSelectedTag({
                        price: p,
                        gstAmount: gstAmt,
                        netPrice: p + gstAmt,
                      });
                    }}
                    placeholder="2400"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128] font-bold text-slate-900"
                  />
                </div>

                {/* 6. GST Rate */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">GST Rate (%)</label>
                  <select
                    value={selectedTag.gstPercent}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      const gstAmt = Math.round(((selectedTag.price || 0) * rate) / 100);
                      updateSelectedTag({
                        gstPercent: rate,
                        gstAmount: gstAmt,
                        netPrice: (selectedTag.price || 0) + gstAmt,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128] font-bold"
                  >
                    <option value={18}>18% (Standard Furniture GST)</option>
                    <option value={12}>12%</option>
                    <option value={5}>5%</option>
                    <option value={0}>0% (Exempt)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                {/* 7. GST Amount (calculated, editable) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">GST Amount (₹)</label>
                  <input
                    type="number"
                    value={selectedTag.gstAmount ?? selectedCalc?.gstAmount}
                    onChange={(e) => {
                      const amt = Number(e.target.value);
                      updateSelectedTag({
                        gstAmount: amt,
                        netPrice: (selectedTag.price || 0) + amt,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128] font-bold"
                  />
                </div>

                {/* 8. Net Price (calculated, editable) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-[#DA2128]">Net Final Price (₹)</label>
                  <input
                    type="number"
                    value={selectedTag.netPrice ?? selectedCalc?.netPrice}
                    onChange={(e) => updateSelectedTag({ netPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-red-300 bg-red-50/30 focus:outline-none focus:border-[#DA2128] font-black text-slate-900"
                  />
                </div>
              </div>

              {/* Product Photo Upload & Zoom Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#DA2128]" />
                    Product Image (Photo Upload)
                  </label>
                  {selectedTag.imageUrl && (
                    <button
                      onClick={() => updateSelectedTag({ imageUrl: "" })}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#DA2128] hover:bg-red-50/50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Upload Chair/Furniture Image...</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageFile(f);
                    }}
                  />
                </div>

                {/* Scale & Offset Sliders if Image present */}
                {selectedTag.imageUrl && (
                  <div className="grid grid-cols-2 gap-3 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Image Zoom</span>
                        <span>{selectedTag.imageScale || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={selectedTag.imageScale || 100}
                        onChange={(e) => updateSelectedTag({ imageScale: Number(e.target.value) })}
                        className="w-full accent-[#DA2128]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                        <span>Vertical Position</span>
                        <span>{selectedTag.imageOffsetY || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-40"
                        max="40"
                        value={selectedTag.imageOffsetY || 0}
                        onChange={(e) => updateSelectedTag({ imageOffsetY: Number(e.target.value) })}
                        className="w-full accent-[#DA2128]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Section (Using uploaded QR code by default) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <QrIcon className="w-3.5 h-3.5 text-[#DA2128]" />
                    QR Code Graphic
                  </label>
                  <button
                    onClick={() => updateSelectedTag({ qrCodeImageUrl: "/templates/modi-qr.png" })}
                    className="text-[11px] font-bold text-[#DA2128] hover:underline"
                    title="Reset to uploaded Modi QR"
                  >
                    Reset to Default QR
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedTag.qrCodeImageUrl || "/templates/modi-qr.png"}
                      alt="Active QR"
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-slate-800 block">
                      Active: User Uploaded QR Image
                    </span>
                    <button
                      onClick={() => qrInputRef.current?.click()}
                      className="text-[10.5px] font-bold text-blue-600 hover:underline mt-0.5"
                    >
                      Upload New QR Image...
                    </button>
                    <input
                      ref={qrInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleQrFile(f);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Extra Customization Options (Table Size, Colours) */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                {/* Table Size Toggle & Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={selectedTag.showTableSize}
                        onChange={(e) => updateSelectedTag({ showTableSize: e.target.checked })}
                        className="rounded-sm accent-[#DA2128]"
                      />
                      Show Dimensions / Table Size
                    </label>
                  </div>
                  {selectedTag.showTableSize && (
                    <input
                      type="text"
                      value={selectedTag.tableSize || ""}
                      onChange={(e) => updateSelectedTag({ tableSize: e.target.value })}
                      placeholder="Size: (W) x (D) x (H) or 1200 x 600 x 750 mm"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    />
                  )}
                </div>

                {/* Colours Swatches Toggle */}
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={selectedTag.showColours}
                      onChange={(e) => updateSelectedTag({ showColours: e.target.checked })}
                      className="rounded-sm accent-[#DA2128]"
                    />
                    Show Colours Indicator Box
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Live Preview Studio (A4 Sheet or Single Tag) */}
        <div className="lg:col-span-7 space-y-3">
          {/* View Mode & Zoom Toolbar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Preview:</span>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  onClick={() => setViewMode("sheet")}
                  className={"px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer " +
                    (viewMode === "sheet" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800")}
                >
                  A4 Sheet ({layout === "5-tag" ? "5 Labels" : layout === "7-tag" ? "7 Labels (Corel)" : "Standees"})
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={"px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer " +
                    (viewMode === "card" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800")}
                >
                  Single Label (6.896 × 10.7 cm)
                </button>
              </div>
            </div>

            {/* Cut Lines & Zoom Controls */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="rounded-sm accent-[#DA2128]"
                />
                Cut Lines
              </label>

              {viewMode === "sheet" && (
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.1))}
                    className="p-1 hover:text-[#DA2128]"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-[11px] text-slate-700 w-9 text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale((s) => Math.min(1.5, s + 0.1))}
                    className="p-1 hover:text-[#DA2128]"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="bg-slate-200/70 p-6 rounded-2xl border border-slate-300 min-h-[580px] flex items-center justify-center overflow-auto">
            {viewMode === "sheet" ? (
              <PriceTagSheet
                tags={tags}
                layout={layout}
                showCutLines={showCutLines}
                selectedTagId={selectedTagId}
                onSelectTag={(t) => setSelectedTagId(t.id)}
                scale={zoomScale}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <PriceTagCard
                  tag={selectedTag}
                  mode={selectedTag.format === "standee" ? "standee" : "card"}
                  showCutLines={showCutLines}
                  isSelected={true}
                  scale={1.1}
                />
                <span className="text-xs text-slate-500 font-bold mt-4">
                  Actual Label Size: 6.896 cm × 10.7 cm (Lato Typography · Modi QR)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Product Selection Modal */}
      {showPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#DA2128]" />
                <h3 className="font-black text-slate-900 text-base">
                  Select Finished Goods / Products
                </h3>
              </div>
              <button
                onClick={() => setShowPickerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Search filter */}
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Search product name, code, category..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none font-bold"
              />
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {dbLoading ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Loading catalog products...
                </div>
              ) : dbProducts.filter((p) => {
                  const s = pickerSearch.toLowerCase();
                  return (
                    (p.itemName || "").toLowerCase().includes(s) ||
                    (p.itemCode || "").toLowerCase().includes(s) ||
                    (p.category || "").toLowerCase().includes(s)
                  );
                }).length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No matching products found.
                </div>
              ) : (
                dbProducts
                  .filter((p) => {
                    const s = pickerSearch.toLowerCase();
                    return (
                      (p.itemName || "").toLowerCase().includes(s) ||
                      (p.itemCode || "").toLowerCase().includes(s) ||
                      (p.category || "").toLowerCase().includes(s)
                    );
                  })
                  .map((p) => {
                    const isChecked = selectedDbCodes.includes(p.itemCode);
                    return (
                      <div
                        key={p.itemCode}
                        onClick={() => {
                          setSelectedDbCodes((prev) =>
                            isChecked
                              ? prev.filter((c) => c !== p.itemCode)
                              : [...prev, p.itemCode]
                          );
                        }}
                        className={"flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors " +
                          (isChecked
                            ? "border-[#DA2128] bg-red-50/50 text-slate-900"
                            : "border-slate-100 hover:bg-slate-50 text-slate-700")}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded-sm accent-[#DA2128]"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {p.itemName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {p.itemCode} · {p.category || "Finished Goods"}
                            </span>
                          </div>
                        </div>
                        <span className="font-extrabold text-[#DA2128]">
                          {p.unitCostINR ? "₹ " + p.unitCostINR.toLocaleString("en-IN") : "₹ 2,400"}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500 font-bold">
                {selectedDbCodes.length} product(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPickerModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleImportSelectedProducts}
                  disabled={selectedDbCodes.length === 0}
                  className="bg-[#DA2128] hover:bg-[#b8191f] text-white"
                >
                  Add Selected to Price Tags
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

// Write all three files to both directories
targets.forEach(dir => {
  fs.writeFileSync(path.join(dir, 'PriceTagCard.tsx'), priceTagCardCode, 'utf8');
  fs.writeFileSync(path.join(dir, 'PriceTagSheet.tsx'), priceTagSheetCode, 'utf8');
  fs.writeFileSync(path.join(dir, 'PriceTagTab.tsx'), priceTagTabCode, 'utf8');
});

console.log('PriceTagCard, PriceTagSheet, and PriceTagTab updated to exact 6.896 cm x 10.7 cm with user QR!');

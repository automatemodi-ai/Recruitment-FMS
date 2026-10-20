import fs from 'fs';
import path from 'path';

const roots = [
  'C:/Softwares/Modi-furniture/frontend',
  'C:/Users/ok/Desktop/Modi-furniture/frontend',
];

// 1. Updated PriceTagCard.tsx with minimal QR border and no-overlap dimensions (68.5mm x 107mm)
const priceTagCardCode = `"use client";

import React, { useRef } from "react";
import { QrCodeSvg } from "./QrCodeSvg";
import { ImageIcon } from "lucide-react";

export interface PriceTagData {
  id: string;
  name: string;             // e.g. "BANO" or "TATVA" or "MIRA"
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
  if (isNaN(val)) return "\\u20B9 0/-";
  return "\\u20B9 " + val.toLocaleString("en-IN") + "/-";
}

interface PriceTagCardProps {
  tag: PriceTagData;
  mode?: "card" | "standee" | "horizontal";
  cardWidth?: string;
  cardHeight?: string;
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
  cardWidth = "68.5mm",
  cardHeight = "107mm",
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
          <rect width="100%" height="100%" fill="url(#modi-geo-pattern)" mask="url(#geo-mask)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#modi-geo-pattern)" mask="url(#geo-mask)" />
    </svg>
  );

  // Front Face Section (Exact 68.5 mm x 107 mm Proportion)
  const renderFrontFace = () => (
    <div className="flex flex-col flex-1 justify-between bg-white relative overflow-hidden select-none w-full h-full box-border">
      {/* 1. Header Row */}
      <div className="px-2 pt-1.5 pb-0.5 flex items-start justify-between gap-1 shrink-0">
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

        {/* Right: Red Website Badge (SQUARE SHAPE) & Item Code centered directly below it */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div
            className="text-white font-bold px-1.5 py-0.5 leading-none text-center whitespace-nowrap shadow-2xs"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "6.5pt",
              fontWeight: 700,
              backgroundColor: "#DA2128",
              borderRadius: "0px",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
              letterSpacing: "0.02em",
            }}
          >
            www.modifurniture.com
          </div>
          <div
            className="text-slate-900 font-bold leading-tight mt-1 text-center whitespace-nowrap"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "7pt",
              fontWeight: 700,
            }}
          >
            {tag.code ? (tag.code.startsWith("Code-") ? tag.code : "Code- " + tag.code) : "Code- MC-MRA-HB-BK"}
          </div>
        </div>
      </div>

      {/* 2. Middle Product Image Area */}
      <div className="flex-1 min-h-[145px] max-h-[175px] relative flex items-center justify-center px-1.5 py-1 overflow-hidden bg-white">
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
              className="max-h-[165px] max-w-full object-contain pointer-events-none drop-shadow-xs"
              loading="eager"
            />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-slate-300 hover:text-[#DA2128] hover:bg-red-50/50 rounded-lg p-2 transition-colors cursor-pointer border border-dashed border-slate-200 w-full h-[140px]"
          >
            <ImageIcon className="w-8 h-8 stroke-1 text-slate-300" />
            <span
              className="text-[9px] font-bold mt-1 text-slate-400"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Upload Photo
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
            <span className="text-[#DA2128] mr-0.5">●</span> Table:
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
        className="text-white px-2.5 py-1.5 flex flex-col justify-between shrink-0"
        style={{
          minHeight: "102px",
          backgroundColor: "#DA2128",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        {/* Pricing rows - All 3 (Price, GST, Net Price) show Rupee sign ₹ */}
        <div className="flex flex-col items-center justify-center w-full">
          <div
            className="w-full flex items-center justify-between text-white font-bold leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "8.5pt", fontWeight: 700 }}
          >
            <span>Price</span>
            <span>{formatINR(calc.price)}</span>
          </div>
          <div
            className="w-full flex items-center justify-between text-white font-bold leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "8.5pt", fontWeight: 700 }}
          >
            <span>GST {calc.gstPercent}%</span>
            <span>{formatINR(calc.gstAmount)}</span>
          </div>

          {/* Thin White Divider Line */}
          <div className="w-full border-b border-white my-1" style={{ borderColor: "#ffffff" }} />

          <div
            className="w-full flex items-center justify-between text-white font-black leading-none py-0.5"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: "10pt", fontWeight: 900 }}
          >
            <span>Net Price</span>
            <span>{formatINR(calc.netPrice)}</span>
          </div>
        </div>

        {/* Brand Logo & QR Code Row */}
        <div className="flex items-end justify-between mt-1 pt-0.5">
          {/* Brand Logo: MODI FURNITURE. */}
          <div className="flex flex-col leading-none pb-0.5">
            <span
              className="text-white font-black tracking-tight leading-none"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "14.5pt", fontWeight: 900 }}
            >
              MODI
            </span>
            <span
              className="text-white font-extrabold tracking-widest leading-none mt-0.5"
              style={{ fontFamily: "'Lato', sans-serif", fontSize: "6.5pt", fontWeight: 800 }}
            >
              FURNITURE.
            </span>
          </div>

          {/* Scanner with MINIMAL BORDER (Bilkul kam 1px border) */}
          <div
            className="shrink-0 flex items-center justify-center bg-white"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #ffffff",
              borderRadius: "0px",
              padding: "1px",
              WebkitPrintColorAdjust: "exact",
              printColorAdjust: "exact",
            }}
          >
            {tag.qrCodeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tag.qrCodeImageUrl}
                alt="QR Code"
                className="w-[38px] h-[38px] object-contain block"
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
                className="w-[38px] h-[38px] object-contain block"
                loading="eager"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Standee Mode (Full Standee with Fold Flaps)
  if (actualFormat === "standee") {
    return (
      <div
        onClick={onClick}
        className={"relative bg-white text-slate-900 transition-shadow " +
          (showCutLines ? "border border-dashed border-slate-700 " : "") +
          (isSelected ? "ring-2 ring-[#DA2128] ring-offset-2 shadow-lg " : "shadow-md ") + className}
        style={{
          width: cardWidth,
          minHeight: "260mm",
          fontFamily: "'Lato', sans-serif",
          transform: scale !== 1 ? "scale(" + scale + ")" : undefined,
          transformOrigin: "top left",
          boxSizing: "border-box",
        }}
      >
        {/* Panel 0: Top Edge Flap paste inside */}
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

        {/* Panel 1: Inverted Header with Geometric Pattern */}
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
              <span className="w-2 h-2 bg-[#DA2128] inline-block" />FURNITURE.
            </span>
          </div>
        </div>

        {/* Panel 2: Front Face */}
        <div style={{ height: cardHeight }} className="flex flex-col border-b border-dashed border-slate-400">
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

  // Standard Card Mode
  return (
    <div
      onClick={onClick}
      className={"price-tag-card relative bg-white text-slate-900 flex flex-col transition-all overflow-hidden " +
        (showCutLines ? "border border-dashed border-slate-300 " : "") +
        (isSelected ? "ring-2 ring-[#DA2128] ring-offset-2 shadow-xl " : "shadow-sm ") +
        (isHorizontal ? "horizontal-card " : "") + className}
      style={{
        width: cardWidth,
        height: cardHeight,
        minWidth: cardWidth,
        minHeight: cardHeight,
        maxWidth: cardWidth,
        maxHeight: cardHeight,
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

// 2. Updated PriceTagSheet.tsx with strict non-overlapping dimensions (68.5mm x 107mm)
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
  layout = "7-tag",
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

  // Non-Overlapping Precision Card Dimensions:
  // 3 Columns: 3 x 68.5mm = 205.5mm (fits cleanly within 210mm A4 with 2.25mm margins on each side)
  // Height in 7-Tag: 107mm (Row 1) + 2.5mm + 68.5mm (Mid) + 2.5mm + 107mm (Row 3) = 287.5mm
  // (fits cleanly within 297mm A4 with 4.75mm margins top and bottom, NEVER overlaps or creates 2 pages)
  const CARD_W = "68.5mm";
  const CARD_H = "107mm";

  // Render Layout: 5-tag (3 cards top, 2 cards bottom, zero overlap)
  const render5TagLayout = () => {
    const topRow = expandedTags.slice(0, 3);
    const bottomRow = expandedTags.slice(3, 5);

    return (
      <div
        className="w-full h-full flex flex-col justify-between box-border overflow-hidden"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "10mm 2.25mm",
          boxSizing: "border-box",
        }}
      >
        {/* Top Row: 3 vertical cards of 68.5mm x 107mm */}
        <div
          className="flex justify-between items-start w-full shrink-0"
          style={{ width: "205.5mm", margin: "0 auto" }}
        >
          {[0, 1, 2].map((idx) => {
            const tag = topRow[idx];
            if (!tag) {
              return (
                <div
                  key={"empty-top-" + idx}
                  className="border border-dashed border-slate-300 rounded-xs flex flex-col items-center justify-center text-slate-300 text-xs font-mono select-none shrink-0"
                  style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                >
                  <span>Slot {idx + 1}</span>
                  <span className="text-[9px] text-slate-400 mt-1">6.85 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-5tag-top-" + idx}
                style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                className="shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  cardWidth={CARD_W}
                  cardHeight={CARD_H}
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                />
              </div>
            );
          })}
        </div>

        {/* Center decorative cut guideline for cutter */}
        {showCutLines && (
          <div className="w-full flex items-center justify-center py-2 text-slate-400 text-[8pt] font-mono select-none my-auto">
            <span className="w-full border-b border-dashed border-slate-300 mr-2" />
            <span className="whitespace-nowrap px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-[8pt] font-semibold text-slate-600">
              ✂ Cut Guide Line • 5 Price Tags on A4 • 6.85 cm × 10.7 cm
            </span>
            <span className="w-full border-b border-dashed border-slate-300 ml-2" />
          </div>
        )}

        {/* Bottom Row: 2 cards centered */}
        <div
          className="flex justify-center items-start gap-[16mm] w-full shrink-0"
          style={{ width: "205.5mm", margin: "0 auto" }}
        >
          {[0, 1].map((idx) => {
            const tag = bottomRow[idx];
            if (!tag) {
              return (
                <div
                  key={"empty-bot-" + idx}
                  className="border border-dashed border-slate-300 rounded-xs flex flex-col items-center justify-center text-slate-300 text-xs font-mono select-none shrink-0"
                  style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                >
                  <span>Slot {idx + 4}</span>
                  <span className="text-[9px] text-slate-400 mt-1">6.85 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-5tag-bot-" + idx}
                style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                className="shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  cardWidth={CARD_W}
                  cardHeight={CARD_H}
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Layout: 7-tag (Exact CorelDRAW Sheet: 3 top + 1 mid rotated + 3 bottom, strictly non-overlapping)
  const render7TagLayout = () => {
    const row1 = expandedTags.slice(0, 3);
    const middleCard = expandedTags[3];
    const row3 = expandedTags.slice(4, 7);

    return (
      <div
        className="w-full h-full flex flex-col justify-between box-border overflow-hidden"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "4mm 2.25mm",
          boxSizing: "border-box",
        }}
      >
        {/* Row 1: 3 vertical cards (68.5mm x 107mm) */}
        <div
          className="flex justify-between items-start w-full shrink-0"
          style={{ width: "205.5mm", height: CARD_H, margin: "0 auto" }}
        >
          {[0, 1, 2].map((idx) => {
            const tag = row1[idx];
            if (!tag) {
              return (
                <div
                  key={"r1-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-xs flex flex-col items-center justify-center text-slate-300 text-xs font-mono shrink-0"
                  style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                >
                  <span>Slot {idx + 1}</span>
                  <span className="text-[8px] text-slate-400">6.85 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-r1-" + idx}
                style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                className="shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  cardWidth={CARD_W}
                  cardHeight={CARD_H}
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                />
              </div>
            );
          })}
        </div>

        {/* Row 2 (Middle): 1 horizontal rotated card (Exact same 68.5mm x 107mm card, rotated inside 107mm x 68.5mm frame) */}
        <div
          className="flex justify-center items-center w-full shrink-0 relative"
          style={{ width: "205.5mm", height: CARD_W, margin: "2mm auto" }}
        >
          {middleCard ? (
            <div
              key={middleCard.id + "-mid"}
              className="relative flex items-center justify-center"
              style={{
                width: CARD_H, // 107mm layout width
                height: CARD_W, // 68.5mm layout height
                boxSizing: "border-box",
              }}
            >
              {/* Perfectly centered absolute rotation so layout footprint matches visual boundary with 0 overflow */}
              <div
                style={{
                  position: "absolute",
                  width: CARD_W, // 68.5mm
                  height: CARD_H, // 107mm
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(-90deg)",
                  transformOrigin: "center center",
                  boxSizing: "border-box",
                }}
              >
                <PriceTagCard
                  tag={middleCard}
                  mode="card"
                  cardWidth={CARD_W}
                  cardHeight={CARD_H}
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === middleCard.id}
                  onClick={() => onSelectTag?.(middleCard)}
                  isPrint={isPrint}
                />
              </div>
            </div>
          ) : (
            <div
              className="border border-dashed border-slate-300 rounded-xs flex flex-col items-center justify-center text-slate-300 text-xs font-mono"
              style={{ width: CARD_H, height: CARD_W, boxSizing: "border-box" }}
            >
              <span>Middle Slot 4 (Rotated)</span>
              <span className="text-[8px] text-slate-400">10.7 × 6.85 cm</span>
            </div>
          )}
        </div>

        {/* Row 3: 3 vertical cards (68.5mm x 107mm) */}
        <div
          className="flex justify-between items-start w-full shrink-0"
          style={{ width: "205.5mm", height: CARD_H, margin: "0 auto" }}
        >
          {[0, 1, 2].map((idx) => {
            const tag = row3[idx];
            if (!tag) {
              return (
                <div
                  key={"r3-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-xs flex flex-col items-center justify-center text-slate-300 text-xs font-mono shrink-0"
                  style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                >
                  <span>Slot {idx + 5}</span>
                  <span className="text-[8px] text-slate-400">6.85 × 10.7 cm</span>
                </div>
              );
            }
            return (
              <div
                key={tag.id + "-r3-" + idx}
                style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                className="shrink-0"
              >
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  cardWidth={CARD_W}
                  cardHeight={CARD_H}
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
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
        className="w-full h-full flex justify-between items-stretch box-border overflow-hidden"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "6mm 2.25mm",
          boxSizing: "border-box",
        }}
      >
        {[0, 1, 2].map((idx) => {
          const tag = standees[idx];
          if (!tag) {
            return (
              <div
                key={"standee-empty-" + idx}
                className="border border-dashed border-slate-300 rounded-xs flex flex-col items-center justify-center text-slate-300 text-xs font-mono shrink-0"
                style={{ width: CARD_W, height: "282mm", boxSizing: "border-box" }}
              >
                Standee Slot {idx + 1}
              </div>
            );
          }
          return (
            <div
              key={tag.id + "-standee-" + idx}
              style={{ width: CARD_W, height: "282mm", boxSizing: "border-box" }}
              className="shrink-0"
            >
              <PriceTagCard
                tag={tag}
                mode="standee"
                cardWidth={CARD_W}
                cardHeight={CARD_H}
                showCutLines={showCutLines}
                isSelected={!isPrint && selectedTagId === tag.id}
                onClick={() => onSelectTag?.(tag)}
                isPrint={isPrint}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Render Layout: Grid 6 (2 rows of 3 vertical cards)
  const renderGrid6Layout = () => {
    const row1 = expandedTags.slice(0, 3);
    const row2 = expandedTags.slice(3, 6);

    return (
      <div
        className="w-full h-full flex flex-col justify-between box-border overflow-hidden"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "10mm 2.25mm",
          boxSizing: "border-box",
        }}
      >
        <div
          className="flex justify-between items-start w-full shrink-0"
          style={{ width: "205.5mm", margin: "0 auto" }}
        >
          {[0, 1, 2].map((idx) => {
            const tag = row1[idx];
            if (!tag) {
              return (
                <div
                  key={"g6-r1-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-xs flex items-center justify-center text-slate-300 text-xs font-mono shrink-0"
                  style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                >
                  Slot {idx + 1}
                </div>
              );
            }
            return (
              <div key={tag.id + "-g6-r1-" + idx} style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }} className="shrink-0">
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  cardWidth={CARD_W}
                  cardHeight={CARD_H}
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
                />
              </div>
            );
          })}
        </div>

        {showCutLines && (
          <div className="w-full flex items-center justify-center py-2 text-slate-400 text-[8pt] font-mono select-none my-auto">
            <span className="w-full border-b border-dashed border-slate-300 mr-2" />
            <span className="whitespace-nowrap px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-[8pt] font-semibold text-slate-600">
              ✂ Cut Guide Line • 6.85 cm × 10.7 cm
            </span>
            <span className="w-full border-b border-dashed border-slate-300 ml-2" />
          </div>
        )}

        <div
          className="flex justify-between items-start w-full shrink-0"
          style={{ width: "205.5mm", margin: "0 auto" }}
        >
          {[0, 1, 2].map((idx) => {
            const tag = row2[idx];
            if (!tag) {
              return (
                <div
                  key={"g6-r2-empty-" + idx}
                  className="border border-dashed border-slate-300 rounded-xs flex items-center justify-center text-slate-300 text-xs font-mono shrink-0"
                  style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }}
                >
                  Slot {idx + 4}
                </div>
              );
            }
            return (
              <div key={tag.id + "-g6-r2-" + idx} style={{ width: CARD_W, height: CARD_H, boxSizing: "border-box" }} className="shrink-0">
                <PriceTagCard
                  tag={tag}
                  mode="card"
                  cardWidth={CARD_W}
                  cardHeight={CARD_H}
                  showCutLines={showCutLines}
                  isSelected={!isPrint && selectedTagId === tag.id}
                  onClick={() => onSelectTag?.(tag)}
                  isPrint={isPrint}
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
          maxWidth: "210mm",
          maxHeight: "297mm",
          fontFamily: "'Lato', sans-serif",
          boxSizing: "border-box",
          overflow: "hidden",
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

roots.forEach((root) => {
  const cardPath = path.join(root, 'src/components/showroom-ims/PriceTagCard.tsx');
  const sheetPath = path.join(root, 'src/components/showroom-ims/PriceTagSheet.tsx');
  const tabPath = path.join(root, 'src/components/showroom-ims/PriceTagTab.tsx');

  if (fs.existsSync(path.dirname(cardPath))) {
    fs.writeFileSync(cardPath, priceTagCardCode, 'utf8');
    fs.writeFileSync(sheetPath, priceTagSheetCode, 'utf8');
    console.log('Updated PriceTagCard & PriceTagSheet in', root);
  }

  // Also update UI descriptions in PriceTagTab
  if (fs.existsSync(tabPath)) {
    let tabContent = fs.readFileSync(tabPath, 'utf8');
    tabContent = tabContent.replace(
      'desc: "3 Top + 1 Mid + 3 Bot (Full A4: 7.0 × 11.3 cm)"',
      'desc: "3 Top + 1 Mid + 3 Bot (Full A4: 6.85 × 10.7 cm)"'
    );
    tabContent = tabContent.replace(
      'desc: "3 Top + 2 Bottom (Full A4: 7.0 × 11.3 cm)"',
      'desc: "3 Top + 2 Bottom (Full A4: 6.85 × 10.7 cm)"'
    );
    tabContent = tabContent.replace(
      'desc: "2 Rows × 3 Cols (Full A4: 7.0 × 11.3 cm)"',
      'desc: "2 Rows × 3 Cols (Full A4: 6.85 × 10.7 cm)"'
    );
    tabContent = tabContent.replace(
      'Size: 7.0 × 11.3 cm (Full A4)',
      'Size: 6.85 × 10.7 cm (No Overlap Full A4)'
    );
    tabContent = tabContent.replace(
      'Modi Furniture - Price Tags (Full A4: 7.0 cm x 11.3 cm)',
      'Modi Furniture - Price Tags (Full A4 No-Overlap)'
    );

    // Make sure print iframe has page-break-inside avoid and zero-margin page
    const printCssReplacement = `    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      font-family: 'Lato', sans-serif !important;
      width: 210mm !important;
      height: 297mm !important;
      overflow: hidden !important;
    }
    .a4-sheet {
      width: 210mm !important;
      height: 297mm !important;
      max-width: 210mm !important;
      max-height: 297mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background: #ffffff !important;
      box-shadow: none !important;
      border: none !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .price-tag-card {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-sizing: border-box !important;
    }
    img {
      max-width: 100%;
      height: auto;
    }`;

    if (tabContent.includes('@page {')) {
      const pageRegex = /@page\s*\{[\s\S]*?img\s*\{[\s\S]*?\}/;
      tabContent = tabContent.replace(pageRegex, printCssReplacement);
    }

    fs.writeFileSync(tabPath, tabContent, 'utf8');
    console.log('Updated PriceTagTab in', root);
  }
});

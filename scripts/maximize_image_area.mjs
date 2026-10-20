import fs from 'fs';
import path from 'path';

const roots = [
  'C:/Softwares/Modi-furniture/frontend',
  'C:/Users/ok/Desktop/Modi-furniture/frontend',
];

roots.forEach((root) => {
  // 1. Update PriceTagCard.tsx
  const cardPath = path.join(root, 'src/components/showroom-ims/PriceTagCard.tsx');
  if (fs.existsSync(cardPath)) {
    let cardContent = fs.readFileSync(cardPath, 'utf8');

    // Maximize image container and img tag
    const oldImageBlock = `      {/* 2. Middle Product Image Area */}
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
        )}`;

    const newImageBlock = `      {/* 2. Middle Product Image Area (Expanded Top, Bottom, Left, Right) */}
      <div className="flex-1 w-full relative flex items-center justify-center p-0 overflow-hidden bg-white">
        {tag.imageUrl ? (
          <div
            className="w-full h-full flex items-center justify-center p-0.5"
            style={{
              transform: "scale(" + ((tag.imageScale || 100) / 100) + ") translate(" + (tag.imageOffsetX || 0) + "px, " + (tag.imageOffsetY || 0) + "px)",
              transition: isPrint ? "none" : "transform 0.15s ease",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tag.imageUrl}
              alt={tag.name || "Product"}
              className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
              }}
              loading="eager"
            />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-slate-300 hover:text-[#DA2128] hover:bg-red-50/50 rounded-lg p-2 transition-colors cursor-pointer border border-dashed border-slate-200 w-[94%] h-[90%]"
          >
            <ImageIcon className="w-9 h-9 stroke-1 text-slate-300" />
            <span
              className="text-[9.5px] font-bold mt-1 text-slate-400"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Upload Photo
            </span>
          </div>
        )}`;

    if (cardContent.includes('min-h-[145px] max-h-[175px]')) {
      cardContent = cardContent.replace(oldImageBlock, newImageBlock);
      fs.writeFileSync(cardPath, cardContent, 'utf8');
      console.log('Maximized image area in PriceTagCard.tsx in', root);
    }
  }

  // 2. Update PriceTagTab.tsx sliders (expand range and add horizontal slider)
  const tabPath = path.join(root, 'src/components/showroom-ims/PriceTagTab.tsx');
  if (fs.existsSync(tabPath)) {
    let tabContent = fs.readFileSync(tabPath, 'utf8');

    // Replace the Image Zoom & Vertical Position block with expanded sliders including horizontal position
    const oldSlidersBlock = `                      <div>
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
                      </div>`;

    const newSlidersBlock = `                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>Image Zoom / Scale</span>
                          <span>{selectedTag.imageScale || 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="250"
                          value={selectedTag.imageScale || 100}
                          onChange={(e) => updateSelectedTag({ imageScale: Number(e.target.value) })}
                          className="w-full accent-[#DA2128]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                            <span>Up / Down</span>
                            <span>{selectedTag.imageOffsetY || 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="-60"
                            max="60"
                            value={selectedTag.imageOffsetY || 0}
                            onChange={(e) => updateSelectedTag({ imageOffsetY: Number(e.target.value) })}
                            className="w-full accent-[#DA2128]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                            <span>Left / Right</span>
                            <span>{selectedTag.imageOffsetX || 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="-60"
                            max="60"
                            value={selectedTag.imageOffsetX || 0}
                            onChange={(e) => updateSelectedTag({ imageOffsetX: Number(e.target.value) })}
                            className="w-full accent-[#DA2128]"
                          />
                        </div>
                      </div>`;

    if (tabContent.includes('<span>Vertical Position</span>')) {
      tabContent = tabContent.replace(oldSlidersBlock, newSlidersBlock);
      fs.writeFileSync(tabPath, tabContent, 'utf8');
      console.log('Expanded image sliders in PriceTagTab.tsx in', root);
    }
  }
});

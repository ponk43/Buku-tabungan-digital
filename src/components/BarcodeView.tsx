import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeViewProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  showText?: boolean;
  className?: string;
  lineColor?: string;
  background?: string;
}

export const BarcodeView: React.FC<BarcodeViewProps> = ({
  value,
  width = 1.8,
  height = 48,
  fontSize = 12,
  showText = true,
  className = '',
  lineColor = '#0f172a',
  background = 'transparent',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue: showText,
          font: 'monospace',
          fontSize,
          textMargin: 4,
          margin: 0,
          background,
          lineColor,
        });
      } catch (err) {
        console.error('Failed to generate barcode', err);
      }
    }
  }, [value, width, height, fontSize, showText, lineColor, background]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
};

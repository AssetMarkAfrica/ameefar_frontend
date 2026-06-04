"use client";
import React, { useRef, useState } from "react";
import type { TradeDocument, TradeDocumentType } from "@/types/bidding";

interface DocumentListProps {
  documents: TradeDocument[];
  onUpload: (file: File, docType: TradeDocumentType) => Promise<void>;
  canUpload?: boolean;
}

export default function DocumentList({ documents, onUpload, canUpload = false }: DocumentListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<TradeDocumentType>("other");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file, selectedType);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getIconForDocType = (type: TradeDocumentType) => {
    switch (type) {
      case "contract": return { icon: "description", bg: "bg-error-container", text: "text-error" };
      case "quality_cert": return { icon: "verified", bg: "bg-secondary-container", text: "text-on-secondary-container" };
      case "invoice":
      case "delivery_note":
      case "weighbridge": return { icon: "receipt_long", bg: "bg-primary-container", text: "text-on-primary-container" };
      default: return { icon: "insert_drive_file", bg: "bg-surface-variant", text: "text-on-surface-variant" };
    }
  };

  const formatDocType = (type: TradeDocumentType) => {
    return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="bg-white rounded-xl border border-border-subtle overflow-hidden">
      <div className="bg-ameefar-navy p-4">
        <h2 className="font-headline-md text-headline-md text-on-primary">Documents</h2>
      </div>
      <div className="p-6 space-y-4">
        {documents.map((doc) => {
          const style = getIconForDocType(doc.doc_type);
          return (
            <div
              key={doc.id}
              className="group flex items-center justify-between p-4 border border-border-subtle rounded-lg hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => window.open(doc.file_url, '_blank')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${style.bg} rounded flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${style.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {style.icon}
                  </span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm font-bold text-ameefar-navy">{doc.title || formatDocType(doc.doc_type)}</p>
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    Uploaded by {doc.uploaded_by_name} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary">
                download
              </span>
            </div>
          );
        })}
        
        {documents.length === 0 && (
          <p className="text-center text-outline-variant italic">No documents uploaded yet.</p>
        )}

        {canUpload && (
          <div className="mt-4 pt-4 border-t border-border-subtle space-y-3">
            <div className="flex gap-2">
              <select 
                className="flex-1 bg-surface-gray border border-border-subtle rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as TradeDocumentType)}
              >
                <option value="contract">Contract</option>
                <option value="quality_cert">Quality Certificate</option>
                <option value="delivery_note">Delivery Note</option>
                <option value="invoice">Invoice</option>
                <option value="weighbridge">Weighbridge</option>
                <option value="photo_evidence">Photo Evidence</option>
                <option value="customs_doc">Customs Doc</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-[2] py-2 border-2 border-dashed border-border-subtle rounded-lg text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-gray transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Upload New Doc
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
}

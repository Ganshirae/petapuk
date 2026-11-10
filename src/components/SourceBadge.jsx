import React from 'react';
import { Database, FileText, Newspaper } from 'lucide-react';

const TYPE_LABEL = { dataset_resmi: 'Dataset Resmi', regulasi: 'Regulasi', berita: 'Berita' };

// Menampilkan asal sebuah angka: jenis sumber, penerbit (tautan), dan tanggal rilis/akses.
export default function SourceBadge({ source, className = '' }) {
  if (!source) return null;
  const Icon = source.source_type === 'dataset_resmi' ? Database : source.source_type === 'regulasi' ? FileText : Newspaper;
  const tanggal = source.released_on ? `rilis ${source.released_on}` : `diakses ${source.accessed_on}`;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${source.title}${source.notes ? `\n\nCatatan: ${source.notes}` : ''}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gov-light border border-gov-border hover:border-gov-emerald text-xs font-accent text-gov-dark/80 max-w-full ${className}`}
    >
      <Icon className="w-3 h-3 text-gov-emerald shrink-0" />
      <span className="font-semibold uppercase tracking-wider text-gov-dark shrink-0">{TYPE_LABEL[source.source_type]}</span>
      <span className="text-gov-dark/30">|</span>
      <span className="truncate font-sans font-medium">{source.publisher}</span>
      <span className="text-gov-dark/30">|</span>
      <span className="text-gov-dark/60 whitespace-nowrap">{tanggal}</span>
    </a>
  );
}

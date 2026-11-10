import React from 'react';
import { Database, FileText, Newspaper } from 'lucide-react';

const TYPE_LABEL = { dataset_resmi: 'Dataset Resmi', regulasi: 'Regulasi', berita: 'Berita' };

const shortPublisher = (pub) => {
  if (!pub) return '';
  if (pub.includes('Kementerian Pertanian')) return 'Kementan RI';
  if (pub.includes('Dinas Pertanian')) return 'Distanbun NTB';
  return pub.length > 20 ? pub.slice(0, 18) + '…' : pub;
};

// Menampilkan asal sebuah angka: jenis sumber, penerbit (tautan), dan tanggal rilis/akses.
export default function SourceBadge({ source, compact = false, className = '' }) {
  if (!source) return null;
  const Icon = source.source_type === 'dataset_resmi' ? Database : source.source_type === 'regulasi' ? FileText : Newspaper;
  const tanggal = source.released_on ? `rilis ${source.released_on}` : `diakses ${source.accessed_on}`;
  const shortDate = source.released_on ? source.released_on.slice(0, 4) : tanggal;
  const publisherName = compact ? shortPublisher(source.publisher) : (shortPublisher(source.publisher) || source.publisher);

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${source.title || ''}${source.publisher ? `\n\nPenerbit: ${source.publisher}` : ''}${source.notes ? `\n\nCatatan: ${source.notes}` : ''}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gov-light border border-gov-border hover:border-gov-emerald text-xs font-accent text-gov-dark/80 transition-colors shrink-0 max-w-full ${className}`}
    >
      <Icon className="w-3.5 h-3.5 text-gov-emerald shrink-0" />
      <span className="font-semibold uppercase tracking-wider text-gov-dark shrink-0">{TYPE_LABEL[source.source_type] || 'Sumber'}</span>
      <span className="text-gov-dark/30">|</span>
      <span className="truncate font-sans font-medium max-w-[130px] sm:max-w-[180px]" title={source.publisher}>{publisherName}</span>
      <span className="text-gov-dark/30">|</span>
      <span className="text-gov-dark/60 whitespace-nowrap">{compact ? shortDate : (source.released_on ? `rilis ${source.released_on}` : tanggal)}</span>
    </a>
  );
}

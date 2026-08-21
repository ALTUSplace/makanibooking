import React from 'react';
import { X, Check, Building2, MapPin, DollarSign, Layers, Bed, Bath, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface PropertyItem {
  id: string | number;
  title: string;
  city: string;
  price: number;
  rooms: number;
  bathrooms?: number;
  area: string;
  type: string;
  image: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comparedProperties: PropertyItem[];
  onRemove: (id: string | number) => void;
}

export default function PropertyComparisonModal({ isOpen, onClose, comparedProperties, onRemove }: Props) {
  if (comparedProperties.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            جدول مقارنة العقارات المتاحة ({comparedProperties.length}/3)
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 w-1/4">المواصفات</th>
                {comparedProperties.map((prop) => (
                  <th key={prop.id} className="py-3 px-4 text-right w-1/4 min-w-[200px]">
                    <div className="relative group">
                      <button
                        onClick={() => onRemove(prop.id)}
                        className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                        title="إزالة من المقارنة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img 
                        src={prop.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600"} 
                        alt={prop.title}
                        className="w-full h-28 object-cover rounded-xl mb-2 border"
                      />
                      <h4 className="font-bold text-slate-900 text-sm truncate">{prop.title}</h4>
                      <p className="text-xs text-amber-600 font-semibold">{prop.price} درهم / يومياً</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> المدينة / الموقع
                </td>
                {comparedProperties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">{prop.city}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-slate-400" /> السعر اليومي
                </td>
                {comparedProperties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 font-bold text-amber-600">{prop.price} درهم</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400" /> المساحة التقريبية
                </td>
                {comparedProperties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">{prop.area || '140 متر²'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-slate-400" /> عدد الغرف
                </td>
                {comparedProperties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">{prop.rooms} غرف نوم</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" /> نوع العقار
                </td>
                {comparedProperties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 capitalize">{prop.type}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            إغلاق المقارنة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

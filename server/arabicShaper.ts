type Forms = { isolated: string; final?: string; initial?: string; medial?: string };

// Unicode presentation forms for the Arabic letters used in the contract template.
const FORMS: Record<string, Forms> = {
  ا: { isolated: '\uFE8D', final: '\uFE8E' },
  أ: { isolated: '\uFE83', final: '\uFE84' },
  إ: { isolated: '\uFE87', final: '\uFE88' },
  آ: { isolated: '\uFE81', final: '\uFE82' },
  ب: { isolated: '\uFE8F', final: '\uFE90', initial: '\uFE91', medial: '\uFE92' },
  ت: { isolated: '\uFE95', final: '\uFE96', initial: '\uFE97', medial: '\uFE98' },
  ث: { isolated: '\uFE99', final: '\uFE9A', initial: '\uFE9B', medial: '\uFE9C' },
  ج: { isolated: '\uFE9D', final: '\uFE9E', initial: '\uFE9F', medial: '\uFEA0' },
  ح: { isolated: '\uFEA1', final: '\uFEA2', initial: '\uFEA3', medial: '\uFEA4' },
  خ: { isolated: '\uFEA5', final: '\uFEA6', initial: '\uFEA7', medial: '\uFEA8' },
  د: { isolated: '\uFEA9', final: '\uFEAA' },
  ذ: { isolated: '\uFEAB', final: '\uFEAC' },
  ر: { isolated: '\uFEAD', final: '\uFEAE' },
  ز: { isolated: '\uFEAF', final: '\uFEB0' },
  س: { isolated: '\uFEB1', final: '\uFEB2', initial: '\uFEB3', medial: '\uFEB4' },
  ش: { isolated: '\uFEB5', final: '\uFEB6', initial: '\uFEB7', medial: '\uFEB8' },
  ص: { isolated: '\uFEB9', final: '\uFEBA', initial: '\uFEBB', medial: '\uFEBC' },
  ض: { isolated: '\uFEBD', final: '\uFEBE', initial: '\uFEBF', medial: '\uFEC0' },
  ط: { isolated: '\uFEC1', final: '\uFEC2', initial: '\uFEC3', medial: '\uFEC4' },
  ظ: { isolated: '\uFEC5', final: '\uFEC6', initial: '\uFEC7', medial: '\uFEC8' },
  ع: { isolated: '\uFEC9', final: '\uFECA', initial: '\uFECB', medial: '\uFECC' },
  غ: { isolated: '\uFECD', final: '\uFECE', initial: '\uFECF', medial: '\uFED0' },
  ف: { isolated: '\uFED1', final: '\uFED2', initial: '\uFED3', medial: '\uFED4' },
  ق: { isolated: '\uFED5', final: '\uFED6', initial: '\uFED7', medial: '\uFED8' },
  ك: { isolated: '\uFED9', final: '\uFEDA', initial: '\uFEDB', medial: '\uFEDC' },
  ل: { isolated: '\uFEDD', final: '\uFEDE', initial: '\uFEDF', medial: '\uFEE0' },
  م: { isolated: '\uFEE1', final: '\uFEE2', initial: '\uFEE3', medial: '\uFEE4' },
  ن: { isolated: '\uFEE5', final: '\uFEE6', initial: '\uFEE7', medial: '\uFEE8' },
  ه: { isolated: '\uFEE9', final: '\uFEEA', initial: '\uFEEB', medial: '\uFEEC' },
  و: { isolated: '\uFEED', final: '\uFEEE' },
  ي: { isolated: '\uFEF1', final: '\uFEF2', initial: '\uFEF3', medial: '\uFEF4' },
  ى: { isolated: '\uFEEF', final: '\uFEF0' },
  ة: { isolated: '\uFE93', final: '\uFE94' },
};

const canConnectAfter = (char: string) => Boolean(FORMS[char]?.initial || FORMS[char]?.medial);
const canConnectBefore = (char: string) => Boolean(FORMS[char]?.final);

/** Shapes Arabic letters into presentation forms; jsPDF's R2L flag handles visual ordering. */
export function shapeArabic(text: string): string {
  const chars = Array.from(text);
  return chars.map((char, index) => {
    const form = FORMS[char];
    if (!form) return char;
    const previous = chars[index - 1];
    const next = chars[index + 1];
    const joinsPrevious = Boolean(previous && canConnectAfter(previous) && canConnectBefore(char));
    const joinsNext = Boolean(next && canConnectAfter(char) && canConnectBefore(next));
    if (joinsPrevious && joinsNext && form.medial) return form.medial;
    if (joinsPrevious && form.final) return form.final;
    if (joinsNext && form.initial) return form.initial;
    return form.isolated;
  }).join('');
}

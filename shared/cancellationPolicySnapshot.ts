export const CANCELLATION_POLICY_VERSION = "cancellation-refund-v1";

export const cancellationPolicySnapshot = {
  ar: {
    title: "سياسة الإلغاء والاسترداد",
    summary: "يظهر مبلغ تأكيد الحجز باعتباره رسوماً للخدمة التقنية والربط. قبل الدفع، يجب على الزبون مراجعة شروط الإلغاء الخاصة بالحجز.",
    points: [
      "يُعد مبلغ تأكيد الحجز المدفوع عبر المنصة رسوماً للخدمة التقنية والربط، وقد يكون غير مسترد عند إلغاء الزبون أو عدم الحضور، ما لم تنص سياسة الحجز أو قاعدة قانونية آمرة على خلاف ذلك.",
      "إذا تعذر على الشريك تقديم الخدمة المتفق عليها رغم أداء الزبون للمبلغ، يمكن للزبون فتح نزاع، وتراجع المنصة الحالة وقد تعيد رسوم الخدمة وفق السياسة المعلنة وشروط العقد.",
      "تخضع أي مبالغ إضافية أو ضمانات أو مصاريف إلغاء لشروط العقد المكتوب بين الشريك والزبون، ولا تُعد هذه الصفحة بديلاً عن العقد أو عن الحقوق القانونية الآمرة.",
    ],
  },
  fr: {
    title: "Politique d'annulation et de remboursement",
    summary: "Les frais de confirmation correspondent au service technique et à la mise en relation. Les conditions applicables sont affichées avant le paiement.",
    points: [
      "Les frais de confirmation payés sur la plateforme rémunèrent le service technique et la mise en relation. Ils peuvent être non remboursables en cas d'annulation ou de non-présentation du Client, sauf disposition contraire de la réservation ou d'une règle impérative.",
      "Si le Partenaire ne peut pas fournir le service convenu malgré le paiement du Client, celui-ci peut ouvrir un litige. La plateforme examine le dossier et peut rembourser les frais de service selon la politique publiée et le contrat.",
      "Les autres montants, dépôts de garantie et frais d'annulation sont régis par le contrat écrit entre le Partenaire et le Client. Cette page ne remplace ni le contrat ni les droits impératifs applicables.",
    ],
  },
} as const;

export function getCancellationPolicySnapshotText() {
  const format = (content: { title: string; summary: string; points: readonly string[] }) =>
    [content.title, content.summary, ...content.points].join("\n\n");
  return `AR\n${format(cancellationPolicySnapshot.ar)}\n\nFR\n${format(cancellationPolicySnapshot.fr)}`;
}

export function getCancellationPolicyFingerprint() {
  return `sha256:${simpleHash(getCancellationPolicySnapshotText())}`;
}

function simpleHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getCancellationPolicyPlainText(language: "ar" | "fr" = "ar") {
  const content = cancellationPolicySnapshot[language];
  return [content.title, content.summary, ...content.points].join("\n\n");
}

export type CancellationPolicySnapshot = ReturnType<typeof getCancellationPolicySnapshotText>;
export type CancellationPolicyLanguage = keyof typeof cancellationPolicySnapshot;

export const CANCELLATION_POLICY_FINGERPRINT = getCancellationPolicyFingerprint();
export const CANCELLATION_POLICY_TEXT = getCancellationPolicySnapshotText();

export const LEGAL_CONSENT_VERSION = "platform-protection-v1";

export const legalDisclosure = {
  ar: {
    title: "بنود حماية منصة B2-Rent",
    summary: "أوافق على قراءة وقبول بنود حماية المنصة قبل إنشاء الحساب أو إتمام أي عملية.",
    sections: [
      {
        title: "طبيعة الخدمة",
        body: "منصة B2-Rent هي وسيط تقني وإعلاني يربط بين مقدمي الخدمات، مثل شركات كراء السيارات وأصحاب العقارات، وبين المستأجرين. لا تملك المنصة السيارات أو العقارات ولا تديرها، ولا تحل محل الشريك في المعاينة أو التسليم.",
      },
      {
        title: "المسؤولية القانونية",
        body: "يتحمل الشريك مسؤولية دقة الإعلان والحالة الميكانيكية للسيارة والسلامة والنظافة ومطابقة العقار للصور والوصف. لا تتحمل B2-Rent، في حدود ما يسمح به القانون المغربي ودون المساس بالحقوق الآمرة، مسؤولية العيوب أو الحوادث أو السرقة أو الأضرار التي تقع أثناء الكراء. وتخضع العلاقة النهائية للعقد المكتوب والموقع بين الشريك والزبون عند الاستلام.",
      },
      {
        title: "المبالغ المدفوعة",
        body: "يمثل مبلغ تأكيد الحجز رسوم الخدمة التقنية والربط البرمجي للمنصة، وتظهر شروط الإلغاء وعدم الاسترداد قبل الدفع. لا يُطبّق عدم الاسترداد إذا خالف ذلك حقاً قانونياً آمراً أو سياسة استرداد معلنة واجبة التطبيق.",
      },
      {
        title: "النزاعات والتعويضات",
        body: "إذا تخلف الشريك عن تقديم الخدمة المتفق عليها رغم أداء الزبون للعمولة، تراجع المنصة الحالة عبر مركز النزاعات، وقد تعيد مبلغ العمولة وفق سياسة الاسترداد المعمول بها، مع إمكانية تعليق أو حظر حساب الشريك المخالف.",
      },
    ],
  },
  fr: {
    title: "Clauses de protection de la plateforme B2-Rent",
    summary: "J'accepte de lire et d'accepter les clauses de protection de la plateforme avant de créer un compte ou d'effectuer une opération.",
    sections: [
      {
        title: "Nature du service",
        body: "B2-Rent est une plateforme publicitaire et un intermédiaire technologique reliant les prestataires, notamment les agences de location de voitures et les propriétaires immobiliers, aux locataires. La plateforme ne possède ni n'exploite les véhicules ou les biens et ne remplace pas le Partenaire lors de l'inspection ou de la remise.",
      },
      {
        title: "Responsabilité juridique",
        body: "Le Partenaire est responsable de l'exactitude de l'annonce, de l'état mécanique et de la sécurité du véhicule, ainsi que de la propreté et de la conformité du bien aux photos et à la description. Dans les limites permises par le droit marocain et sans préjudice des droits impératifs, B2-Rent n'est pas responsable des défauts, accidents, vols ou dommages survenus pendant la location. La relation finale est régie par le contrat écrit signé entre le Partenaire et le Client lors de la remise.",
      },
      {
        title: "Sommes payées",
        body: "Le montant de confirmation de réservation constitue les frais du service technique et de mise en relation de la plateforme. Les conditions d'annulation et de non-remboursement sont affichées avant le paiement. La non-restitution ne s'applique pas lorsqu'elle contredit un droit impératif ou une politique de remboursement obligatoire.",
      },
      {
        title: "Litiges et remboursements",
        body: "Si le Partenaire ne fournit pas le service convenu malgré le paiement de la commission par le Client, la plateforme examine le dossier via le centre des litiges et peut rembourser la commission selon la politique applicable, avec suspension ou bannissement possible du Partenaire fautif.",
      },
    ],
  },
} as const;

export type LegalLanguage = keyof typeof legalDisclosure;

export function hasLegalConsent() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((cookie) => cookie.trim().startsWith(`b2_legal_consent=${LEGAL_CONSENT_VERSION}`));
}

export function persistLegalConsent() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `b2_legal_consent=${LEGAL_CONSENT_VERSION}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function clearLegalConsent() {
  if (typeof document === "undefined") return;
  document.cookie = "b2_legal_consent=; Path=/; Max-Age=0; SameSite=Lax";
}

export function getLegalDisclosurePlainText(language: LegalLanguage = "ar") {
  const content = legalDisclosure[language];
  return [content.title, ...content.sections.map((section) => `${section.title}: ${section.body}`)].join("\n\n");
}

export function getLegalDisclosureHtml(language: LegalLanguage = "ar") {
  return getLegalDisclosurePlainText(language)
    .split("\n\n")
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

import { setRequestLocale, getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MyClup Platform Admin</h1>
      <p>{t("label.loading")}</p>
    </main>
  );
}

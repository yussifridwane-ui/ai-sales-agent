import { getSessionUser } from "@/lib/auth";
import { requireOrganization } from "@/lib/tenant";
import { BRAND_DOMAIN, widgetScriptUrl } from "@/lib/domains";

export default async function WidgetPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const { organization } = await requireOrganization(user);
  const scriptSrc = widgetScriptUrl();
  const snippet = `<script src="${scriptSrc}" data-org="${organization.slug}" async></script>`;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Installer mon AI Sales Agent</h1>
      <p className="text-[var(--muted)]">
        Collez ce script sur votre site. En production le script est servi depuis {BRAND_DOMAIN}.
      </p>
      <pre className="card overflow-x-auto p-4 text-sm">{snippet}</pre>
      <div className="card p-5 text-sm text-[var(--muted)]">
        <div>Organisation : {organization.name}</div>
        <div>Slug : {organization.slug}</div>
        <div>Widget : {scriptSrc}</div>
      </div>
      <a href={`/w/${organization.slug}`} className="btn btn-primary">
        Aperçu
      </a>
    </div>
  );
}

import { getSessionUser } from "@/lib/auth";
import { requireOrganization } from "@/lib/tenant";

export default async function WidgetPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const { organization } = await requireOrganization(user);
  const snippet = `<script src="/widget.js" data-org="${organization.slug}" async></script>`;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Installer mon AI Sales Agent</h1>
      <p className="text-slate-400">Collez ce script sur votre site. Le widget parle à votre agent réel.</p>
      <pre className="card overflow-x-auto p-4 text-sm text-teal-200">{snippet}</pre>
      <div className="card p-5 text-sm text-slate-400">
        <div>Organisation : {organization.name}</div>
        <div>Slug : {organization.slug}</div>
        <div>Domaines autorisés : configurables dans les paramètres widget.</div>
      </div>
      <a href={`/w/${organization.slug}`} className="btn btn-primary">
        Aperçu
      </a>
    </div>
  );
}

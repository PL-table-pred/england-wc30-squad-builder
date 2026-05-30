import { AdminBotMaker } from '../../components/AdminBotMaker'

export function AdminBotsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-england-navy">QA bots</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create bots, then select one to edit their full squad on the pitch — same experience as
          the public squad builder.
        </p>
      </div>
      <AdminBotMaker />
    </div>
  )
}

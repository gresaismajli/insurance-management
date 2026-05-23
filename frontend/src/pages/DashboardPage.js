import PageHeader from './shared/PageHeader';

const stats = [
  { label: 'Clients', value: '0' },
  { label: 'Active Policies', value: '0' },
  { label: 'Open Claims', value: '0' },
  { label: 'Payments', value: '0' }
];

function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>
      <section className="panel mt-4">
        <h2 className="panel-title">Recent Activity</h2>
        <p className="text-secondary mb-0">Activity will appear after records are created.</p>
      </section>
    </>
  );
}

export default DashboardPage;


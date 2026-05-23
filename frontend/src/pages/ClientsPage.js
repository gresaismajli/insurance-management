import PageHeader from './shared/PageHeader';

function ClientsPage() {
  return (
    <>
      <PageHeader title="Clients" />
      <section className="panel">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="empty-cell">
                  No clients loaded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default ClientsPage;


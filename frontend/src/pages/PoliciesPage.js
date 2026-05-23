import PageHeader from './shared/PageHeader';

function PoliciesPage() {
  return (
    <>
      <PageHeader title="Policies" />
      <section className="panel">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Policy No.</th>
                <th>Client</th>
                <th>Type</th>
                <th>Premium</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="empty-cell">
                  No policies loaded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default PoliciesPage;


import PageHeader from './shared/PageHeader';

function InsuranceTypesPage() {
  return (
    <>
      <PageHeader title="Insurance Types" />
      <section className="panel">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Base Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="empty-cell">
                  No insurance types loaded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default InsuranceTypesPage;


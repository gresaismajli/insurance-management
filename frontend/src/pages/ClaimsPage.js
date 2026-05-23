import PageHeader from './shared/PageHeader';

function ClaimsPage() {
  return (
    <>
      <PageHeader title="Claims" />
      <section className="panel">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Claim No.</th>
                <th>Policy</th>
                <th>Client</th>
                <th>Status</th>
                <th>Requested</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="empty-cell">
                  No claims loaded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default ClaimsPage;


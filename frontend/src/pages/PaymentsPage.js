import PageHeader from './shared/PageHeader';

function PaymentsPage() {
  return (
    <>
      <PageHeader title="Payments" />
      <section className="panel">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Policy</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="empty-cell">
                  No payments loaded yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default PaymentsPage;


function PageHeader({ children, title }) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default PageHeader;

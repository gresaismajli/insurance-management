function Notification({ message, type = 'success', onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`alert alert-${type} notification`} role="alert">
      <span>{message}</span>
      <button className="btn-close" onClick={onClose} type="button" />
    </div>
  );
}

export default Notification;


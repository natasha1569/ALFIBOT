export default function AdminModal({
  open,
  title,
  children,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className="modal d-block"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      style={{ background: 'rgba(15, 23, 42, 0.55)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="admin-modal-title">
              {title}
            </h2>
            <button
              aria-label="Cerrar"
              className="btn-close"
              onClick={onClose}
              type="button"
            />
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

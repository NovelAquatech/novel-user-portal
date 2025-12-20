export const BaseModal = ({ isOpen, closeModal, title, children, footer, width = 500 }) => {
  const isMobile = window.innerWidth <= 600;
    const handleBackdropClick = (event) => {
    // Close only if user clicked directly on the backdrop, not inside modal-content
    if (event.target === event.currentTarget) {
      closeModal(event);
    }
  };

  return (
    <div
      className={isOpen ? "modal fade in" : "modal fade"}
      tabIndex="-1"
      role="dialog"
      onClick={handleBackdropClick}
      style={{
        display: isOpen ? "flex" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.3)",
        zIndex: 1050,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="modal-dialog"
        role="document"
        style={{
          width: "100%",
          maxWidth: isMobile ? "80vw" : `${width}px`,
          margin: 0,
        }}
      >
        <div
          className="modal-content"
          style={isMobile ? { borderRadius: 8, fontSize: 14 } : {}}
        >
          {/* Header */}
          <div className="modal-header">
            <button type="button" className="close" onClick={closeModal}>
              <span aria-hidden="true">&times;</span>
            </button>
            {title && <h5 className="modal-title" style={{ fontWeight: 600, fontSize:24 }}>{title}</h5>}
          </div>

          {/* Body */}
          <div className="modal-body">{children}</div>

          {/* Footer */}
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
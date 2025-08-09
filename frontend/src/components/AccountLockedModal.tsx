import React from 'react';
import { Lock, AlertTriangle, Mail, Phone } from 'lucide-react';

// CSS cho animation
const modalStyles = `
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

interface AccountLockedModalProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

const AccountLockedModal: React.FC<AccountLockedModalProps> = ({ 
  show, 
  onClose, 
  message = 'Tài khoản của bạn đã bị khóa' 
}) => {
  if (!show) return null;

  return (
    <>
      <style>{modalStyles}</style>
      <div
        className="modal fade show d-block"
        style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 999999,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            animation: 'fadeInScale 0.3s ease-out',
            maxWidth: '500px',
            width: '90%',
            margin: '0 auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header bg-danger text-white border-0">
            <div className="d-flex align-items-center">
              <Lock size={24} className="me-2" />
              <h5 className="modal-title mb-0">Tài khoản bị khóa</h5>
            </div>
          </div>
          
          <div className="modal-body text-center py-4">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle" 
                   style={{ width: '80px', height: '80px' }}>
                <AlertTriangle size={40} className="text-danger" />
              </div>
            </div>
            
            <h6 className="text-danger mb-3">Truy cập bị từ chối</h6>
            <p className="text-muted mb-4">{message}</p>
            
            <div className="bg-light rounded p-3 mb-4">
              <h6 className="text-dark mb-3">Liên hệ hỗ trợ:</h6>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex align-items-center justify-content-center">
                    <Mail size={16} className="text-primary me-2" />
                    <small className="text-muted">admin@sportstore.com</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center justify-content-center">
                    <Phone size={16} className="text-success me-2" />
                    <small className="text-muted">038-3456-789</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer border-0 justify-content-center">
            <button 
              type="button" 
              className="btn btn-primary px-4"
              onClick={onClose}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountLockedModal;

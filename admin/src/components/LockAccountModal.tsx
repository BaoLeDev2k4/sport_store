import { useState } from 'react';
import { User } from '../types';
import { Lock, AlertTriangle, X } from 'lucide-react';

interface LockAccountModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (lockReason: string) => void;
  user: User | null;
}

const LockAccountModal = ({ show, onClose, onConfirm, user }: LockAccountModalProps) => {
  const [lockReason, setLockReason] = useState('');
  const [step, setStep] = useState<'confirm' | 'reason'>('confirm');

  const handleConfirm = () => {
    if (step === 'confirm') {
      setStep('reason');
    } else {
      if (!lockReason.trim()) {
        alert('Vui lòng nhập lý do khóa tài khoản');
        return;
      }
      onConfirm(lockReason.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setLockReason('');
    setStep('confirm');
    onClose();
  };

  if (!show || !user) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title d-flex align-items-center">
              <Lock size={20} className="me-2" />
              {step === 'confirm' ? 'Xác nhận khóa tài khoản' : 'Nhập lý do khóa tài khoản'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          
          <div className="modal-body">
            {step === 'confirm' ? (
              <>
                <div className="text-center mb-4">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '80px', height: '80px' }}>
                    <AlertTriangle size={40} className="text-danger" />
                  </div>
                  <h6 className="text-danger">Bạn có chắc chắn muốn khóa tài khoản này?</h6>
                </div>

                <div className="bg-light rounded p-3 mb-4">
                  <div className="row">
                    <div className="col-sm-4"><strong>Tên:</strong></div>
                    <div className="col-sm-8">{user.username}</div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4"><strong>Email:</strong></div>
                    <div className="col-sm-8">{user.email}</div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4"><strong>Vai trò:</strong></div>
                    <div className="col-sm-8">
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <strong>⚠️ Lưu ý:</strong> Sau khi khóa, người dùng sẽ không thể đăng nhập vào hệ thống.
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label htmlFor="lockReason" className="form-label">
                    <strong>Lý do khóa tài khoản <span className="text-danger">*</span></strong>
                  </label>
                  <textarea
                    id="lockReason"
                    className="form-control"
                    rows={4}
                    placeholder="Nhập lý do khóa tài khoản (ví dụ: Vi phạm quy định, spam, hành vi không phù hợp...)"
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    maxLength={500}
                  />
                  <div className="form-text">
                    {lockReason.length}/500 ký tự. Lý do này sẽ được hiển thị cho người dùng khi họ đăng nhập.
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Hủy
            </button>
            {step === 'confirm' ? (
              <button type="button" className="btn btn-danger" onClick={handleConfirm}>
                Tiếp tục
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-warning"
                onClick={handleConfirm}
                disabled={!lockReason.trim()}
              >
                Khóa tài khoản
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockAccountModal;

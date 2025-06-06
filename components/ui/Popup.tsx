import React from "react";
import styles from "@/css/popup.module.css";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        {title && (
          <div className={styles.popupHeader}>
            <h2 className={styles.popupTitle}>{title}</h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close popup"
            >
              &times;
            </button>
          </div>
        )}
        <div className={styles.popupContent}>{children}</div>
      </div>
    </div>
  );
};

export default Popup;
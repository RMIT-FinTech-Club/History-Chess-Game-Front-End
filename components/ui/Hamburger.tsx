import styles from "@/css/hamburger.module.css";
import { useRef } from "react";

interface HamburgerProps {
  onClick?: () => void;
}

const Hamburger = ({ onClick }: HamburgerProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleMenuClick = () => {
    const menu = menuRef.current;
    if (!menu) return;

    if (menu.classList.contains(styles.opened)) {
      menu.classList.remove(styles.opened);
      menu.classList.add(styles.closed);
    } else {
      menu.classList.add(styles.opened);
      menu.classList.remove(styles.closed);
    }

    // Gọi callback để mở/đóng sidebar
    if (onClick) onClick();
  };

  return (
    <div
      ref={menuRef}
      onClick={handleMenuClick}
      className="h-[5vh] aspect-square bg-gradient-to-b from-[#E8BB05] via-[#B98F00] to-[#7A651C] hover:from-[#D6A900] hover:via-[#A68E3C] hover:to-[#8F7A2B] rounded-[1vh] z-50 relative transition-colors cursor-pointer duration-300"
    >
      <div className={`${styles.hamburger_item} ${styles.item1}`}></div>
      <div className={`${styles.hamburger_item} ${styles.item2}`}></div>
      <div className={`${styles.hamburger_item} ${styles.item3}`}></div>
    </div>
  );
};

export default Hamburger;
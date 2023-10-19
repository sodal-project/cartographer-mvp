import React, { useRef, useEffect } from "react";

export default function OutsideClick({
  children,
  onClickOutside
}) {
  const ref = useRef(null);
    
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside();
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickOutside]);

  return <div ref={ref}>{children}</div>;
}

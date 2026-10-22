import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        {totalItems ? (
          <span>
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
        )}
      </div>

      <div className={styles.controls}>
        <button
          className={styles.pageBtn}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === currentPage ? styles.activePage : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className={styles.pageBtn}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
